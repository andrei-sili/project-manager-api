"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/lib/axiosClient";
import { setTokens } from "@/lib/token";
import { useAuth } from "@/lib/useAuth";
import { getErrorMessage } from "@/lib/errors";

type Invite = {
  team: string;
  role: string;
  status: string;
  email: string;
  invited_by: string | null;
  has_account: boolean;
};

const card =
  "w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800";
const input = "w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white";
const primaryBtn =
  "w-full py-2 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60";

function AcceptInner() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Missing invitation token.");
      setLoading(false);
      return;
    }
    axiosClient
      .get(`/invitations/${token}/`)
      .then((res) => setInvite(res.data))
      .catch((e) => setError(getErrorMessage(e, "Invitation not found.")))
      .finally(() => setLoading(false));
  }, [token]);

  const acceptExisting = async () => {
    setSubmitting(true);
    setError("");
    try {
      await axiosClient.post(`/invitations/${token}/accept/`);
      router.push("/dashboard");
    } catch (e) {
      setError(getErrorMessage(e, "Could not accept the invitation."));
      setSubmitting(false);
    }
  };

  const registerAndAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await axiosClient.post(`/register-invite/`, {
        token,
        first_name: firstName,
        last_name: lastName,
        password,
      });
      setTokens(res.data.access, res.data.refresh);
      router.push("/dashboard");
    } catch (e) {
      setError(getErrorMessage(e, "Could not create your account."));
      setSubmitting(false);
    }
  };

  if (loading) return <div className={card}><p className="text-zinc-400">Loading…</p></div>;

  if (!invite)
    return (
      <div className={`${card} text-center`}>
        <p className="text-red-300">{error || "Invitation not found."}</p>
        <Link href="/login" className="mt-6 inline-block text-emerald-400 hover:underline">Go to sign in</Link>
      </div>
    );

  return (
    <div className={card}>
      <h1 className="text-2xl font-bold text-white text-center mb-2">Team invitation</h1>
      <p className="text-zinc-300 text-center mb-6">
        {invite.invited_by || "A teammate"} invited you to join{" "}
        <span className="font-semibold text-emerald-300">{invite.team}</span> as {invite.role}.
      </p>

      {invite.status !== "pending" ? (
        <p className="text-center text-zinc-400">
          This invitation has already been {invite.status}.
        </p>
      ) : invite.has_account ? (
        isAuthenticated ? (
          <button onClick={acceptExisting} disabled={submitting} className={primaryBtn}>
            {submitting ? "Accepting…" : "Accept invitation"}
          </button>
        ) : (
          <div className="text-center">
            <p className="text-zinc-400 mb-4">Sign in as {invite.email} to accept.</p>
            <Link href="/login" className={`${primaryBtn} inline-block`}>Sign in</Link>
          </div>
        )
      ) : (
        <form onSubmit={registerAndAccept} className="space-y-4">
          <p className="text-zinc-400 text-sm">Create your account to join the team.</p>
          <input className={input} placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={submitting} />
          <input className={input} placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={submitting} />
          <input className={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={submitting} />
          <button type="submit" disabled={submitting} className={primaryBtn}>
            {submitting ? "Creating…" : "Create account & accept"}
          </button>
        </form>
      )}

      {error && <div className="mt-4 text-sm text-red-300 text-center">{error}</div>}
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-zinc-800 to-zinc-900">
      <Suspense fallback={<div className="text-zinc-400">Loading…</div>}>
        <AcceptInner />
      </Suspense>
    </div>
  );
}
