// src/components/AuthProvider.tsx

"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  isAuthenticated as checkAuth,
  getAccessToken,
  getRefreshToken,
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshAccessToken
} from "@/lib/auth";

/**
 * User type definition
 */
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_joined?: string;
  [key: string]: any;
}

/**
 * Context type for authentication
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component - provides authentication context and state to children
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Fetch user profile from backend using access token.
   * If the token is expired but refresh token exists, tries to refresh the token.
   */
  const refreshUser = async () => {
    setLoading(true);
    let access = getAccessToken();

    // If not authenticated or token expired, try refresh
    if (!access || !checkAuth()) {
      try {
        await refreshAccessToken();
        access = getAccessToken();
      } catch {
        // If cannot refresh, log out and stop
        setUser(null);
        setLoading(false);
        logoutApi();
        return;
      }
    }

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/`,
        { headers: { Authorization: `Bearer ${access}` } }
      );
      setUser(res.data);
    } catch {
      setUser(null);
      logoutApi();
    } finally {
      setLoading(false);
    }
  };

  // On mount, check authentication and fetch user
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line
  }, []);

  /**
   * Handles login, stores tokens, fetches user, and redirects.
   */
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await loginApi(email, password);
      await refreshUser();
      if (getAccessToken()) {
        router.push("/dashboard");
      } else {
        throw new Error("No access token after login");
      }
    } catch (e: any) {
      throw new Error(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles logout and redirects to login page.
   */
  const logout = () => {
    setUser(null);
    logoutApi();
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access authentication context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default AuthProvider;
