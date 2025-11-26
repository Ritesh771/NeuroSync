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
  console.log("Using simplified extraction (no AI dependencies)");

  // Return test data to verify the upload works
  return {
    skills: ["Python", "JavaScript", "React"],
    experience: "Test experience data",
    education: "Test education data", 
    projects: "Test projects data"
  };
}

function extractResumeDataFallback(text) {
  console.log("Starting improved fallback extraction for resume text length:", text.length);
  console.log("First 1000 characters:", text.substring(0, 1000));

  // Initialize results
  let skills = [];
  let experience = "";
  let education = "";
  let projects = "";

  // Try multiple regex patterns for each section
  const patterns = {
    skills: [
      /(?:SKILLS|skills|technical skills|technologies|competencies|expertise)[\s\S]*?(?=\n\s*(?:WORK EXPERIENCE|EXPERIENCE|EDUCATION|PROJECTS|CERTIFICATIONS|$))/i,
      /(?:SKILLS|skills|technical skills|technologies|competencies|expertise)[\s\S]*?(?=\n\s*(?:experience|education|projects|$))/i
    ],
    experience: [
      /(?:WORK EXPERIENCE|work experience|experience|professional experience|employment|career)[\s\S]*?(?=\n\s*(?:EDUCATION|education|PROJECTS|projects|SKILLS|skills|$))/i,
      /(?:WORK EXPERIENCE|work experience|experience|professional experience|employment|career)[\s\S]*?(?=\n\s*(?:education|projects|skills|$))/i
    ],
    education: [
      /(?:EDUCATION|education|academic background|qualifications|academic|degree)[\s\S]*?(?=\n\s*(?:PROJECTS|projects|WORK EXPERIENCE|experience|SKILLS|skills|$))/i,
      /(?:EDUCATION|education|academic background|qualifications|academic|degree)[\s\S]*?(?=\n\s*(?:projects|experience|skills|$))/i
    ],
    projects: [
      /(?:PROJECTS|projects|personal projects|key projects|portfolio)[\s\S]*?(?=\n\s*(?:SKILLS|skills|WORK EXPERIENCE|experience|EDUCATION|education|$))/i,
      /(?:PROJECTS|projects|personal projects|key projects|portfolio)[\s\S]*?(?=\n\s*(?:skills|experience|education|$))/i
    ]
  };

  const sections = {};

  for (const [sectionName, sectionPatterns] of Object.entries(patterns)) {
    for (const pattern of sectionPatterns) {
      const match = text.match(pattern);
      if (match && match[0] && match[0].trim().length > 10) {
        // Remove the header from the content
        let content = match[0].replace(/^(?:SKILLS|skills|technical skills|technologies|competencies|expertise|WORK EXPERIENCE|work experience|experience|professional experience|employment|career|EDUCATION|education|academic background|qualifications|academic|degree|PROJECTS|projects|personal projects|key projects|portfolio)[\s\S]*?\n/i, '');
        content = content.trim();
        if (content.length > 0) {
          sections[sectionName] = content;
          console.log(`Found ${sectionName} section with regex:`, content.substring(0, 200) + '...');
          break;
        }
      }
    }
  }

  console.log("Sections found with regex:", Object.keys(sections));

  // Extract skills
  if (sections.skills) {
    console.log("Skills section content:", sections.skills.substring(0, 300));

    // Extract skills from bullet points, commas, and lines
    const skillPatterns = [
      /•\s*([^•\n]{3,50})/g,  // Bullet points
      /-\s*([^-\n]{3,50})/g,   // Dash points
      /([^,]{3,30}),/g         // Comma separated
    ];

    const foundSkills = new Set();

    for (const pattern of skillPatterns) {
      const matches = sections.skills.matchAll(pattern);
      for (const match of matches) {
        const skill = match[1].trim();
        if (skill.length > 2 && skill.length < 50 && !skill.includes('—')) {
          foundSkills.add(skill);
        }
      }
    }

    // Also add common tech skills if mentioned
    const techSkills = ['Python', 'JavaScript', 'React', 'Django', 'Flask', 'SQL', 'MySQL', 'PostgreSQL', 'Git', 'AWS', 'Docker'];
    for (const skill of techSkills) {
      if (sections.skills.toLowerCase().includes(skill.toLowerCase())) {
        foundSkills.add(skill);
      }
    }

    skills = Array.from(foundSkills);
    console.log("Extracted skills:", skills);
  }

  // Extract experience
  if (sections.experience) {
    console.log("Experience section content length:", sections.experience.length);
    experience = sections.experience
      .replace(/\s+/g, ' ')
      .substring(0, 1000);
    if (experience.length > 800) {
      experience = experience.substring(0, 800) + "...";
    }
    console.log("Extracted experience preview:", experience.substring(0, 100));
  }

  // Extract education
  if (sections.education) {
    console.log("Education section content length:", sections.education.length);
    education = sections.education
      .replace(/\s+/g, ' ')
      .substring(0, 500);
    console.log("Extracted education preview:", education.substring(0, 100));
  }

  // Extract projects
  if (sections.projects) {
    console.log("Projects section content length:", sections.projects.length);
    projects = sections.projects
      .replace(/\s+/g, ' ')
      .substring(0, 1000);
    if (projects.length > 600) {
      projects = projects.substring(0, 600) + "...";
    }
    console.log("Extracted projects preview:", projects.substring(0, 100));
  }

  const result = {
    skills: skills.length > 0 ? skills : [],
    experience: experience || "",
    education: education || "",
    projects: projects || "",
  };

  console.log("Final extraction result:", {
    skillsCount: result.skills.length,
    experienceLength: result.experience.length,
    educationLength: result.education.length,
    projectsLength: result.projects.length,
    skills: result.skills,
    experiencePreview: result.experience.substring(0, 100),
    educationPreview: result.education.substring(0, 100),
    projectsPreview: result.projects.substring(0, 100)
  });

  return result;
}

