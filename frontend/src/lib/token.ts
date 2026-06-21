import apiClient from "./axiosClient";

const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

/** Persist the access token and, when rotation returns one, the new refresh token. */
export function setTokens(access: string, refresh?: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/**
 * Exchange the stored refresh token for a fresh access token.
 *
 * With ROTATE_REFRESH_TOKENS the backend also returns a new refresh token and
 * blacklists the old one, so we must persist it; otherwise the next refresh
 * would fail with an already-blacklisted token. Returns the new access token.
 */
export async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");
  const res = await apiClient.post<{ access: string; refresh?: string }>(
    "/token/refresh/",
    { refresh },
  );
  setTokens(res.data.access, res.data.refresh);
  return res.data.access;
}
