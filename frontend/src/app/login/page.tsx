// frontend/src/app/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import axiosClient from "@/lib/axiosClient";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(""); // register only
  const [lastName, setLastName]   = useState(""); // register only
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim() || (isRegister && (!firstName.trim() || !lastName.trim()))) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const res = await axiosClient.post("/users/register/", {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        });
        const { access, refresh } = res.data.token;
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);
        router.push("/dashboard");
      } else {
        await login(email, password);
      }
    } catch (e: any) {
  const res = e?.response;
  if (res?.data) {
    const data = res.data;
    if (typeof data === "string") {
      setError(data);
    } else if (typeof data === "object") {
      const flatErrors = Object.entries(data)
        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
        .join(" | ");
      setError(flatErrors || "Something went wrong.");
    } else {
      setError("Unexpected error occurred.");
    }
  } else {
    setError(e.message || "Request failed.");
  }
}
 finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-zinc-800 to-zinc-900">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
        <div className="mb-6 text-center">
          <button
            className={`px-4 py-1 text-sm font-medium rounded-l-lg ${
              !isRegister ? "bg-blue-600 text-white" : "text-zinc-400"
            }`}
            onClick={() => setIsRegister(false)}
          >
            Sign In
          </button>
          <button
            className={`px-4 py-1 text-sm font-medium rounded-r-lg ${
              isRegister ? "bg-blue-600 text-white" : "text-zinc-400"
            }`}
            onClick={() => setIsRegister(true)}
          >
            Register
          </button>
        </div>

        <h1 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">
          {isRegister ? "Create Account" : "Sign In"}
        </h1>
        <p className="text-zinc-400 text-center mb-8">
          {isRegister
            ? "Register to access your project manager account"
            : "Access your project manager account"}
        </p>

        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="on">
          {isRegister && (
            <>
              <div>
                <label htmlFor="firstName" className="block text-zinc-300 text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-zinc-300 text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-zinc-300 text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-zinc-300 text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="bg-red-800/70 border border-red-900 rounded px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold transition bg-blue-600 hover:bg-blue-700 focus:bg-blue-800 text-white shadow ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading
              ? isRegister
                ? "Registering..."
                : "Signing in..."
              : isRegister
              ? "Register"
              : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
