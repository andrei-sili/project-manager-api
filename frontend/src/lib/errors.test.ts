import { describe, it, expect } from "vitest";
import { getErrorMessage } from "@/lib/errors";

// Minimal shape that axios.isAxiosError() recognizes.
function axiosError(data: unknown) {
  return { isAxiosError: true, response: { data } };
}

describe("getErrorMessage", () => {
  it("returns the DRF 'detail' field", () => {
    expect(getErrorMessage(axiosError({ detail: "Not found." }))).toBe("Not found.");
  });

  it("returns the first error from a field-errors array", () => {
    expect(getErrorMessage(axiosError({ email: ["This field is required."] }))).toBe(
      "This field is required.",
    );
  });

  it("returns a plain-string response body", () => {
    expect(getErrorMessage(axiosError("Server error"))).toBe("Server error");
  });

  it("returns a string field value", () => {
    expect(getErrorMessage(axiosError({ name: "Too long" }))).toBe("Too long");
  });

  it("falls back to Error.message for a non-axios Error", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("uses the provided fallback for unknown values", () => {
    expect(getErrorMessage(null, "Custom fallback")).toBe("Custom fallback");
  });

  it("uses the default fallback when none is provided", () => {
    expect(getErrorMessage(42)).toBe("Something went wrong.");
  });
});
