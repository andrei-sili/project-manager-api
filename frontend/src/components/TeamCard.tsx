// src/components/TeamCard.tsx

"use client";
import Link from "next/link";
import { Users } from "lucide-react";

export default function TeamCard({ teams, loading }: { teams: any[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="rounded-xl bg-zinc-800 shadow p-6 h-[120px] animate-pulse mb-4" />
    );
  }

  return (
    <div className="rounded-xl bg-zinc-900 shadow p-6 mb-4">
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
      {(!teams || teams.length === 0) ? (
        <div className="text-gray-400 text-sm">You are not part of any team yet.</div>
      ) : (
        <ul className="flex flex-wrap gap-4">
          {teams.slice(0, 3).map((team) => (
            <li key={team.id} className="bg-zinc-800 rounded-lg px-5 py-3 min-w-[180px] flex-1 shadow">
              <Link href={`/dashboard/teams`}>
                <div className="font-semibold text-white text-base truncate">{team.name}</div>
                <div className="mt-2 flex -space-x-2 overflow-hidden">
                  {team.members &&
                    team.members.slice(0, 6).map((member: any) => (
                      <span
                        key={member.id}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-700 text-white text-xs font-bold ring-2 ring-zinc-900"
                        title={`${member.first_name} ${member.last_name}`}
                      >
                        {(member.first_name?.[0] || "") + (member.last_name?.[0] || "")}
                      </span>
                    ))}
                  {team.members && team.members.length > 6 && (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-600 text-white text-xs font-bold ring-2 ring-zinc-900">
                      +{team.members.length - 6}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">{team.members?.length || 0} members</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
