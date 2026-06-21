import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the axios client the token helpers depend on.
vi.mock("@/lib/axiosClient", () => ({
  default: { post: vi.fn() },
}));

import apiClient from "@/lib/axiosClient";
import {
  refreshAccessToken,
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
} from "@/lib/token";

const mockedPost = apiClient.post as unknown as ReturnType<typeof vi.fn>;

describe("token storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("stores access and refresh", () => {
    setTokens("a1", "r1");
    expect(getAccessToken()).toBe("a1");
    expect(getRefreshToken()).toBe("r1");
  });

  it("keeps the existing refresh when none is provided", () => {
    setTokens("a1", "r1");
    setTokens("a2");
    expect(getAccessToken()).toBe("a2");
    expect(getRefreshToken()).toBe("r1");
  });

  it("clears both tokens", () => {
    setTokens("a1", "r1");
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});

describe("refreshAccessToken", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("persists the rotated refresh token returned by the backend", async () => {
    setTokens("old-access", "old-refresh");
    mockedPost.mockResolvedValue({ data: { access: "new-access", refresh: "new-refresh" } });

    const access = await refreshAccessToken();

    expect(mockedPost).toHaveBeenCalledWith("/token/refresh/", { refresh: "old-refresh" });
    expect(access).toBe("new-access");
    expect(getAccessToken()).toBe("new-access");
    // The key fix: the rotated refresh token must replace the old one.
    expect(getRefreshToken()).toBe("new-refresh");
  });

  it("keeps the old refresh token when the backend does not rotate", async () => {
    setTokens("old-access", "old-refresh");
    mockedPost.mockResolvedValue({ data: { access: "new-access" } });

    await refreshAccessToken();

    expect(getRefreshToken()).toBe("old-refresh");
  });

  it("throws when there is no refresh token", async () => {
    await expect(refreshAccessToken()).rejects.toThrow("No refresh token");
    expect(mockedPost).not.toHaveBeenCalled();
  });
});
