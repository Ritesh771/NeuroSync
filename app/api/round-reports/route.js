import { db } from "@/utils/db";
import { RoundReport } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { mockId, roundNumber, agentType, averageScore, summaryReport, recommendation, strengths, weaknesses, createdAt } = body;

    const result = await db.insert(RoundReport).values({
      mockId,
      roundNumber,
      agentType,
      averageScore,
      summaryReport,
      recommendation,
      strengths,
      weaknesses,
      createdAt,
    }).returning();

    return NextResponse.json({ success: true, report: result[0] });
  } catch (error) {
    console.error('Error saving round report:', error);
    return NextResponse.json({ error: 'Failed to save round report' }, { status: 500 });
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
      .from(RoundReport)
      .where(eq(RoundReport.mockId, mockId))
      .orderBy(RoundReport.roundNumber);

    return NextResponse.json({ reports: result });
  } catch (error) {
    console.error('Error fetching round reports:', error);
    return NextResponse.json({ error: 'Failed to fetch round reports' }, { status: 500 });
  }
}