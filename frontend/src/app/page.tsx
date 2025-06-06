// frontend/src/app/login/page.tsx

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

// Login page for the application.
// Handles login form, calls AuthProvider, shows errors, and redirects on success.
export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      // No need to redirect, AuthProvider will do it.
    } catch (e: any) {
      setError(e?.message || "Login failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 border border-zinc-800"
        autoComplete="off"
      >
        <h2 className="text-2xl font-bold text-center text-white">Project Manager Login</h2>
        <div>
          <label className="block text-gray-400 mb-1" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded px-3 py-2 bg-zinc-800 text-white"
            value={email}
            autoComplete="username"
            onChange={e => setEmail(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded px-3 py-2 bg-zinc-800 text-white"
            value={password}
            autoComplete="current-password"
            onChange={e => setPassword(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <button
          type="submit"
          className="w-full mt-3 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          disabled={submitting || loading}
        >
          {submitting || loading ? "Signing in..." : "Sign In"}
        </button>
        {error && (
          <div className="mt-4 text-sm text-red-500 text-center border border-red-800 rounded px-3 py-2 bg-zinc-950">
            {error}
          </div>
        )}
        {/* Add register/forgot password links here if you wish */}
      </form>
    </div>
  );
}
