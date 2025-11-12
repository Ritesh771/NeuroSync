"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleDevSignUp(e) {
    e.preventDefault();
    setLoading(true);
    document.cookie = `simple_auth=${encodeURIComponent("test_token_123")}; path=/`;
    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Sign up</h1>
        <p className="mb-4">This simple sign-up writes a test token cookie for local testing.</p>

        <form onSubmit={handleDevSignUp}>
          <button
            type="submit"
            className="w-full rounded bg-green-600 text-white py-2"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Dev sign-up (set token)"}
          </button>
        </form>
      </div>
    </main>
  );
}
