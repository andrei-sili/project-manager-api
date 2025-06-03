"use client";

import { useEffect, useState } from "react";
import {
  fetchTeams,
  createTeam,
  inviteMember,
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
  const [showAdd, setShowAdd] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
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
    try {
      const newTeam = await createTeam({ name: newTeamName });
      setTeams(prev => [newTeam, ...prev]);
      setNewTeamName("");
      setShowAdd(false);
    } catch (err) {
      alert("Error creating team");
    }
  }

  return (
    <div className="p-10 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Teams</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-green-600 px-4 py-2 rounded text-white flex items-center gap-2"
        >
          <Plus size={16} /> Add Team
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 flex gap-2">
          <input
            value={newTeamName}
            onChange={e => setNewTeamName(e.target.value)}
            className="p-2 rounded text-black"
            placeholder="Team name"
          />
          <button
            onClick={handleCreateTeam}
            className="bg-blue-600 px-4 py-2 rounded text-white"
          >
            Create
          </button>
        </div>
      )}

      <div className="space-y-6">
        {teams.map(team => (
          <div key={team.id} className="bg-[#222] p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">{team.name}</h2>
            <p className="text-sm text-gray-400 mb-3">Created by: {team.created_by}</p>

            <ul className="space-y-2">
              {team.members.map((member) => (
                <li
                  key={`${team.id}-${member.email}`}
                  className="flex justify-between items-center bg-[#2d2d2d] p-2 rounded"
                >
                  <div>
                    <strong>{member.user}</strong> –{" "}
                    <span className="text-xs">{member.role}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newRole = member.role === "member" ? "admin" : "member";
                        changeRole(team.id.toString(), member.id.toString(), newRole).then(() => {
                          setTeams(ts =>
                            ts.map(t =>
                              t.id === team.id
                                ? {
                                    ...t,
                                    members: t.members.map(m =>
                                      m.id === member.id ? { ...m, role: newRole } : m
                                    ),
                                  }
                                : t
                            )
                          );
                        });
                      }}
                      className="text-yellow-400 text-xs"
                    >
                      Toggle Role
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Remove member?")) {
                          removeMember(team.id.toString(), member.id.toString()).then(() => {
                            setTeams(ts =>
                              ts.map(t =>
                                t.id === team.id
                                  ? {
                                      ...t,
                                      members: t.members.filter(m => m.id !== member.id),
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
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <InviteForm
                teamId={team.id}
                onInvite={email => {
                  inviteMember(team.id.toString(), email, "member").then(() =>
                    alert("Invited!")
                  );
                }}
              />
              <button
                onClick={() => {
                  if (confirm("Delete team?"))
                    apiDeleteTeam(team.id.toString()).then(() => {
                      setTeams(ts => ts.filter(t => t.id !== team.id));
                    });
                }}
                className="mt-3 text-sm text-red-500"
              >
                <Trash2 size={16} className="inline mr-1" /> Delete team
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InviteForm({
  teamId,
  onInvite,
}: {
  teamId: number;
  onInvite: (email: string) => void;
}) {
  const [email, setEmail] = useState("");

  function handleInvite() {
    if (!email.trim()) {
      alert("Please enter an email address before inviting.");
      return;
    }
    onInvite(email.trim());
    setEmail("");
  }

  return (
    <div className="flex gap-2 mt-4">
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="p-2 rounded text-white bg-gray-800 placeholder-gray-400 border border-gray-600"
        placeholder="Email to invite"
      />
      <button
        onClick={handleInvite}
        className="bg-blue-600 px-4 py-1 rounded text-white"
      >
        <UserPlus2 size={16} /> Invite
      </button>
    </div>
  );
}
