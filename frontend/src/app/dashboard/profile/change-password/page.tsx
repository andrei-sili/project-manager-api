// frontend/src/app/dashboard/profile/change-password/page.tsx
"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const [old_password, setOldPassword] = useState("");
  const [new_password, setNewPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (new_password !== confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (new_password.length < 8 || new_password.length > 16) {
      setError("Password must be 8-16 characters.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/change-password/`,
        { old_password, new_password },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Password change failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-zinc-900 rounded-xl shadow p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-center">Change Password</h2>
        {/* X button to go back */}
        <button
          className="text-gray-400 hover:text-gray-200 text-xl px-2"
          onClick={() => router.back()}
          aria-label="Close"
        >
          &times;
        </button>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-gray-400 mb-1">Current Password</label>
          <input
            type="password"
            className="w-full bg-zinc-800 rounded px-3 py-2 text-white"
            value={old_password}
            onChange={e => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-1">New Password</label>
          <input
            type="password"
            className="w-full bg-zinc-800 rounded px-3 py-2 text-white"
            value={new_password}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-1">Confirm New Password</label>
          <input
            type="password"
            className="w-full bg-zinc-800 rounded px-3 py-2 text-white"
            value={confirm_password}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full mt-3 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Saving..." : "Change password"}
        </button>
        {/* Feedback messages sticky under button */}
        {(success || error) && (
          <div className="mt-4 flex items-center justify-between px-3 py-2 rounded
            text-sm font-semibold
            border
            transition-all
            "
            style={{
              borderColor: success ? "#22c55e" : "#ef4444",
              color: success ? "#22c55e" : "#ef4444",
              background: success ? "#052e16" : "#2b0d0d"
            }}
          >
            <span>{success || error}</span>
            <button
              className="text-lg px-2 font-bold hover:opacity-70"
              onClick={() => {
                setSuccess("");
                setError("");
              }}
              type="button"
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
