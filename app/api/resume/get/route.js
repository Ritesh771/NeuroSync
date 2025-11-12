import { NextResponse } from "next/server";
import { db } from "../../../../utils/db";
import { ResumeData } from "../../../../utils/schema";
import { eq } from "drizzle-orm";

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

export async function GET(request) {
  try {
    const userId = getUserIdFromSession(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the latest resume data for the user
    const resumeRecords = await db
      .select()
      .from(ResumeData)
      .where(eq(ResumeData.userId, userId))
      .orderBy(ResumeData.uploadedAt, "desc")
      .limit(1);

    if (resumeRecords.length === 0) {
      return NextResponse.json(null);
    }

    const resume = resumeRecords[0];
    console.log("Raw resume data from database:", {
      id: resume.id,
      userId: resume.userId,
      resumeTextLength: resume.resumeText ? resume.resumeText.length : 0,
      skills: resume.skills,
      experience: resume.experience,
      education: resume.education,
      projects: resume.projects,
      uploadedAt: resume.uploadedAt
    });

    // Parse the skills JSON if it exists
    let skills = [];
    if (resume.skills) {
      try {
        skills = JSON.parse(resume.skills);
      } catch (error) {
        console.error("Error parsing skills JSON:", error);
      }
    }

    const result = {
      skills,
      experience: resume.experience,
      education: resume.education,
      projects: resume.projects,
      // Add debug information
      debug: {
        rawSkills: resume.skills,
        resumeTextLength: resume.resumeText ? resume.resumeText.length : 0,
        resumeTextPreview: resume.resumeText ? resume.resumeText.substring(0, 1000) + "..." : null,
        hasExperience: !!resume.experience,
        hasEducation: !!resume.education,
        hasProjects: !!resume.projects,
        skillsCount: skills.length
      }
    };

    console.log("Processed resume data:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching resume data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';