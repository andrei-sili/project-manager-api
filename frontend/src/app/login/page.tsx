'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('http://localhost:8000/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      router.push('/');
    } else {
      setError('Email sau parolă incorectă.');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-900 text-white">
      <form className="bg-zinc-800 p-6 rounded shadow w-80" onSubmit={handleLogin}>
        <h2 className="text-xl font-bold mb-4">Autentificare</h2>
        <input
          className="w-full p-2 mb-3 rounded bg-zinc-700 text-white"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full p-2 mb-3 rounded bg-zinc-700 text-white"
          type="password"
          placeholder="Parolă"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 p-2 rounded mt-2">
          Login
        </button>
      </form>
    </div>
  );
}
