// frontend/src/app/dashboard/projects/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Plus, Filter, Search, Loader2 } from "lucide-react";
import NewProjectModal from "@/components/NewProjectModal";
import ProjectOverviewCard from "@/components/ProjectOverviewCard";
import axios from "axios";
import type { Project, Team } from "@/lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load all projects & teams
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/projects/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
      })
      .then(res => setProjects(Array.isArray(res.data.results) ? res.data.results : []))
      .finally(() => setLoading(false));

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/teams/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
      })
      .then(res => setTeams(Array.isArray(res.data.results) ? res.data.results : []));
  }, [showModal]); // reload when a project is added

  // Search & filter
  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesTeam = !teamFilter || (p.team && p.team.id.toString() === teamFilter);
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="max-w-7xl mx-auto px-2 py-8">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center mb-8 justify-between">
        <h1 className="text-3xl font-extrabold text-blue-400 tracking-tight">Projects</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2 text-zinc-400" size={18} />
            <input
              className="bg-zinc-800 pl-8 pr-3 py-2 rounded-lg text-white border border-zinc-700 focus:border-blue-500 outline-none w-full"
              placeholder="Search projects…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-zinc-800 px-3 py-2 rounded-lg text-white border border-zinc-700 focus:border-blue-500 outline-none"
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
          >
            <option value="">All teams</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition shadow"
            onClick={() => setShowModal(true)}
          >
            <Plus size={19} />
            Add Project
          </button>
        </div>
      </div>

      {/* GRID projects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-2xl shadow p-7 animate-pulse h-44"></div>
          ))
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full text-gray-400 text-center py-10 text-lg">
            No projects found.
          </div>
        ) : (
          filteredProjects.map(project => (
            <ProjectOverviewCard key={project.id} project={project} />
          ))
        )}
      </div>

      {/* Add Project Modal */}
      {showModal && (
        <NewProjectModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onProjectAdded={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
