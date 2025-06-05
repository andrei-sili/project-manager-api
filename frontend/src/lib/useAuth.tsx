// src/lib/useAuth.tsx
"use client";
import { useState, useEffect } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    const token = !!localStorage.getItem("access");
    setIsAuthenticated(token);
  }, []);
  return { isAuthenticated };
}
