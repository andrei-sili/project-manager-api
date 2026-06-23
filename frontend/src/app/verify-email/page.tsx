"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/lib/axiosClient";
import { getErrorMessage } from "@/lib/errors";

function VerifyEmailInner() {
  const token = useSearchParams().get("token");
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    if (!token) {
      setState("error");
      setMessage("Missing verification token.");
      return;
    }
    axiosClient
      .post("/users/verify-email/", { token })
      .then((res) => {
        setState("ok");
        setMessage(res.data?.detail || "Email verified. You can now sign in.");
      })
      .catch((e) => {
        setState("error");
        setMessage(getErrorMessage(e, "Verification failed."));
      });
  }, [token]);

  return (
    <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 text-center">
      <h1 className="text-2xl font-bold text-white mb-4">Email verification</h1>
      {state === "loading" && <p className="text-zinc-400">Verifying…</p>}
      {state === "ok" && <p className="text-emerald-300">{message}</p>}
      {state === "error" && <p className="text-red-300">{message}</p>}
      <Link
        href="/login"
        className="mt-6 inline-block rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
      >
        Go to sign in
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-zinc-800 to-zinc-900">
      <Suspense fallback={<div className="text-zinc-400">Loading…</div>}>
        <VerifyEmailInner />
      </Suspense>
    </div>
  );
}
