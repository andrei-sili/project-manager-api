"use client";

import { useEffect } from "react";
import apiClient from "@/lib/axiosClient";
import { useAuth } from "@/lib/useAuth";

export function useApiInterceptors(): void {
  const { logout } = useAuth();

  useEffect(() => {
    // Request interceptor: attach access token
    const reqI = apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem("access");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor: auto-refresh on 401
    const resI = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Already retried this request
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refresh = localStorage.getItem("refresh");
            const r2 = await apiClient.post<{ access: string }>("/token/refresh/", { refresh });
            localStorage.setItem("access", r2.data.access);
            if (!originalRequest.headers) {
              originalRequest.headers = {};
            }
            originalRequest.headers.Authorization = `Bearer ${r2.data.access}`;
            return apiClient.request(originalRequest);
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
