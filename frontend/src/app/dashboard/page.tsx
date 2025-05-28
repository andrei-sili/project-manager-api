"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  useEffect(() => {
    api.get("projects/")
      .then((res) => setProjects(Array.isArray(res.data) ? res.data : []))

      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Projects</h1>
      <ul className="list-disc pl-5">
        {projects.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
