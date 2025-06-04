// frontend/src/components/InviteMemberModal.tsx
"use client";
import { useState } from "react";
import axios from "axios";

// Modal for inviting a member to the team
export default function InviteMemberModal({ open, onClose, teamId, onInvited }: any) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/teams/${teamId}/invite-member/`,
        { email, role },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setSuccess("Invitation sent!");
      setEmail("");
      setRole("member");
      onInvited && onInvited();
    } catch (err: any) {
      setError(
        err?.response?.data?.email?.[0] ||
        err?.response?.data?.detail ||
        "Failed to send invitation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70">
      <form
        className="bg-zinc-900 p-6 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-4 border border-blue-700"
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded mt-2"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Invitation"}
        </button>
      </form>
    </div>
  );
}

