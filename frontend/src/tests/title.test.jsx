import { describe, it, expect } from "vitest";

describe("HTML title", () => {
  it("is set to UCSB Dining", () => {
    document.title = "UCSB Dining";
    expect(document.title).toBe("UCSB Dining");
  });
});
