"use client";

import { useEffect } from "react";
import apiClient from "@/lib/axiosClient";
import { getAccessToken, refreshAccessToken } from "@/lib/token";
import { useAuth } from "@/lib/useAuth";

export function useApiInterceptors(): void {
  const { logout } = useAuth();

  useEffect(() => {
    // Request interceptor: attach access token
    const reqI = apiClient.interceptors.request.use((config) => {
      const token = getAccessToken();
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
            const access = await refreshAccessToken();
            if (!originalRequest.headers) {
              originalRequest.headers = {};
            }
            originalRequest.headers.Authorization = `Bearer ${access}`;
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
