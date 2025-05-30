"use client";
import Link from "next/link";
import { Task } from "@/lib/api";

export default function MyTasksCard({ tasks }: { tasks: Task[] }) {
  const incomplete = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <div className="bg-[#282c36] rounded-xl shadow p-5 min-h-[120px] hover:ring-2 ring-green-400 transition">
      <Link href="/dashboard/tasks" className="block">
        <h2 className="text-xl font-bold mb-3">My Tasks</h2>
        {incomplete.length === 0 ? (
          <p className="text-gray-400">No tasks left! 🎉</p>
        ) : (
          <ul className="space-y-1">
            {incomplete.slice(0, 3).map((t) => (
              <li key={t.id}>
                <Link href={`/dashboard/tasks/${t.id}`} className="hover:underline">
                  <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-2" />
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 text-xs text-gray-400">
          {completed.length}/{tasks.length} complete
        </div>
      </Link>
    </div>
  );
}
