"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get("projects/")
      .then(res => setProjects(res.data))
      .catch(err => console.error("Error API:", err));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Proiectele mele</h1>
      <ul>
        {projects.map((proj: any) => (
          <li key={proj.id} className="mb-2">{proj.name}</li>
        ))}
      </ul>
    </div>
  );
}
