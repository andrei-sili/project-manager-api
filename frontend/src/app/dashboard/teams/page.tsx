"use client";

import { useEffect, useState } from "react";
import { fetchTeams, Team } from "@/lib/api";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeams()
      .then(setTeams)
      .catch(() => setError("Failed to load teams"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Loading teams…</p>;
  if (error)   return <p className="p-6 text-red-400">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Teams</h1>
      <ul className="list-disc pl-5 space-y-2">
        {teams.map((t) => (
          <li key={t.id}>{t.name}</li>
        ))}
      </ul>
    </div>
  );
}
