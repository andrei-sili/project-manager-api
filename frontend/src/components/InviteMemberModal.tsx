"use client";
import { useState, type FormEvent } from "react";
import axiosClient from "@/lib/axiosClient";
import { getErrorMessage } from "@/lib/errors";

type InviteMemberModalProps = {
  open: boolean;
  onClose: () => void;
  teamId: number | string;
  onInvited?: () => void;
};

// Modal for inviting a member to the team
export default function InviteMemberModal({ open, onClose, teamId, onInvited }: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      await axiosClient.post(
        `/teams/${teamId}/invite-member/`,
        { email, role }
      );
      setSuccess("Invitation sent!");
      setEmail("");
      setRole("developer");
      onInvited?.();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send invitation."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70">
      <form
        className="bg-zinc-900 p-6 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-4 border border-zinc-800"
        onSubmit={handleSubmit}
      >
        <div className="flex justify-between items-center mb-1">
          <div className="text-lg font-bold">Invite Member</div>
          <button type="button" className="text-gray-400 hover:text-red-400 text-xl" onClick={onClose}>×</button>
        </div>
        <label className="text-sm">Email
          <input className="mt-1 bg-zinc-800 p-2 rounded w-full" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        </label>
        <label className="text-sm">Role
          <select className="mt-1 bg-zinc-800 p-2 rounded w-full" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="developer">Developer</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
          </select>
        </label>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        {success && <div className="text-green-400 text-sm">{success}</div>}
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded mt-2"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Invitation"}
        </button>
      </form>
    </div>
  );
}

