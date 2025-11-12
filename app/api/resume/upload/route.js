import { NextResponse } from "next/server";
import { db } from "../../../../utils/db";
import { User, ResumeData } from "../../../../utils/schema";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import os from "os";
import { promisify } from "util";
import extract from "pdf-text-extract";

const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);

function getUserIdFromSession(request) {
  const cookie = request.headers.get("cookie") || "";
  const sessionMatch = cookie.match(/session=([^;]+)/);
  const sessionToken = sessionMatch ? decodeURIComponent(sessionMatch[1]) : null;

  if (!sessionToken) return null;

  const parts = sessionToken.split("_");
  if (parts.length !== 3 || parts[0] !== "session") return null;

  const userId = parseInt(parts[1]);
  return isNaN(userId) ? null : userId;
}

async function extractTextFromFile(file) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    // Write buffer to temp file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `temp_${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, buffer);

    try {
      // Extract text using pdf-text-extract
      const pages = await promisify(extract)(tempFilePath);
      return pages.join('\n');
    } finally {
      // Clean up temp file
      fs.unlinkSync(tempFilePath);
    }
  } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const { default: mammoth } = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else {
    throw new Error("Unsupported file type");
  }
}

async function extractResumeData(text) {
  try {
    console.log("Attempting Gemini AI extraction...");

    // Try different model names in case gemini-pro is deprecated
    const modelNames = ["gemini-1.5-pro", "gemini-pro", "gemini-pro-vision"];
    let model;

    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        console.log(`Using Gemini model: ${modelName}`);
        break;
      } catch (error) {
        console.log(`Model ${modelName} not available, trying next...`);
        continue;
      }
    }

    if (!model) {
      throw new Error("No available Gemini model found");
    }

    const prompt = `
Extract the following information from the resume text. Return as JSON with these keys:
- skills: array of technical skills and technologies
- experience: summary of work experience and job roles
- education: summary of education and qualifications
- projects: summary of projects and achievements

Be specific and extract actual information from the resume. If a section is not found, use "Not specified".

Resume text:
${text}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonText = response.text().trim();

    console.log("Gemini AI response received, length:", jsonText.length);

    // Clean up the response
    jsonText = jsonText.replace(/```json\n?|\n?```/g, "").trim();

    // Try to parse the JSON
    const parsedData = JSON.parse(jsonText);

    // Validate the structure
    if (!parsedData.skills || !Array.isArray(parsedData.skills)) {
      throw new Error("Invalid skills format");
    }

    console.log("Gemini AI extraction successful");
    return parsedData;
  } catch (error) {
    console.error("Gemini AI error:", error);
    console.log("Falling back to regex extraction...");
    // Fallback: extract data using simple regex patterns
    return extractResumeDataFallback(text);
  }
}

function extractResumeDataFallback(text) {
  console.log("Starting fallback extraction for resume text length:", text.length);

  const lowerText = text.toLowerCase();

  // Extract skills using common keywords and also look for skills section
  const skillKeywords = [
    'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
    'html', 'css', 'sass', 'bootstrap', 'tailwind',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis',
    'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
    'linux', 'windows', 'macos',
    'agile', 'scrum', 'kanban', 'typescript', 'next.js', 'redux'
  ];

  const skills = skillKeywords.filter(skill =>
    lowerText.includes(skill.toLowerCase())
  );

  // Look for skills section with more flexible patterns
  const skillsSectionPatterns = [
    /(?:SKILLS|skills|technical skills|technologies|competencies|expertise)([\s\S]*?)(?=\n\s*(?:experience|EXPERIENCE|education|EDUCATION|projects|PROJECTS|certifications|CERTIFICATIONS|$))/i,
    /(?:core competencies|key skills|programming skills)([\s\S]*?)(?=\n\s*(?:experience|EXPERIENCE|$))/i
  ];

  for (const pattern of skillsSectionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const skillsText = match[1];
      console.log("Found skills section:", skillsText.substring(0, 200) + "...");

      // Extract skills from bullet points and lines
      const additionalSkills = skillsText
        .split(/[,\n•\-•▪►→]/)
        .map(s => s.trim())
        .filter(s => s.length > 1 && s.length < 50 && !s.includes('—') && !s.includes('•'))
        .filter(s => !skillKeywords.some(keyword => s.toLowerCase().includes(keyword.toLowerCase())));
      skills.push(...additionalSkills.slice(0, 15)); // Add up to 15 more skills
      break;
    }
  }

  // Extract experience with more flexible patterns
  let experience = "No work experience information found";
  const experiencePatterns = [
    /\n(WORK EXPERIENCE|work experience|professional experience|employment|EXPERIENCE|career|CAREER)\n([\s\S]*?)(?=\n\s*(?:EDUCATION|education|projects|PROJECTS|skills|SKILLS|$))/i,
    /\n(work history|career history|WORK HISTORY|CAREER HISTORY|professional background)\n([\s\S]*?)(?=\n\s*(?:EDUCATION|education|$))/i,
    /(?:EXPERIENCE|experience)([\s\S]*?)(?=\n\s*(?:EDUCATION|education|projects|PROJECTS|$))/i
  ];

  for (const pattern of experiencePatterns) {
    const match = text.match(pattern);
    if (match && match[2] && match[2].trim().length > 20) {
      experience = match[2].trim();
      console.log("Found experience section, length:", experience.length);
      // Clean up and limit length
      experience = experience.replace(/\s+/g, ' ').substring(0, 1000);
      if (experience.length > 800) {
        experience = experience.substring(0, 800) + "...";
      }
      break;
    } else if (match && match[1] && match[1].trim().length > 20) {
      experience = match[1].trim();
      console.log("Found experience section (alt pattern), length:", experience.length);
      experience = experience.replace(/\s+/g, ' ').substring(0, 1000);
      if (experience.length > 800) {
        experience = experience.substring(0, 800) + "...";
      }
      break;
    }
  }

  // If no experience found with headers, try to find job titles and companies
  if (experience === "No work experience information found") {
    const jobPatterns = [
      /(?:Software Developer|Developer|Engineer|Intern|Analyst|Manager|Lead|Senior|Junior|Full Stack|Frontend|Backend|DevOps|Data Scientist|Product Manager|Designer)/gi,
      /(?:at|@)\s*([A-Za-z\s&.,]+?)(?:\s*\||\s*\n|\s*,|\s*\(|\s*$)/gi
    ];

    const jobsFound = [];
    for (const pattern of jobPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        jobsFound.push(...matches.slice(0, 3)); // Take first 3 matches
      }
    }

    if (jobsFound.length > 0) {
      experience = jobsFound.join(", ");
      console.log("Found jobs via pattern matching:", experience);
    }
  }
  let education = "No education information found";
  const educationPatterns = [
    /\n(EDUCATION|education|academic background|qualifications|ACADEMIC|DEGREE)\n([\s\S]*?)(?=\n\s*(?:PROJECTS|projects|experience|EXPERIENCE|skills|SKILLS|$))/i,
    /\n(academic|degree|bachelor|master|phd|ACADEMIC|DEGREE|BACHELOR|MASTER|PHD)\n([\s\S]*?)(?=\n\s*(?:PROJECTS|projects|$))/i,
    /(?:EDUCATION|education)([\s\S]*?)(?=\n\s*(?:PROJECTS|projects|experience|EXPERIENCE|$))/i
  ];

  for (const pattern of educationPatterns) {
    const match = text.match(pattern);
    if (match && match[2] && match[2].trim().length > 10) {
      education = match[2].trim();
      console.log("Found education section, length:", education.length);
      education = education.replace(/\s+/g, ' ').substring(0, 500);
      break;
    } else if (match && match[1] && match[1].trim().length > 10) {
      education = match[1].trim();
      console.log("Found education section (alt pattern), length:", education.length);
      education = education.replace(/\s+/g, ' ').substring(0, 500);
      break;
    }
  }

  // If no education found, look for degree keywords
  if (education === "No education information found") {
    const degreePatterns = [
      /(?:Bachelor|B\.|Master|M\.|PhD|Doctorate|Bachelor's|Master's|Associate|A\.|Diploma|Certificate)(?:\s+of\s+|\s+in\s+)?([A-Za-z\s]+)/gi,
      /(?:Engineering|Computer Science|Information Technology|Business|Arts|Science|Mathematics|Physics|Chemistry|Biology)/gi
    ];

    const degreesFound = [];
    for (const pattern of degreePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        degreesFound.push(...matches.slice(0, 2));
      }
    }

    if (degreesFound.length > 0) {
      education = degreesFound.join(", ");
      console.log("Found degrees via pattern matching:", education);
    }
  }
  let projects = "No projects information found";
  const projectPatterns = [
    /\n(PROJECTS|projects|personal projects|key projects|portfolio|PORTFOLIO)\n([\s\S]*?)(?=\n\s*(?:SKILLS|skills|experience|EXPERIENCE|education|EDUCATION|certifications|CERTIFICATIONS|$))/i,
    /\n(project|portfolio|PROJECT|PORTFOLIO)\n([\s\S]*?)(?=\n\s*(?:SKILLS|skills|certifications|CERTIFICATIONS|$))/i,
    /(?:PROJECTS|projects)([\s\S]*?)(?=\n\s*(?:SKILLS|skills|experience|EXPERIENCE|$))/i
  ];

  for (const pattern of projectPatterns) {
    const match = text.match(pattern);
    if (match && match[2] && match[2].trim().length > 20) {
      projects = match[2].trim();
      console.log("Found projects section, length:", projects.length);
      projects = projects.replace(/\s+/g, ' ').substring(0, 1000);
      if (projects.length > 600) {
        projects = projects.substring(0, 600) + "...";
      }
      break;
    } else if (match && match[1] && match[1].trim().length > 20) {
      projects = match[1].trim();
      console.log("Found projects section (alt pattern), length:", projects.length);
      projects = projects.replace(/\s+/g, ' ').substring(0, 1000);
      if (projects.length > 600) {
        projects = projects.substring(0, 600) + "...";
      }
      break;
    }
  }

  // If no projects found, look for project keywords
  if (projects === "No projects information found") {
    const projectKeywords = ['project', 'application', 'system', 'website', 'app', 'platform', 'tool'];
    const projectLines = text.split('\n').filter(line =>
      projectKeywords.some(keyword => line.toLowerCase().includes(keyword)) &&
      line.length > 20 && line.length < 200
    );

    if (projectLines.length > 0) {
      projects = projectLines.slice(0, 3).join('. ');
      console.log("Found projects via keyword matching:", projects);
    }
  }

  const result = {
    skills: skills.length > 0 ? [...new Set(skills)] : ["Skills to be updated"],
    experience: experience,
    education: education,
    projects: projects,
  };

  console.log("Fallback extraction result:", {
    skillsCount: result.skills.length,
    experienceLength: result.experience.length,
    educationLength: result.education.length,
    projectsLength: result.projects.length
  });

  return result;
}

export async function POST(request) {
  try {
    const userId = getUserIdFromSession(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("resume");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Extract text from file
    const resumeText = await extractTextFromFile(file);
    console.log("Extracted text from file, length:", resumeText.length);
    console.log("First 500 characters:", resumeText.substring(0, 500));

    // Extract structured data using Gemini
    const extractedData = await extractResumeData(resumeText);
    console.log("Final extracted data:", extractedData);

    // Store in database
    await db.insert(ResumeData).values({
      userId,
      resumeText,
      skills: extractedData.skills ? JSON.stringify(extractedData.skills) : null,
      experience: extractedData.experience || null,
      education: extractedData.education || null,
      projects: extractedData.projects || null,
    });

    // Update user to mark as not first login
    await db.update(User).set({ isFirstLogin: false }).where(eq(User.id, userId));

    return NextResponse.json({ message: "Resume uploaded and processed successfully" });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';