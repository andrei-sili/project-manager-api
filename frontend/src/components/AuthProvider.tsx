// Path: frontend/src/components/AuthProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// --- Types from backend serializers ---
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_joined?: string;
  [key: string]: any;
}

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
 * Refresh only the access token using the refresh token.
 * Throws if no valid refresh token exists.
 */
export async function refreshToken(): Promise<void> {
  const refresh = typeof window !== "undefined" ? localStorage.getItem("refresh") : null;
  if (!refresh) throw new Error("No refresh token available");
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`,
    { refresh }
  );
  localStorage.setItem("access", res.data.access);
}

/**
 * Provides auth state and actions to its children.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /** Load current user profile if access token exists */
  const refreshUser = async (): Promise<void> => {
    const access = typeof window !== "undefined" ? localStorage.getItem("access") : null;
    if (!access) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/me/`,
        { headers: { Authorization: `Bearer ${access}` } }
      );
      setUser(res.data);
    } catch {
      // Invalid token: clear session
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /** Perform login and store tokens */
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/token_obtain_pair/`,
        { email, password }
      );
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      await refreshUser();
      router.push("/dashboard");
    } catch (e: any) {
      throw new Error(e?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /** Logout and clear storage */
  const logout = (): void => {
    setUser(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.replace("/login");
  };

  // On mount, attempt to refresh user
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to consume auth context.
 * Must be used inside AuthProvider.
 */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export default AuthProvider;
