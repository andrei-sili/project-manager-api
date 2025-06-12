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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /** Load current user if access token is stored */
  const refreshUser = async () => {
    const access = typeof window !== "undefined" && localStorage.getItem("access");
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
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /** Obtain JWT pair from DRF SimpleJWT */
  const login = async (email: string, password: string) => {
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

  /** Refresh only the access token */
  const refreshToken = async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) throw new Error("No refresh token");
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`,
      { refresh }
    );
    localStorage.setItem("access", res.data.access);
  };

  /** Clear localStorage and redirect to login */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.replace("/login");
  };

  /** On mount, attempt to load user */
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
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

// Also export refreshToken for interceptors
export { refreshToken };

export default AuthProvider;
