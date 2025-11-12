import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only protect routes if we have a valid Clerk key
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/forum(.*)"]);

export default clerkMiddleware((auth, req) => {
  // Skip authentication in development mode or when keys are not set
  if (process.env.NODE_ENV === 'development') {
    return;
  }
  
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};