export async function POST(request) {
  try {
    console.log("Resume upload started");
    const userId = getUserIdFromSession(request);
    console.log("User ID from session:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("resume");
    console.log("File received:", file ? file.name : "No file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Extract text from file
    console.log("Starting text extraction from file...");
    const resumeText = await extractTextFromFile(file);
    console.log("Extracted text from file, length:", resumeText.length);
    console.log("First 500 characters:", resumeText.substring(0, 500));

    // Extract structured data using Gemini
    console.log("Starting data extraction...");
    const extractedData = await extractResumeData(resumeText);
    console.log("Final extracted data:", JSON.stringify(extractedData, null, 2));

    // Store in database - update existing or insert new
    console.log("Storing data in database...");
    try {
      const existingResume = await db.select().from(ResumeData).where(eq(ResumeData.userId, userId)).orderBy(ResumeData.uploadedAt, "desc").limit(1);
      console.log("Existing resume check result:", existingResume.length);
      
      if (existingResume.length > 0) {
        // Update existing record
        console.log("Updating existing record ID:", existingResume[0].id);
        await db.update(ResumeData).set({
          resumeText,
          skills: extractedData.skills ? JSON.stringify(extractedData.skills) : null,
          experience: extractedData.experience || null,
          education: extractedData.education || null,
          projects: extractedData.projects || null,
          uploadedAt: new Date(),
        }).where(eq(ResumeData.id, existingResume[0].id));
        console.log("Existing resume data updated");
      } else {
        // Insert new record
        console.log("Inserting new record");
        await db.insert(ResumeData).values({
          userId,
          resumeText,
          skills: extractedData.skills ? JSON.stringify(extractedData.skills) : null,
          experience: extractedData.experience || null,
          education: extractedData.education || null,
          projects: extractedData.projects || null,
        });
        console.log("New resume data inserted");
      }

      // Update user to mark as not first login
      console.log("Updating user first login status");
      await db.update(User).set({ isFirstLogin: false }).where(eq(User.id, userId));
      console.log("User updated");
    } catch (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    const responseData = { 
      message: "Resume uploaded and processed successfully",
      extractedData: extractedData,
      resumeTextLength: resumeText.length
    };
    console.log("Sending response:", JSON.stringify(responseData, null, 2));
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';