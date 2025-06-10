// src/lib/auth.ts

import api from "./api";

/**
 * Interface for token pair response from backend.
 */
interface TokenPair {
  access: string;
  refresh: string;
}

/**
 * Decodes a JWT and returns its payload.
 * @param {string} token - The JWT string
 * @returns {any} - Decoded payload or null
 */
function decodeJWT(token: string): any | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}

/**
 * Checks if the given JWT is expired.
 * @param {string} token - The JWT token
 * @returns {boolean} - True if expired, false otherwise
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  // exp is in seconds since epoch
  return Date.now() >= payload.exp * 1000;
}

/**
 * Gets access token from localStorage.
 */
export function getAccessToken(): string | null {
  return localStorage.getItem("access");
}

/**
 * Gets refresh token from localStorage.
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem("refresh");
}

/**
 * Checks if the user is authenticated (i.e., has a valid access token).
 */
export function isAuthenticated(): boolean {
  const access = getAccessToken();
  if (!access) return false;
  if (isTokenExpired(access)) {
    // Optionally, auto-refresh here or return false to force login
    return false;
  }
  return true;
}

/**
 * Handles user login. Stores JWT tokens in localStorage.
 * @param {string} email - User email
 * @param {string} password - User password
 * @throws {Error} - Throws error if login fails
 */
export async function login(email: string, password: string): Promise<void> {
  const { data } = await api.post<TokenPair>("token_obtain_pair/", { email, password });
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
}

/**
 * Logs out the user by clearing tokens from localStorage.
 */
export function logout(): void {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

/**
 * Refreshes the access token using the refresh token.
 * @throws {Error} - Throws error if no refresh token or refresh fails
 */
export async function refreshToken(): Promise<void> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");
  const { data } = await api.post<{ access: string }>("token/refresh/", { refresh });
  localStorage.setItem("access", data.access);
}

