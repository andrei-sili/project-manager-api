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
import apiClient from "@/lib/axiosClient";

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
 * Refresh access token using refresh-token endpoint.
 * POST /api/token/refresh/
 */
export async function refreshToken(): Promise<void> {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) throw new Error("No refresh token");
  const res = await apiClient.post<{ access: string }>("/token/refresh/", { refresh });
  localStorage.setItem("access", res.data.access);
}

/**
 * Provides auth state & actions via context.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router                = useRouter();

  /** Load current user profile if token exists */
  const refreshUser = async (): Promise<void> => {
    const access = localStorage.getItem("access");
    if (!access) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await apiClient.get<User>("/users/me/");
      setUser(res.data);
    } catch {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /** Perform login against POST /api/token_obtain_pair/ */
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const res = await apiClient.post<{ access: string; refresh: string }>(
        "/token_obtain_pair/",
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

  /** Clears session and navigates to /login */
  const logout = (): void => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    router.replace("/login");
  };

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

/** Hook to consume auth context */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthProvider;
