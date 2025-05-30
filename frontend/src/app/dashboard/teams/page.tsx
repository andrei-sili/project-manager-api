"use client";
import { useEffect, useState } from "react";
import { fetchTeams, Team } from "@/lib/api";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeams()
      .then((data) => setTeams(data))
      .catch(() => setError("Could not load teams."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading teams...</div>;
  if (error)   return <div className="p-6 text-red-400">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl mb-4">Teams</h1>
      {teams.length === 0 && <p>No teams found.</p>}
      {teams.map((team, idx) => (
        <div key={idx} className="bg-gray-800 rounded-xl p-4 mb-6">
          <h2 className="text-xl font-semibold">{team.name}</h2>
          <p className="text-gray-400 mb-2">Created by: {team.created_by}</p>
          <ul className="pl-5">
            {team.members.map((member, mIdx) => (
              <li key={mIdx} className="mb-1">
                <span className="font-medium">{member.user || member.email}</span>
                <span className="ml-2 text-sm text-gray-400">
                  ({member.role}) – Joined: {new Date(member.joined_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
