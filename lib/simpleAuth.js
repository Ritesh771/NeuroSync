// Simple token-based authentication provider.
// Reads token from cookie and validates against SIMPLE_AUTH_TOKEN.
// Provides user data for the app.

import React, { useState, useEffect } from "react";

export function useUser() {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR guard

    // Read token from cookie
    const cookie = document.cookie;
    const cookieMatch = cookie.match(/simple_auth=([^;]+)/);
    const token = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;

    // Validate token (simple check against env)
    const expected = process.env.NEXT_PUBLIC_SIMPLE_AUTH_TOKEN || "test_token_123"; // Fallback for client-side
    if (token === expected) {
      // Dummy user data - in real app, fetch from DB based on token
      setUser({
        id: "user_123",
        primaryEmailAddress: {
          emailAddress: "user@example.com"
        },
        firstName: "Test",
        lastName: "User",
      });
      setIsSignedIn(true);
    } else {
      setUser(null);
      setIsSignedIn(false);
    }
  }, []);

  return { user, isSignedIn };
}

export function UserButton(props) {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn) {
    return (
      <button
        {...props}
        onClick={() => (window.location.href = "/sign-in")}
        className={props.className}
      >
        Sign In
      </button>
    );
  }

  return (
    <button
      {...props}
      onClick={(e) => {
        // Sign out: clear cookie
        document.cookie = "simple_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.reload();
        if (props && props.onClick) props.onClick(e);
      }}
      className={props.className}
    >
      {props.children || `Hi, ${user.firstName}`}
    </button>
  );
}

export function SignIn() {
  return (
    <div>
      <p>Sign-in is handled by the simple auth flow. Go to <a href="/sign-in">Sign in</a>.</p>
    </div>
  );
}

export function SignUp() {
  return (
    <div>
      <p>Sign-up is handled by the simple auth flow. Go to <a href="/sign-up">Sign up</a>.</p>
    </div>
  );
}

export const ClerkProvider = ({ children }) => children;

export default {};
