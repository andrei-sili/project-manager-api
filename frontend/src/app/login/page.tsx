'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) throw new Error('Invalid credentials')
      const data = await res.json()
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Email sau parolă incorectă')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-32 p-6 bg-zinc-800 rounded">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="email" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} className="p-2 rounded bg-zinc-900 border" />
        <input type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} className="p-2 rounded bg-zinc-900 border" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white py-2 rounded">Autentificare</button>
      </form>
    </div>
  )
}
