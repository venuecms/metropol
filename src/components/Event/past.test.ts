import { describe, expect, it } from "vitest";

import { isPastEvent } from "./past";

const NOW = new Date("2026-06-01T12:00:00Z");

describe("isPastEvent", () => {
  it("is past once the end has gone by", () => {
    expect(
      isPastEvent(
        { startDate: "2026-05-01T19:00:00Z", endDate: "2026-05-01T23:00:00Z" },
        NOW,
      ),
    ).toBe(true);
  });

  it("is not past while still running", () => {
    expect(
      isPastEvent(
        { startDate: "2026-05-01T10:00:00Z", endDate: "2026-07-01T18:00:00Z" },
        NOW,
      ),
    ).toBe(false);
  });

  it("is not past before it starts", () => {
    expect(
      isPastEvent(
        { startDate: "2026-06-10T19:00:00Z", endDate: "2026-06-10T23:00:00Z" },
        NOW,
      ),
    ).toBe(false);
  });

  it("falls back to the start when there is no end", () => {
    expect(
      isPastEvent({ startDate: "2026-05-01T19:00:00Z", endDate: "" }, NOW),
    ).toBe(true);
  });

  it("treats an unreadable date as not past, keeping the tickets up", () => {
    expect(isPastEvent({ startDate: "", endDate: "" }, NOW)).toBe(false);
  });
});
