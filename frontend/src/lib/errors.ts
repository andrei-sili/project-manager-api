import axios from "axios";

/**
 * Extract a human-readable message from an axios/unknown error,
 * falling back to a caller-provided default.
 */
export function getErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;
      if (typeof record.detail === "string") return record.detail;
      for (const value of Object.values(record)) {
        if (Array.isArray(value) && typeof value[0] === "string") return value[0];
        if (typeof value === "string") return value;
      }
    }
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
