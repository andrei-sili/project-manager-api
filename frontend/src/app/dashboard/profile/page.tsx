// src/app/dashboard/profile/page.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import axios from "axios";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [first_name, setFirstName] = useState(user?.first_name || "");
  const [last_name, setLastName] = useState(user?.last_name || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Handles profile update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/update-profile/`,
        { first_name, last_name },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setSuccess("Profile updated!");
      refreshUser();
    } catch (err: any) {
      setError("Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-zinc-900 rounded-xl shadow p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">My Profile</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-gray-400 mb-1">First Name</label>
          <input
            className="w-full bg-zinc-800 rounded px-3 py-2 text-white"
            value={first_name}
            onChange={e => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-1">Last Name</label>
          <input
            className="w-full bg-zinc-800 rounded px-3 py-2 text-white"
            value={last_name}
            onChange={e => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-1">Email</label>
          <input
            className="w-full bg-zinc-800 rounded px-3 py-2 text-gray-400"
            value={user?.email || ""}
            disabled
          />
        </div>
        <button
          type="submit"
          className="w-full mt-3 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
        {success && <div className="text-green-400 mt-2">{success}</div>}
        {error && <div className="text-red-400 mt-2">{error}</div>}
      </form>
    </div>
  );
}
