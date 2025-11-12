// Authentication provider using database sessions.
// Reads session token from cookie and validates against database.

import React, { useState, useEffect } from "react";

export function useUser() {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      if (typeof window === 'undefined') return;

      // Read session token from cookie
      const cookie = document.cookie;
      const sessionMatch = cookie.match(/session=([^;]+)/);
      const sessionToken = sessionMatch ? decodeURIComponent(sessionMatch[1]) : null;

      if (!sessionToken) {
        setUser(null);
        setIsSignedIn(false);
        setLoading(false);
        return;
      }

      // Validate session token and fetch user
      try {
        const response = await fetch("/api/auth/validate-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionToken }),
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsSignedIn(true);
        } else {
          setUser(null);
          setIsSignedIn(false);
        }
      } catch (error) {
        console.error("Error validating session:", error);
        setUser(null);
        setIsSignedIn(false);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, isSignedIn, loading };
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
        // Sign out: clear session cookie
        document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
      <p>Sign-in is handled by the auth flow. Go to <a href="/sign-in">Sign in</a>.</p>
    </div>
  );
}

export function SignUp() {
  return (
    <div>
      <p>Sign-up is handled by the auth flow. Go to <a href="/sign-up">Sign up</a>.</p>
    </div>
  );
}

export const ClerkProvider = ({ children }) => children;

export default {};
