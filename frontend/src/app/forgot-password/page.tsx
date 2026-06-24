"use client";
import { useState } from "react";
import Link from "next/link";
import axiosClient from "@/lib/axiosClient";
import { getErrorMessage } from "@/lib/errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await axiosClient.post("/token/", { email });
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-zinc-800 to-zinc-900">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
        <h1 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">
          Reset your password
        </h1>

        {done ? (
          <>
            <p className="text-emerald-300 text-center mt-4">
              If an account exists for that email, a reset link is on its way. Check your inbox.
            </p>
            <Link
              href="/login"
              className="mt-6 block w-full text-center rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <p className="text-zinc-400 text-center mb-6">
              Enter your email and we&apos;ll send you a link to reset it.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-zinc-300 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              {error && (
                <div className="bg-red-800/70 border border-red-900 rounded px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg font-semibold transition bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <Link
              href="/login"
              className="mt-4 block text-center text-xs text-emerald-400 hover:underline"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
