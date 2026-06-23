import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";

const logout = vi.fn();
const refreshAccessToken = vi.fn();

vi.mock("@/lib/useAuth", () => ({ useAuth: () => ({ logout }) }));
vi.mock("@/lib/token", () => ({
  getAccessToken: () => "access1",
  refreshAccessToken: () => refreshAccessToken(),
}));

import apiClient from "@/lib/axiosClient";
import { useApiInterceptors } from "@/lib/useApi";

let mock: MockAdapter;

describe("useApiInterceptors", () => {
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    logout.mockReset();
    refreshAccessToken.mockReset();
  });

  afterEach(() => {
    mock.restore();
  });

  it("refreshes the token and retries once on 401", async () => {
    refreshAccessToken.mockResolvedValue("newtoken");
    mock.onGet("/x").replyOnce(401);
    mock.onGet("/x").replyOnce(200, { ok: true });

    const { unmount } = renderHook(() => useApiInterceptors());
    const res = await apiClient.get("/x");

    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(res.data).toEqual({ ok: true });
    expect(logout).not.toHaveBeenCalled();
    unmount();
  });

  it("logs out when the refresh fails", async () => {
    refreshAccessToken.mockRejectedValue(new Error("refresh failed"));
    mock.onGet("/y").reply(401);

    const { unmount } = renderHook(() => useApiInterceptors());
    await expect(apiClient.get("/y")).rejects.toBeTruthy();

    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("passes non-401 errors through without refreshing", async () => {
    mock.onGet("/z").reply(500);

    const { unmount } = renderHook(() => useApiInterceptors());
    await expect(apiClient.get("/z")).rejects.toBeTruthy();

    expect(refreshAccessToken).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
    unmount();
  });
});
