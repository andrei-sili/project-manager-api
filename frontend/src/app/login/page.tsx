// src/app/login/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { login, isAuthenticated } from "@/lib/auth";

/**
 * LoginPage component - Renders a login form with validation, error handling, and loading indicator.
 * All logic is contained here for simplicity. You can split into components if needed later.
 */
export default function LoginPage() {
  // State for user input, errors and loading status
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const passwordRef = useRef<HTMLInputElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && typeof isAuthenticated === "function" && isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Basic validation
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      if (passwordRef.current) passwordRef.current.focus();
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(
        err?.message === "Network Error"
          ? "Network error, please try again."
          : "Email or password is incorrect."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-zinc-800 to-zinc-900">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
        {/* You can put your logo here */}
        <div className="flex justify-center mb-6">
          <svg
            width="44"
            height="44"
            fill="none"
            className="text-blue-400"
            viewBox="0 0 48 48"
          >
            <rect width="48" height="48" rx="10" fill="#3b82f6" opacity="0.15"/>
            <path d="M14 30v-8a10 10 0 0120 0v8" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="24" cy="34" r="2" fill="#3b82f6"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">Sign in</h1>
        <p className="text-zinc-400 text-center mb-8">Access your project manager account</p>
        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="on">
          <div>
            <label htmlFor="email" className="block text-zinc-300 text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-zinc-300 text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              ref={passwordRef}
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          {error && (
            <div className="bg-red-800/70 border border-red-900 rounded px-3 py-2 text-sm text-red-200 mb-2">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold transition bg-blue-600 hover:bg-blue-700 focus:bg-blue-800 text-white shadow ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        {/* For future: Add here extra login options, forgot password, etc. */}
        <div className="mt-6 text-center">
          <span className="text-zinc-500 text-sm">Don't have an account?</span>
          {/* <a href="/register" className="ml-1 text-blue-400 hover:underline">Sign up</a> */}
        </div>
      </div>
    </div>
  );
}

