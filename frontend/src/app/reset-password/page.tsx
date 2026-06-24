"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/lib/axiosClient";
import { getErrorMessage } from "@/lib/errors";

function ResetPasswordInner() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Missing or invalid reset link.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axiosClient.post("/confirm-reset-password/", { token, new_password: password });
      setDone(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setError(getErrorMessage(err, "Could not reset your password. The link may have expired."));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Reset password</h1>
        <p className="text-red-300">Missing or invalid reset link.</p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
      <h1 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">
        Choose a new password
      </h1>
      {done ? (
        <p className="text-emerald-300 text-center mt-4">
          Password updated. Redirecting you to sign in…
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div>
            <label htmlFor="password" className="block text-zinc-300 text-sm font-medium mb-1">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-zinc-300 text-sm font-medium mb-1">
              Confirm new password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {loading ? "Saving…" : "Reset password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-zinc-800 to-zinc-900">
      <Suspense fallback={<div className="text-zinc-400">Loading…</div>}>
        <ResetPasswordInner />
      </Suspense>
    </div>
  );
}
