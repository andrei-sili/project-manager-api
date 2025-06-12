// // Path: frontend/src/lib/useApi.tsx
// "use client";
//
// import { useEffect } from "react";
// import apiClient from "@/lib/axiosClient";
// import { useAuth } from "@/lib/useAuth";
//
// export function useApiInterceptors(): void {
//   const { logout } = useAuth();
//
//   useEffect(() => {
//     const reqI = apiClient.interceptors.request.use((config) => {
//       const token = localStorage.getItem("access");
//       if (token && config.headers) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//       return config;
//     });
//
//     const resI = apiClient.interceptors.response.use(
//       (response) => response,
//       async (error) => {
//         if (error.response?.status === 401) {
//           try {
//             const refresh = localStorage.getItem("refresh");
//             const r2 = await apiClient.post<{ access: string }>("/token/refresh/", { refresh });
//             localStorage.setItem("access", r2.data.access);
//             error.config.headers.Authorization = `Bearer ${r2.data.access}`;
//             return apiClient.request(error.config);
//           } catch {
//             logout();
//           }
//         }
//         return Promise.reject(error);
//       }
//     );
//
//     return () => {
//       apiClient.interceptors.request.eject(reqI);
//       apiClient.interceptors.response.eject(resI);
//     };
//   }, [logout]);
// }
// Path: frontend/src/lib/useApi.tsx
"use client";

import { useEffect } from "react";
import apiClient from "@/lib/axiosClient";
import { useAuth } from "@/lib/useAuth";

export function useApiInterceptors(): void {
  const { logout } = useAuth();

  useEffect(() => {
    const reqI = apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem("access");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    const resI = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            const refresh = localStorage.getItem("refresh");
            const r2 = await apiClient.post<{ access: string }>("/token/refresh/", { refresh });
            localStorage.setItem("access", r2.data.access);
            error.config.headers.Authorization = `Bearer ${r2.data.access}`;
            return apiClient.request(error.config);
          } catch {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(reqI);
      apiClient.interceptors.response.eject(resI);
    };
  }, [logout]);
}
