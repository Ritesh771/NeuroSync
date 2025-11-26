import { db } from "@/utils/db";
import { FinalInterviewReport } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      mockId,
      userEmail,
      round1Score,
      round2Score,
      round3Score,
      overallScore,
      hiringDecision,
      strengths,
      weaknesses,
      improvementRoadmap,
      createdAt
    } = body;

    const result = await db.insert(FinalInterviewReport).values({
      mockId,
      userEmail,
      round1Score,
      round2Score,
      round3Score,
      overallScore,
      hiringDecision,
      strengths,
      weaknesses,
      improvementRoadmap,
      createdAt,
    }).returning();

    return NextResponse.json({ success: true, report: result[0] });
  } catch (error) {
    console.error('Error saving final report:', error);
    return NextResponse.json({ error: 'Failed to save final report' }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mockId = searchParams.get('mockId');

  if (!mockId) {
    return NextResponse.json({ error: 'mockId is required' }, { status: 400 });
  }

  try {
    const result = await db
      .select()
      .from(FinalInterviewReport)
      .where(eq(FinalInterviewReport.mockId, mockId))
      .limit(1);

    return NextResponse.json({ report: result[0] || null });
  } catch (error) {
    console.error('Error fetching final report:', error);
    return NextResponse.json({ error: 'Failed to fetch final report' }, { status: 500 });
  }
}