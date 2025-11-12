import { db } from "@/utils/db";
import { MOCKInterview } from "@/utils/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const result = await db
      .select()
      .from(MOCKInterview)
      .where(eq(MOCKInterview.createdBy, email))
      .orderBy(desc(MOCKInterview.id));

    return NextResponse.json({ interviews: result });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 });
  }
}