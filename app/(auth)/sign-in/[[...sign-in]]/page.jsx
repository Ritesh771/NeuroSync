"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // This simple sign-in sets a cookie named `simple_auth` with the token
  // The server middleware will validate it against SIMPLE_AUTH_TOKEN
  function handleDevSignIn(e) {
    e.preventDefault();
    setLoading(true);
    // For local testing only: write cookie with the expected token and redirect
    document.cookie = `simple_auth=${encodeURIComponent("test_token_123")}; path=/`;
    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Sign in</h1>
        <p className="mb-4">This app used Clerk previously. We've replaced it with a
          tiny dev auth flow. For production, add a proper auth solution.
        </p>

        <form onSubmit={handleDevSignIn}>
          <button
            type="submit"
            className="w-full rounded bg-blue-600 text-white py-2"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Dev sign-in (set token)"}
          </button>
        </form>
      </div>
    </main>
  );
}
