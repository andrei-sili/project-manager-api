'use client';

import Link from 'next/link';

const menu = [
  { name: 'Dashboard', href: '/' },
  { name: 'Teams', href: '/teams' },
  { name: 'Projects', href: '/projects' },
  { name: 'Tasks', href: '/tasks' },
  { name: 'Notifications', href: '/notifications' },
];


export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-zinc-900 p-4">
      <h2 className="text-xl font-bold text-white mb-4">ProjectManager</h2>
      <nav className="flex flex-col gap-2 text-white">
        <a href="#" className="hover:bg-zinc-700 p-2 rounded">Dashboard</a>
        <a href="#" className="hover:bg-zinc-700 p-2 rounded">Projects</a>
        <a href="#" className="hover:bg-zinc-700 p-2 rounded">Teams</a>
        <a href="#" className="hover:bg-zinc-700 p-2 rounded">Tasks</a>
      </nav>
    </aside>
  );
}
