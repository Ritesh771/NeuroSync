import { db } from "@/utils/db";
import { MOCKInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mockId = searchParams.get('mockId');

  if (!mockId) {
    return NextResponse.json({ error: 'mockId is required' }, { status: 400 });
  }

  try {
    const result = await db
      .select()
      .from(MOCKInterview)
      .where(eq(MOCKInterview.mockId, mockId));

    return NextResponse.json({ interview: result[0] || null });
  } catch (error) {
    console.error('Error fetching interview details:', error);
    return NextResponse.json({ error: 'Failed to fetch interview details' }, { status: 500 });
  }
}