// // src/lib/auth.ts
// import api from "./api";
//
// interface TokenPair {
//   access: string;
//   refresh: string;
// }
//
// export async function login(email: string, password: string): Promise<void> {
//   const { data } = await api.post<TokenPair>("token_obtain_pair/", { email, password });
//   localStorage.setItem("access", data.access);
//   localStorage.setItem("refresh", data.refresh);
// }
//
// export function logout() {
//   localStorage.removeItem("access");
//   localStorage.removeItem("refresh");
// }
//
// export async function refreshToken(): Promise<void> {
//   const refresh = localStorage.getItem("refresh");
//   if (refresh) {
//     const { data } = await api.post<{ access: string }>("token/refresh/", { refresh });
//     localStorage.setItem("access", data.access);
//   } else {
//     throw new Error("No refresh token");
//   }
// }
// frontend/src/lib/useAuth.tsx
"use client";
export { useAuth } from "@/components/AuthProvider";
