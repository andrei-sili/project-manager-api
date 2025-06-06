// frontend/src/components/UserProfileCard.tsx

import React from "react";
import { useAuth } from "@/components/AuthProvider";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue},70%,60%)`;
}

export default function UserProfileCard() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const letter =
    user.first_name?.[0]?.toUpperCase() ||
    user.last_name?.[0]?.toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    "?";
  const name =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.email;
  const role = user.role || "Member";

  return (
    <div className="bg-zinc-900 rounded-2xl shadow p-5 flex flex-col items-center gap-3 mb-4">
      <div
        className="w-14 h-14 flex items-center justify-center rounded-full border-4 border-zinc-800 text-2xl font-bold text-white shadow"
        style={{ background: stringToColor(user.email) }}
        title={name}
      >
        {letter}
      </div>
      <div className="font-semibold text-lg text-center">{name}</div>
      <div className="text-xs text-gray-400 text-center mb-2">{user.email}</div>
      <div className="flex items-center gap-2 text-sm font-medium text-blue-400">
        <User className="w-4 h-4" />
        <span className="capitalize">{role}</span>
      </div>
      <button
        onClick={() => router.push("/dashboard/profile")}
        className="mt-3 px-4 py-1 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow transition"
      >
        Edit profile
      </button>
    </div>
  );
}
