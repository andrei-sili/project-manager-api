"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axiosClient from "@/lib/axiosClient";
import { getErrorMessage } from "@/lib/errors";

type Invite = { team: string; role: string; status: string; invited_by: string | null };

const card = "w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 text-center";

function DeclineInner() {
  const token = useSearchParams().get("token");
  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [declined, setDeclined] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Missing invitation token.");
      setLoading(false);
      return;
    }
    axiosClient
      .get(`/invitations/${token}/`)
      .then((res) => {
        setInvite(res.data);
        if (res.data.status !== "pending") setDeclined(true);
      })
      .catch((e) => setError(getErrorMessage(e, "Invitation not found.")))
      .finally(() => setLoading(false));
  }, [token]);

  const decline = async () => {
    setSubmitting(true);
    setError("");
    try {
      await axiosClient.post(`/invitations/${token}/decline/`);
      setDeclined(true);
    } catch (e) {
      setError(getErrorMessage(e, "Could not decline the invitation."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={card}><p className="text-zinc-400">Loading…</p></div>;

  if (!invite)
    return (
      <div className={card}>
        <p className="text-red-300">{error || "Invitation not found."}</p>
        <Link href="/login" className="mt-6 inline-block text-emerald-400 hover:underline">Go to sign in</Link>
      </div>
    );

  return (
    <div className={card}>
      <h1 className="text-2xl font-bold text-white mb-4">Decline invitation</h1>
      {declined ? (
        <p className="text-zinc-300">
          You declined the invitation to <span className="font-semibold">{invite.team}</span>. The person who
          invited you has been notified.
        </p>
      ) : (
        <>
          <p className="text-zinc-300 mb-6">
            Decline the invitation to join <span className="font-semibold text-emerald-300">{invite.team}</span>?
          </p>
          <button
            onClick={decline}
            disabled={submitting}
            className="w-full py-2 rounded-lg font-semibold bg-red-700 hover:bg-red-800 text-white disabled:opacity-60"
          >
            {submitting ? "Declining…" : "Decline invitation"}
          </button>
        </>
      )}
      {error && <div className="mt-4 text-sm text-red-300">{error}</div>}
    </div>
  );
}

export default function DeclineInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-zinc-800 to-zinc-900">
      <Suspense fallback={<div className="text-zinc-400">Loading…</div>}>
        <DeclineInner />
      </Suspense>
    </div>
  );
}
