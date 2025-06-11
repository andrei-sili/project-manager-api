// frontend/src/app/dashboard/time-tracking/page.tsx

"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button"; // Poți folosi orice button ai deja
import { Input } from "@/components/ui/input";   // Poți folosi orice input ai deja
import { Clock, Trash2, Edit2, Plus } from "lucide-react";

interface TimeEntry {
  id: number;
  date: string;
  minutes: number;
  note: string;
  task: number;
}

interface TaskOption {
  id: number;
  title: string;
}

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  if (m) return `${m}m`;
  return "0m";
}

export default function TimeTrackingPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    date: "",
    minutes: "",
    note: "",
    task: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch all time entries and tasks
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/time-entries/"),
      api.get("/my-tasks/"), // Sau "/tasks/" dacă ai nevoie de toate task-urile
    ])
      .then(([resEntries, resTasks]) => {
        setEntries(resEntries.data);
        setTasks(resTasks.data.results || resTasks.data); // results dacă folosești pagination
      })
      .catch(() => setError("Could not fetch time entries or tasks"))
      .finally(() => setLoading(false));
  }, []);

  // Handle input changes
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Add new time entry
  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    api
      .post("/time-entries/", {
        ...form,
        minutes: parseInt(form.minutes, 10),
        task: parseInt(form.task, 10),
      })
      .then((res) => {
        setEntries([res.data, ...entries]);
        setForm({ date: "", minutes: "", note: "", task: "" });
      })
      .catch(() => setError("Could not add time entry"))
      .finally(() => setAdding(false));
  }

  // Delete time entry
  function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this time entry?")) return;
    api.delete(`/time-entries/${id}/`).then(() => {
      setEntries(entries.filter((e) => e.id !== id));
    });
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-6 text-blue-400">
        <Clock className="w-7 h-7" /> Time Tracking
      </h1>
      {/* Add New Entry */}
      <form className="flex flex-col gap-3 bg-zinc-900 rounded-xl shadow p-4 mb-6" onSubmit={handleAdd}>
        <div className="flex flex-col md:flex-row gap-3">
          <label className="flex-1">
            <span className="text-xs text-gray-400 mb-1 block">Task</span>
            <select
              name="task"
              value={form.task}
              onChange={handleChange}
              className="w-full rounded p-2 bg-zinc-800 text-white"
              required
            >
              <option value="">Select task</option>
              {tasks.map((task) => (
                <option value={task.id} key={task.id}>{task.title || `Task #${task.id}`}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-xs text-gray-400 mb-1 block">Date</span>
            <Input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full"
            />
          </label>
          <label>
            <span className="text-xs text-gray-400 mb-1 block">Minutes</span>
            <Input
              type="number"
              min={1}
              max={1440}
              name="minutes"
              value={form.minutes}
              onChange={handleChange}
              required
              className="w-full"
            />
          </label>
        </div>
        <label>
          <span className="text-xs text-gray-400 mb-1 block">Note</span>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            rows={2}
            className="w-full rounded p-2 bg-zinc-800 text-white resize-none"
          />
        </label>
        {error && <div className="text-red-400">{error}</div>}
        <Button type="submit" disabled={adding}>
          <Plus className="w-4 h-4 mr-1" /> {adding ? "Saving..." : "Add Entry"}
        </Button>
      </form>
      {/* List of Time Entries */}
      <div className="bg-zinc-900 rounded-xl shadow p-4">
        <h2 className="text-xl font-bold text-white mb-3">Logged Time</h2>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-gray-400">No time entries yet.</div>
        ) : (
          <table className="w-full text-sm text-gray-200">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-left">Task</th>
                <th className="py-2 text-left">Time</th>
                <th className="py-2 text-left">Note</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-zinc-800 hover:bg-zinc-800/60">
                  <td className="py-1">{entry.date}</td>
                  <td className="py-1">{tasks.find(t => t.id === entry.task)?.title || `Task #${entry.task}`}</td>
                  <td className="py-1">{formatTime(entry.minutes)}</td>
                  <td className="py-1">{entry.note}</td>
                  <td className="py-1">
                    <button
                      className="text-red-400 hover:text-red-600"
                      onClick={() => handleDelete(entry.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
