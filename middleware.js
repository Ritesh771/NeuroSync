import { NextResponse } from "next/server";

// Only protect routes that should be authenticated
const PROTECTED_ROUTES = ["/dashboard", "/forum"];

function isProtectedPath(pathname) {
  return PROTECTED_ROUTES.some((p) => pathname.startsWith(p));
}

// Simple middleware that validates a shared token (SIMPLE_AUTH_TOKEN)
export function middleware(req) {
  // Skip authentication in development for convenience
  if (process.env.NODE_ENV === "development") return NextResponse.next();

  const { pathname } = req.nextUrl;

  if (!isProtectedPath(pathname)) return NextResponse.next();

  // Look for token in cookie or header
  const headerToken = req.headers.get("x-simple-auth");
  const cookie = req.headers.get("cookie") || "";
  const cookieMatch = cookie.match(/simple_auth=([^;]+)/);
  const cookieToken = cookieMatch ? cookieMatch[1] : null;

  const expected = process.env.SIMPLE_AUTH_TOKEN || null;

  if (!expected) {
    // If no server-side token configured, block access (safe default)
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const token = headerToken || cookieToken;
  if (token === expected) return NextResponse.next();

  // Redirect unauthenticated requests to sign-in
  return NextResponse.redirect(new URL("/sign-in", req.url));
}

export const config = {
  // Match app routes (excluding _next and files) and API routes
  matcher: ["/((?!.*\\..*|_next).*)", "/(api|trpc)(.*)"],
};