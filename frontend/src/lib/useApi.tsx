// src/lib/useApi.tsx
import { useEffect } from "react";
import api from "./api";
import {logout, refreshToken} from "./auth";

export function setupInterceptors() {
  api.interceptors.request.use(config => {
    const token = localStorage.getItem("access");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    response => response,
    async error => {
      const status = error.response?.status;
      if (status === 401) {
        try {
          await refreshToken();
          return api(error.config);
        } catch {
          logout();
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );
}
