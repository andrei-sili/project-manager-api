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
import { getErrorMessage } from "@/lib/errors";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  refreshAccessToken,
} from "@/lib/token";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_joined?: string;
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
 * Provides auth state & actions via context.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router                = useRouter();

  /** Load current user profile if token exists */
  const refreshUser = async (): Promise<void> => {
    const access = getAccessToken();
    const refresh = getRefreshToken();

    if (!access || !refresh) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get<User>("/users/me/", {
        headers: { Authorization: `Bearer ${access}` },
      });
      setUser(res.data);
    } catch {
      try {
        const newAccess = await refreshAccessToken();
        const retryRes = await apiClient.get<User>("/users/me/", {
          headers: { Authorization: `Bearer ${newAccess}` },
        });
        setUser(retryRes.data);
      } catch {
        clearTokens();
        setUser(null);
      }
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
      setTokens(res.data.access, res.data.refresh);
      await refreshUser();
      router.push("/dashboard");
    } catch (e) {
      throw new Error(getErrorMessage(e, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  /** Clears session and navigates to /login */
  const logout = (): void => {
    const refresh = getRefreshToken();
    if (refresh) {
      // Best-effort: blacklist the refresh token server-side; ignore failures.
      apiClient.post("/logout/", { refresh }).catch(() => {});
    }
    clearTokens();
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
