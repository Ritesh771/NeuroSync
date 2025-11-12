import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "../../../../utils/db";
import { User } from "../../../../utils/schema";
import { eq } from "drizzle-orm";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Find user
    const users = await db.select().from(User).where(eq(User.email, email)).limit(1);
    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = users[0];

    // Check password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate session token (simple for now, in production use JWT)
    const sessionToken = `session_${user.id}_${Date.now()}`;

    // Do not update isFirstLogin here, it will be updated after resume upload

    return NextResponse.json({
      sessionToken,
      isFirstLogin: user.isFirstLogin,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}