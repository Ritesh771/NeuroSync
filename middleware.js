import { NextResponse } from "next/server";

// Only protect routes that should be authenticated
const PROTECTED_ROUTES = ["/dashboard", "/resume-upload"];

function isProtectedPath(pathname) {
  return PROTECTED_ROUTES.some((p) => pathname.startsWith(p));
}

// Middleware that validates session token from cookie
export async function middleware(req) {
  // Skip authentication in development for convenience
  if (process.env.NODE_ENV === "development") {
    console.log("Development mode - skipping auth middleware");
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  if (!isProtectedPath(pathname)) return NextResponse.next();

  // Get session token from cookie
  const cookie = req.headers.get("cookie") || "";
  const sessionMatch = cookie.match(/session=([^;]+)/);
  const sessionToken = sessionMatch ? sessionMatch[1] : null;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Validate session token (simple check: session_userId_timestamp)
  const parts = sessionToken.split("_");
  if (parts.length !== 3 || parts[0] !== "session") {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const userId = parseInt(parts[1]);
  if (isNaN(userId)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Dynamically import database modules only when needed
  try {
    const { db } = await import("./utils/db");
    const { User } = await import("./utils/schema");
    const { eq } = await import("drizzle-orm");

    // Check if user exists
    const users = await db.select().from(User).where(eq(User.id, userId)).limit(1);
    if (users.length === 0) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  } catch (error) {
    console.error("Middleware auth error:", error);
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match app routes (excluding _next and files) and API routes
  matcher: ["/((?!.*\\..*|_next).*)", "/(api|trpc)(.*)"],
};

// Force Node.js runtime for middleware since we need database access
export const runtime = 'nodejs';