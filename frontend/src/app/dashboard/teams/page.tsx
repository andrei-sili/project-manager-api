// Path: frontend/src/app/dashboard/teams/page.tsx
"use client";

import React from "react";
import { getTeams, removeMember, changeRole, inviteTeamMember, deleteTeam } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import type { Team, TeamMember } from "@/lib/types";

export default function TeamsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [teams, setTeams] = React.useState<(Team & { inviteEmail?: string; inviteRole?: string })[]>([]);

  React.useEffect(() => {
    getTeams().then(data => {
      setTeams(data);
      setLoading(false);
    });
  }, []);

  if (!user || loading) return <div className="text-blue-500">Loading teams...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-10 text-white">Your Teams</h1>
      <div className="space-y-10">
        {teams.map(team => (
          <div key={team.id} className="bg-zinc-900 rounded-2xl shadow-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">{team.name}</h2>
                <p className="text-sm text-zinc-400">Created by: {team.created_by}</p>
              </div>
              {team.is_admin && (
                <button
                  onClick={() => deleteTeam(team.id).then(() => window.location.reload())}
                  className="bg-red-700 hover:bg-red-800 text-white rounded px-3 py-1 text-sm"
                >
                  Delete Team
                </button>
              )}
            </div>

            <div>
              <h3 className="font-bold text-blue-400 mb-4 text-lg">Members</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {team.members.length === 0 ? (
                  <div className="text-zinc-500 col-span-full">No members yet.</div>
                ) : (
                  team.members.map(member => {
                    const fullName = `${member.user.first_name} ${member.user.last_name}`.trim() || member.user.email;
                    const joinedAt = new Date(member.joined_at).toLocaleDateString();
                    const initial = member.user.first_name?.[0] || member.user.last_name?.[0] || member.user.email[0];
                    return (
                      <div key={member.user.id} className="bg-zinc-800 rounded-xl p-4 flex flex-col gap-2 border border-zinc-700 hover:border-blue-500 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow">
                            {initial.toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-semibold">{fullName}</span>
                            <span className="text-xs text-green-400">{member.user.email}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="bg-blue-900 text-blue-300 px-2 py-0.5 rounded text-xs">{member.role}</span>
                          <span className="text-zinc-500 text-xs">Joined: {joinedAt}</span>
                        </div>
                        {team.is_admin && user.id !== member.user.id && (
                          <div className="flex justify-end gap-2 mt-2">
                            <select
                              value={member.role}
                              onChange={e => changeRole(team.id, member.user.id, e.target.value).then(() => window.location.reload())}
                              className="bg-zinc-900 border border-zinc-700 text-white text-xs rounded px-2 py-1"
                            >
                              <option value="developer">Developer</option>
                              <option value="manager">Manager</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              className="text-red-500 text-xs hover:underline"
                              onClick={() => removeMember(team.id, member.user.id).then(() => window.location.reload())}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {team.is_admin && (
              <div className="mt-6">
                <h4 className="font-bold text-blue-300 mb-2">Invite Member</h4>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    type="email"
                    placeholder="Email"
                    className="rounded px-2 py-1 bg-zinc-800 text-white border border-zinc-700 flex-1"
                    value={team.inviteEmail || ""}
                    onChange={e => {
                      const newTeams = teams.map(t => t.id === team.id ? { ...t, inviteEmail: e.target.value } : t);
                      setTeams(newTeams);
                    }}
                  />
                  <select
                    className="rounded px-2 py-1 bg-zinc-800 text-white border border-zinc-700"
                    value={team.inviteRole || "developer"}
                    onChange={e => {
                      const newTeams = teams.map(t => t.id === team.id ? { ...t, inviteRole: e.target.value } : t);
                      setTeams(newTeams);
                    }}
                  >
                    <option value="developer">Developer</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    className="bg-blue-700 hover:bg-blue-800 text-white rounded px-3 py-1"
                    onClick={async () => {
                      try {
                        await inviteTeamMember(team.id, {
                          email: team.inviteEmail,
                          role: team.inviteRole,
                        });
                        alert("Invitation sent!");
                        setTeams(teams => teams.map(t =>
                          t.id === team.id ? { ...t, inviteEmail: "", inviteRole: "developer" } : t
                        ));
                        window.location.reload();
                      } catch (e) {
                        alert("Failed to send invitation!");
                      }
                    }}
                    disabled={!team.inviteEmail}
                  >
                    Invite
                  </button>
                </div>
              </div>
            )}
            {!team.is_admin && (
              <div className="text-zinc-400 text-xs italic mt-2">You have read-only access to this team.</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}