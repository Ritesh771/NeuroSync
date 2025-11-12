import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "../../../../utils/db";
import { User } from "../../../../utils/schema";
import { eq } from "drizzle-orm";

export async function POST(request) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.select().from(User).where(eq(User.email, email)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    await db.insert(User).values({
      email,
      passwordHash,
      firstName,
      lastName,
    });

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    console.error("Sign-up error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}