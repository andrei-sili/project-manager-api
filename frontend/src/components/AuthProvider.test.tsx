import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));

vi.mock("@/lib/axiosClient", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import apiClient from "@/lib/axiosClient";
import { AuthProvider, useAuth } from "@/components/AuthProvider";

const mockedGet = apiClient.get as unknown as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as unknown as ReturnType<typeof vi.fn>;

function Consumer() {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.email : "anonymous"}</span>
      <button onClick={() => login("ana@example.com", "secret")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>,
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("logs in: stores tokens, loads the user and redirects", async () => {
    mockedPost.mockResolvedValueOnce({ data: { access: "a1", refresh: "r1" } }); // token_obtain_pair
    mockedGet.mockResolvedValue({ data: { id: 1, email: "ana@example.com", first_name: "Ana", last_name: "P" } });

    renderProvider();
    await userEvent.click(screen.getByText("login"));

    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("ana@example.com"));
    expect(localStorage.getItem("access")).toBe("a1");
    expect(localStorage.getItem("refresh")).toBe("r1");
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("logs out: clears tokens and redirects to login", async () => {
    localStorage.setItem("access", "a1");
    localStorage.setItem("refresh", "r1");
    mockedPost.mockResolvedValue({ data: {} }); // best-effort /logout/

    renderProvider();
    await userEvent.click(screen.getByText("logout"));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(localStorage.getItem("access")).toBeNull();
    expect(localStorage.getItem("refresh")).toBeNull();
  });
});
