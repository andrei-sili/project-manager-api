import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskBadge, { statusBadgeColor, priorityBadgeColor } from "@/components/TaskBadge";
import { Task } from "@/lib/types";

describe("badge color helpers", () => {
  it("maps known statuses to colors", () => {
    expect(statusBadgeColor("done")).toContain("green");
    expect(statusBadgeColor("in_progress")).toContain("yellow");
    expect(statusBadgeColor("todo")).toContain("gray");
  });

  it("is case-insensitive", () => {
    expect(statusBadgeColor("DONE")).toBe(statusBadgeColor("done"));
  });

  it("falls back to gray for unknown or empty values", () => {
    expect(statusBadgeColor("")).toContain("gray");
    expect(priorityBadgeColor("nonsense")).toContain("gray");
  });

  it("maps known priorities to colors", () => {
    expect(priorityBadgeColor("high")).toContain("red");
    expect(priorityBadgeColor("low")).toContain("green");
  });
});

const baseTask: Task = {
  id: 1,
  title: "Write tests",
  description: "Cover the badge component",
  status: "in_progress",
  priority: "high",
  due_date: "2026-07-01",
  assigned_to: null,
  created_by: {
    id: 1,
    first_name: "Andrei",
    last_name: "Sili",
    email: "andrei@example.com",
    date_joined: "2026-01-01",
  },
  project: { id: 1, name: "Portfolio" },
  created_at: "2026-06-01",
};

describe("TaskBadge", () => {
  it("renders the task title, description and due date", () => {
    render(<TaskBadge task={baseTask} />);
    expect(screen.getByText("Write tests")).toBeInTheDocument();
    expect(screen.getByText("Cover the badge component")).toBeInTheDocument();
    expect(screen.getByText(/Due: 2026-07-01/)).toBeInTheDocument();
  });

  it("renders status and priority badges", () => {
    render(<TaskBadge task={baseTask} />);
    expect(screen.getByText("IN PROGRESS")).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("omits the due date when there is none", () => {
    render(<TaskBadge task={{ ...baseTask, due_date: null }} />);
    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
  });

  it("calls onView (and not onClick) when the View button is clicked", async () => {
    const onClick = vi.fn();
    const onView = vi.fn();
    render(<TaskBadge task={baseTask} onClick={onClick} onView={onView} />);

    await userEvent.click(screen.getByRole("button", { name: "View" }));

    expect(onView).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });
});
