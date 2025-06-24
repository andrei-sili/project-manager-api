// frontend/src/app/dashboard/teams/page.tsx
"use client";
import React from "react";
import { getTeams, removeMember, changeRole, inviteTeamMember, deleteTeam } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import type { Team, TeamMember } from "@/lib/types";

export default function TeamsPage() {
  const { user } = useAuth();
  if (!user) {
    return <div>Loading...</div>;
  }
  //const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [teams, setTeams] = React.useState<(Team & { inviteEmail?: string; inviteRole?: string })[]>([]);

  React.useEffect(() => {
    getTeams().then(data => {
      setTeams(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-blue-500">Loading teams...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Teams</h1>
      <div className="space-y-8">
        {teams.map(team => (
          <div key={team.id} className="bg-zinc-900 rounded-xl shadow-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-semibold">{team.name}</h2>
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
            <div className="mt-3">
              <h3 className="font-bold text-blue-400 mb-2">Members</h3>
              <table className="w-full text-sm bg-zinc-950 rounded-xl mb-2">
                <thead>
                  <tr className="text-zinc-400 border-b border-zinc-800">
                    <th className="py-1 text-left">Name</th>
                    <th className="py-1">Email</th>
                    <th className="py-1">Role</th>
                    {team.is_admin && <th className="py-1">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {team.members.length === 0 && (
                    <tr>
                      <td colSpan={team.is_admin ? 4 : 3} className="text-center text-zinc-500">No members</td>
                    </tr>
                  )}
                  {team.members.map((member, idx) => (
                    <tr key={member.user?.id || member.id || idx} className="border-b border-zinc-800">
                      <td className="py-1">
                        {(member.user.first_name || member.user.last_name)
                          ? `${member.user.first_name} ${member.user.last_name}`.trim()
                          : member.user.email}
                      </td>
                      <td className="py-1">{member.user.email}</td>
                      <td className="py-1">
                        {team.is_admin ? (
                          <select
                            value={member.role}
                            onChange={e => changeRole(team.id, member.user.id, e.target.value).then(() => window.location.reload())}
                            className="bg-zinc-900 border border-zinc-700 text-white rounded px-2 py-1"
                            disabled={user.id === member.user.id}
                          >
                            <option value="developer">Developer</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className="bg-blue-900 text-blue-300 px-2 rounded">{member.role}</span>
                        )}
                      </td>
                      {team.is_admin && (
                        <td className="py-1">
                          {user.id !== member.user.id && (
                            <button
                              className="text-red-500 hover:text-red-700 px-2 py-1"
                              onClick={() => removeMember(team.id, member.user.id).then(() => window.location.reload())}
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {team.is_admin && (
              <div className="mt-3">
                <h4 className="font-bold mb-1 text-blue-300">Invite Member</h4>
                {<div className="flex items-center gap-2 mt-1">
                  <input
                      type="email"
                      placeholder="Email"
                      className="rounded px-2 py-1 bg-zinc-800 text-white border border-zinc-700"
                      value={team.inviteEmail || ""}
                      onChange={e => {
                        const newTeams = teams.map(t =>
                            t.id === team.id ? {...t, inviteEmail: e.target.value} : t
                        );
                        setTeams(newTeams);
                      }}
                  />
                  <select
                      className="rounded px-2 py-1 bg-zinc-800 text-white border border-zinc-700"
                      value={team.inviteRole || "developer"}
                      onChange={e => {
                        const newTeams = teams.map(t =>
                            t.id === team.id ? {...t, inviteRole: e.target.value} : t
                        );
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
                              t.id === team.id ? {...t, inviteEmail: "", inviteRole: "developer"} : t
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

                }
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
