// frontend/src/app/dashboard/teams/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  fetchTeams,
  createTeam,
  removeMember,
  changeRole,
  deleteTeam as apiDeleteTeam,
  Team,
} from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { Plus, Trash2, UserPlus2, UserX2 } from "lucide-react";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [inviteForms, setInviteForms] = useState<{ [key: number]: boolean }>({});
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTeams().then(setTeams).catch(console.error);
  }, []);

  async function handleCreateTeam() {
    if (!newTeamName.trim()) return alert("Enter a team name");
    try {
      const newTeam = await createTeam({ name: newTeamName });
      setTeams(prev => [newTeam, ...prev]);
      setNewTeamName("");
      setShowCreate(false);
    } catch (err) {
      alert("Error creating team");
    }
  }

  return (
    <div className="p-10 text-white">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Teams</h1>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-green-600 px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={16} /> Create Team
          </button>
        </div>

        {showCreate && (
          <div className="mt-4 flex gap-2">
            <input
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
              placeholder="Team name"
              className="p-2 rounded bg-gray-800 border border-gray-600 text-white"
            />
            <button
              onClick={handleCreateTeam}
              className="bg-blue-600 px-4 py-2 rounded"
            >
              Create
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {teams.map(team => (
          <div key={team.id} className="bg-[#222] p-4 rounded">
            <h2 className="text-xl font-bold">{team.name}</h2>
            <p className="text-sm text-gray-400">Created by: {team.created_by}</p>

            <ul className="mt-4 space-y-2">
              {(team.members ?? []).map(member => (
                <li
                  key={`${team.id}-${member.id}`}
                  className="flex justify-between items-center bg-[#2d2d2d] p-2 rounded"
                >
                  <div>
                    <strong>{member.user}</strong> – <span className="text-xs">{member.role}</span>
                  </div>
                  <div className="flex gap-2">
                    {member.id && (
                      <>
                        <button
                          className="text-yellow-400 text-xs"
                          onClick={() => {
                            const memberIdStr = member.id?.toString();
                            if (!memberIdStr) return alert("Invalid member ID");
                            const newRole = member.role === "developer" ? "admin" : "developer";
                            changeRole(team.id.toString(), memberIdStr, newRole).then(() => {
                              setTeams(ts =>
                                ts.map(t =>
                                  t.id === team.id
                                    ? {
                                        ...t,
                                        members: (t.members ?? []).map(m =>
                                          m.id === member.id ? { ...m, role: newRole } : m
                                        ),
                                      }
                                    : t
                                )
                              );
                            });
                          }}
                        >
                          Toggle Role
                        </button>
                        <button
                          onClick={() => {
                            const memberIdStr = member.id?.toString();
                            if (!memberIdStr) return alert("Invalid member ID");
                            if (confirm("Remove member?")) {
                              removeMember(team.id.toString(), memberIdStr).then(() => {
                                setTeams(ts =>
                                  ts.map(t =>
                                    t.id === team.id
                                      ? {
                                          ...t,
                                          members: (t.members ?? []).filter(m => m.id !== member.id),
                                        }
                                      : t
                                  )
                                );
                              });
                            }
                          }}
                          className="text-red-400"
                        >
                          <UserX2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <button
                className="text-blue-400 text-sm mb-2"
                onClick={() => setInviteForms(prev => ({ ...prev, [team.id]: !prev[team.id] }))}
              >
                <UserPlus2 size={16} className="inline mr-1" /> Invite Member
              </button>
              {inviteForms[team.id] && (
                <InviteForm
                  teamId={team.id}
                  onInviteSuccess={(member) => {
                    setTeams(ts =>
                      ts.map(t =>
                        t.id === team.id
                          ? { ...t, members: [...(t.members ?? []), member] }
                          : t
                      )
                    );
                  }}
                />
              )}
            </div>

            <button
              className="mt-3 text-sm text-red-500"
              onClick={() => {
                if (confirm("Delete team?")) {
                  apiDeleteTeam(team.id.toString()).then(() => {
                    setTeams(ts => ts.filter(t => t.id !== team.id));
                  });
                }
              }}
            >
              <Trash2 size={16} className="inline mr-1" /> Delete team
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function InviteForm({
  teamId,
  onInviteSuccess,
}: {
  teamId: number;
  onInviteSuccess: (member: {
    id: number;
    email: string;
    user: string;
    role: string;
    joined_at: string;
  }) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("manager");

  async function handleSubmit() {
    if (!email.trim()) return alert("Please enter an email");

    try {
      const res = await fetch(`/api/teams/${teamId}/invite-member/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      if (!res.ok) throw new Error("Failed to invite");

      onInviteSuccess({
        id: Date.now(),
        email: email.trim(),
        user: email.trim(),
        role,
        joined_at: new Date().toISOString(),
      });

      setEmail("");
      setRole("manager");
      alert("Invitation sent!");
    } catch (err) {
      alert("Failed to send invitation");
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center">
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="p-2 rounded bg-gray-800 border border-gray-600 text-white w-full"
      />
      <select
        value={role}
        onChange={e => setRole(e.target.value)}
        className="p-2 rounded bg-gray-800 border border-gray-600 text-white"
      >
        <option value="manager">Manager</option>
        <option value="admin">Admin</option>
        <option value="developer">Developer</option>
      </select>
      <button
        onClick={handleSubmit}
        className="bg-blue-600 px-4 py-2 rounded text-white"
      >
        Invite
      </button>
    </div>
  );
}
