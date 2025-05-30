"use client";
import Link from "next/link";
import { Team } from "@/lib/api";

export default function TeamCard({ teams = [] }: { teams?: Team[] }) {
  return (
    <div className="bg-[#282c36] rounded-xl shadow p-5 min-h-[120px] hover:ring-2 ring-purple-400 transition">
      <Link href="/dashboard/teams" className="block hover:underline">
        <h2 className="text-xl font-bold mb-3">My Team</h2>
      </Link>
      {(!teams || teams.length === 0) ? (
        <p className="text-gray-400">No teams found.</p>
      ) : (
        <ul className="space-y-4">
          {teams.map((team) => (
            <li key={team.name}>
              <div className="font-semibold mb-1">{team.name}</div>
              <div className="flex -space-x-2">
                {team.members?.slice(0, 5).map((member, idx) => (
                  <span
                    key={member.email + idx}
                    title={member.user || member.email}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-700 text-white font-bold border-2 border-black"
                  >
                    {(member.user && member.user.length > 0)
                      ? member.user[0]
                      : member.email[0].toUpperCase()}
                  </span>
                ))}
                {team.members?.length > 5 && (
                  <span className="ml-3 text-xs text-gray-400">
                    +{team.members.length - 5} more
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
