"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import axiosClient from "@/lib/axiosClient";
import { getErrorMessage } from "@/lib/errors";
import Turnstile, { turnstileEnabled } from "@/components/Turnstile";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(""); // register only
  const [lastName, setLastName]   = useState(""); // register only
  const [captchaToken, setCaptchaToken] = useState(""); // register only
  const [error, setError]       = useState("");
  const [info, setInfo]         = useState("");
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();

  // Read-only demo account, reseeded nightly on the server.
  const handleDemo = async () => {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await login("alice@example.com", "Demo1234!");
    } catch (e) {
      setError(getErrorMessage(e, "Demo sign-in failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email.trim() || !password.trim() || (isRegister && (!firstName.trim() || !lastName.trim()))) {
      setError("All fields are required.");
      return;
    }
    if (isRegister && turnstileEnabled && !captchaToken) {
      setError("Please complete the CAPTCHA.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        await axiosClient.post("/users/register/", {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          turnstile_token: captchaToken,
        });
        // Account is created inactive; the user must verify by email before login.
        setInfo("Account created! Check your email for a verification link, then sign in.");
        setIsRegister(false);
        setPassword("");
        setFirstName("");
        setLastName("");
        setCaptchaToken("");
      } else {
        await login(email, password);
      }
    } catch (e) {
      setError(getErrorMessage(e, "Request failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-zinc-800 to-zinc-900">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
        <div className="mb-6 text-center">
          <button
            className={`px-4 py-1 text-sm font-medium rounded-l-lg ${
              !isRegister ? "bg-emerald-600 text-white" : "text-zinc-400"
            }`}
            onClick={() => setIsRegister(false)}
          >
            Sign In
          </button>
          <button
            className={`px-4 py-1 text-sm font-medium rounded-r-lg ${
              isRegister ? "bg-emerald-600 text-white" : "text-zinc-400"
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

          {isRegister && <Turnstile onVerify={setCaptchaToken} />}

          {info && (
            <div className="bg-emerald-900/60 border border-emerald-800 rounded px-3 py-2 text-sm text-emerald-200">
              {info}
            </div>
          )}
          {error && (
            <div className="bg-red-800/70 border border-red-900 rounded px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold transition bg-emerald-600 hover:bg-emerald-700 focus:bg-emerald-700 text-white shadow ${
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

        {!isRegister && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs text-zinc-500">
              <span className="h-px flex-1 bg-zinc-800" />
              or
              <span className="h-px flex-1 bg-zinc-800" />
            </div>
            <button
              type="button"
              onClick={handleDemo}
              disabled={loading}
              className="w-full py-2 rounded-lg font-semibold transition border border-emerald-700 text-emerald-300 hover:bg-emerald-700/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Try the demo
            </button>
            <p className="mt-2 text-center text-xs text-zinc-500">
              Explore a sample workspace — no sign-up needed.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
