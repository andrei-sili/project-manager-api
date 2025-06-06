// // src/components/AuthProvider.tsx
//
// "use client";
// import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
//
// // typs for user info
// interface User {
//   id: number;
//   email: string;
//   first_name: string;
//   last_name: string;
//   roles?: string[];
// }
//
// interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   refreshUser: () => Promise<void>;
// }
//
// const AuthContext = createContext<AuthContextType | undefined>(undefined);
//
// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// }
//
// export default function AuthProvider({ children }: { children: ReactNode }) {
//   const router = useRouter();
//   const [user, setUser] = useState<User | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//
//   // ======================
//   // Base function
//   // ======================
//   const getAccess = () => typeof window !== "undefined" ? localStorage.getItem("access") : null;
//   const getRefresh = () => typeof window !== "undefined" ? localStorage.getItem("refresh") : null;
//
//
//   const refreshUser = async () => {
//     const access = getAccess();
//     if (!access) {
//       setIsAuthenticated(false);
//       setUser(null);
//       setLoading(false);
//       return;
//     }
//     try {
//       setLoading(true);
//       const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me/`, {
//         headers: { Authorization: `Bearer ${access}` },
//       });
//       setUser(res.data);
//       setIsAuthenticated(true);
//     } catch {
//       setUser(null);
//       setIsAuthenticated(false);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   // ======================
//   // Login
//   // ======================
//   const login = async (email: string, password: string) => {
//     setLoading(true);
//     try {
//       const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/token_obtain_pair/`, {
//         email,
//         password,
//       });
//       localStorage.setItem("access", res.data.access);
//       localStorage.setItem("refresh", res.data.refresh);
//       await refreshUser();
//       setIsAuthenticated(true);
//       router.replace("/dashboard");
//     } catch (err) {
//       setUser(null);
//       setIsAuthenticated(false);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   // ======================
//   // Logout
//   // ======================
//   const logout = () => {
//     if (typeof window !== "undefined") {
//       localStorage.removeItem("access");
//       localStorage.removeItem("refresh");
//       setUser(null);
//       setIsAuthenticated(false);
//       router.replace("/login");
//     }
//   };
//
//   // ======================
//   // Auto-refresh token for 401
//   // ======================
//   useEffect(() => {
//     const interceptor = axios.interceptors.response.use(
//       res => res,
//       async (error) => {
//         const originalRequest = error.config;
//         if (
//           error.response?.status === 401 &&
//           !originalRequest._retry &&
//           getRefresh()
//         ) {
//           originalRequest._retry = true;
//           try {
//             const refreshRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`, {
//               refresh: getRefresh(),
//             });
//             localStorage.setItem("access", refreshRes.data.access);
//             axios.defaults.headers.common["Authorization"] = `Bearer ${refreshRes.data.access}`;
//             return axios(originalRequest);
//           } catch (e) {
//             logout();
//             return Promise.reject(e);
//           }
//         }
//         return Promise.reject(error);
//       }
//     );
//     return () => axios.interceptors.response.eject(interceptor);
//
//   }, []);
//
//   // ======================
//   // Logout synchronization on all tans
//   // ======================
//   useEffect(() => {
//     const syncLogout = (e: StorageEvent) => {
//       if (e.key === "access" && e.newValue === null) {
//         setUser(null);
//         setIsAuthenticated(false);
//         router.replace("/login");
//       }
//     };
//     window.addEventListener("storage", syncLogout);
//     return () => window.removeEventListener("storage", syncLogout);
//
//   }, []);
//
//   // ======================
//   // Auto-login if token exist
//   // ======================
//   useEffect(() => {
//     refreshUser();
//
//   }, []);
//
//   // ======================
//   // Return context
//   // ======================
//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isAuthenticated,
//         loading,
//         login,
//         logout,
//         refreshUser,
//       }}
//     >
//       {loading ? (
//         <div className="flex items-center justify-center min-h-screen text-lg">
//           <span className="animate-pulse">Loading...</span>
//         </div>
//       ) : (
//         children
//       )}
//     </AuthContext.Provider>
//   );
// }
//


// frontend/src/components/AuthProvider.tsx

"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// User type
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

  // Checks if the user is logged in (access token) and fetches user profile
  const refreshUser = async () => {
    const access = typeof window !== "undefined" ? localStorage.getItem("access") : null;
    if (!access) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/`,
        {
          headers: { Authorization: `Bearer ${access}` }
        }
      );
      setUser(res.data);
    } catch (e) {
      setUser(null);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Handles login, stores tokens, fetches user, redirects to dashboard
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

  // Clears user session
  const logout = () => {
    setUser(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
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

// Hook to use Auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default AuthProvider;
