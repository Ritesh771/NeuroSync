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
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        // Get user ID from email
        const users = await db.select().from(User).where(eq(User.email, email)).limit(1);
        if (users.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userId = users[0].id;

        // Get resume data
        const resumeData = await db
            .select()
            .from(ResumeData)
            .where(eq(ResumeData.userId, userId))
            .orderBy(ResumeData.uploadedAt, "desc")
            .limit(1);

        if (resumeData.length === 0) {
            return NextResponse.json({ resumeData: null });
        }

        return NextResponse.json({ resumeData: resumeData[0] });
    } catch (error) {
        console.error("Resume data fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
