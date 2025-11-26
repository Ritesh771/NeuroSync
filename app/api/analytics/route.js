import { NextResponse } from "next/server";
import { db } from "../../../utils/db";
import { MOCKInterview, UserAnswer } from "../../../utils/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        // Get all interviews for the user
        const interviews = await db
            .select()
            .from(MOCKInterview)
            .where(eq(MOCKInterview.createdBy, email));

        // Get all answers for the user
        const answers = await db
            .select()
            .from(UserAnswer)
            .where(eq(UserAnswer.useEmail, email));

        // Calculate statistics
        const interviewsWithScores = interviews.map((interview) => {
            const interviewAnswers = answers.filter(
                (ans) => ans.mockIdRef === interview.mockId
            );

            if (interviewAnswers.length === 0) {
                return {
                    ...interview,
                    avgScore: 0,
                    problemSolving: 0,
                    technicalAccuracy: 0,
                    communication: 0,
                };
            }

            const avgProblemSolving =
                interviewAnswers.reduce((sum, ans) => sum + (ans.hiringManagerScore || 0), 0) /
                interviewAnswers.length;
            const avgTechnicalAccuracy =
                interviewAnswers.reduce((sum, ans) => sum + (ans.technicalRecruiterScore || 0), 0) /
                interviewAnswers.length;
            const avgCommunication =
                interviewAnswers.reduce((sum, ans) => sum + (ans.panelLeadScore || 0), 0) /
                interviewAnswers.length;
            const avgOverall =
                interviewAnswers.reduce((sum, ans) => sum + (ans.overallScore || 0), 0) /
                interviewAnswers.length;

            return {
                jobPosition: interview.jobPosition,
                createdAt: interview.createdAt,
                avgScore: Math.round(avgOverall),
                problemSolving: Math.round(avgProblemSolving),
                technicalAccuracy: Math.round(avgTechnicalAccuracy),
                communication: Math.round(avgCommunication),
            };
        });

        // Overall stats
        const totalInterviews = interviews.length;
        const allScores = interviewsWithScores.filter((i) => i.avgScore > 0);

        const stats = {
            totalInterviews,
            avgOverallScore: allScores.length > 0
                ? Math.round(allScores.reduce((sum, i) => sum + i.avgScore, 0) / allScores.length)
                : 0,
            avgProblemSolving: allScores.length > 0
                ? Math.round(allScores.reduce((sum, i) => sum + i.problemSolving, 0) / allScores.length)
                : 0,
            avgTechnicalAccuracy: allScores.length > 0
                ? Math.round(allScores.reduce((sum, i) => sum + i.technicalAccuracy, 0) / allScores.length)
                : 0,
            avgCommunication: allScores.length > 0
                ? Math.round(allScores.reduce((sum, i) => sum + i.communication, 0) / allScores.length)
                : 0,
        };

        return NextResponse.json({
            interviews: interviewsWithScores,
            stats,
        });
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
