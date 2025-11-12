import { NextResponse } from "next/server";
import { db } from "../../../../utils/db";
import { ResumeData, User } from "../../../../utils/schema";
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

    // Get all resume data for the user
    const resumeRecords = await db
      .select()
      .from(ResumeData)
      .where(eq(ResumeData.userId, userId))
      .orderBy(ResumeData.uploadedAt, "desc");

    // Get user info
    const userRecords = await db
      .select()
      .from(User)
      .where(eq(User.id, userId));

    const result = {
      user: userRecords[0],
      resumeRecords: resumeRecords.map(record => ({
        id: record.id,
        userId: record.userId,
        resumeTextLength: record.resumeText ? record.resumeText.length : 0,
        resumeTextPreview: record.resumeText ? record.resumeText.substring(0, 1500) + "..." : null,
        skills: record.skills,
        experience: record.experience,
        education: record.education,
        projects: record.projects,
        uploadedAt: record.uploadedAt
      }))
    };

    console.log("Database inspection result:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error inspecting database:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';