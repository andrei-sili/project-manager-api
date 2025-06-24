// frontend/src/components/UserProfileCard.tsx
import React from "react";
import { useAuth } from "@/components/AuthProvider";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Project } from "@/lib/types";
import { stringToColor } from "@/lib/color";
interface Props {
  projects: Project[];
}

export default function UserProfileCard({ projects }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const name =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.email;
  const letter = name[0]?.toUpperCase() || "?";

  const projectRoles =
    projects
      .map((project) => {
        if (!project.team?.members) return null;
        const member = project.team.members.find(
          (m) =>
            (m.user && m.user.email === user.email) ||
            (m.user && m.user.id === user.id)
        );

        if (!member) return null;
        return {
          project: { id: project.id, name: project.name },
          role: member.role,
        };
      })
      .filter(Boolean) as { project: { id: number; name: string }; role: string }[];

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

      <div className="w-full flex flex-col gap-1 mb-2">
        {projectRoles.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
            <User className="w-4 h-4" />
            No project roles
          </div>
        ) : (
          projectRoles.map((pr) => (
            <div
              key={pr.project.id}
              className="flex items-center gap-2 text-xs text-blue-400 justify-center"
            >
              <User className="w-4 h-4" />
              <span className="font-medium">{pr.role}</span>
              <span className="text-gray-400">at</span>
              <span className="font-semibold">{pr.project.name}</span>
            </div>
          ))
        )}
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
