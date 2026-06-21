import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "@/components/StatCard";

describe("StatCard", () => {
  it("renders the label and value", () => {
    render(<StatCard label="Total tasks" value="42" />);
    expect(screen.getByText("Total tasks")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders the optional hint when provided", () => {
    render(<StatCard label="Done" value="10" hint="+3 this week" />);
    expect(screen.getByText("+3 this week")).toBeInTheDocument();
  });

  it("omits the hint when not provided", () => {
    render(<StatCard label="Done" value="10" />);
    expect(screen.queryByText("+3 this week")).not.toBeInTheDocument();
  });
});
