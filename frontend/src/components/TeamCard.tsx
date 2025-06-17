// frontend/src/components/TeamCard.tsx

import React from "react";
import Link from "next/link";
import { Users } from "lucide-react";

interface Member {
  id: number;
  name?: string;
  email: string;
}

interface Team {
  id: number;
  name: string;
  members: Member[];
}

interface Props {
  teams: Team[];
  loading?: boolean;
}

function stringToColor(str: string): string {
  // Simple hash to pastel background
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue},70%,60%)`;
}

function Avatar({ member }: { member: Member }) {
  const letter =
    member.name?.[0]?.toUpperCase() ||
    member.email?.[0]?.toUpperCase() ||
    "?";
  return (
    <span
      className="w-7 h-7 flex items-center justify-center rounded-full border-2 border-zinc-900 text-xs font-bold text-white shadow"
      style={{ background: stringToColor(member.email) }}
      title={member.name || member.email}
    >
      {letter}
    </span>
  );
}

export default function TeamCard({ teams, loading }: Props) {
  const maxAvatars = 3;
  const visibleTeams = teams.slice(0, 3);

  return (
    <div className="bg-zinc-900 rounded-2xl shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">Teams</h3>
        <Link
          href="/dashboard/teams"
          className="flex items-center gap-2 text-blue-400 hover:underline font-medium"
        >
          <Users className="w-5 h-5" />
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {loading ? (
          <div className="col-span-3 text-center text-gray-400">Loading teams...</div>
        ) : visibleTeams.length === 0 ? (
          <div className="col-span-3 text-center text-gray-500 text-sm">
            No teams found.
          </div>
        ) : (
          visibleTeams.map((team) => {
            const memberCount = team.members?.length || 0;
            const avatars = (team.members || []).slice(0, maxAvatars);
            const rest = memberCount - maxAvatars;
            return (
              <div
                key={team.id}
                className="bg-zinc-800 hover:bg-zinc-700 rounded-xl p-4 flex flex-col gap-2 border border-transparent hover:border-blue-600 transition"
              >
                <div className="font-semibold truncate">{team.name}</div>
                <div className="flex items-center mt-2">
                  {/* Stacked Avatars */}
                  <div className="flex -space-x-2">
                    {avatars.map((member) => (
                      <Avatar key={member.id} member={member} />
                    ))}
                    {rest > 0 && (
                      <span
                        className="w-7 h-7 flex items-center justify-center rounded-full border-2 border-zinc-900 bg-blue-700 text-xs font-bold text-white shadow"
                        title={`${rest} more`}
                      >
                        +{rest}
                      </span>
                    )}
                  </div>
                  <span className="ml-3 text-xs text-gray-400">
                    {memberCount} member{memberCount !== 1 && "s"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
