import { describe, it, expect } from "vitest";
import { stringToColor } from "@/lib/color";

describe("stringToColor", () => {
  it("returns a valid 6-digit hex color", () => {
    expect(stringToColor("Andrei")).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("is deterministic for the same input", () => {
    expect(stringToColor("team-alpha")).toBe(stringToColor("team-alpha"));
  });

  it("produces different colors for different inputs", () => {
    expect(stringToColor("alpha")).not.toBe(stringToColor("beta"));
  });

  it("pads short values to a full 6-digit hex (empty string)", () => {
    expect(stringToColor("")).toMatch(/^#[0-9a-f]{6}$/);
  });
});
