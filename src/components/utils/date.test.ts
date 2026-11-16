import { describe, expect, it } from "vitest";

import { formatDate, formatDateRange, formatTime } from "./date";

const timeZone = "Europe/Bratislava";

describe("formatDate", () => {
  it("keeps the English format by default", () => {
    expect(
      formatDate({
        date: "2026-11-16T19:00:00+01:00",
        timeZone,
        template: "EEEE d MMMM yyyy",
      }),
    ).toBe("Monday 16 November 2026 • 7pm");
  });

  it("writes Slovak dates with ordinal days, genitive months and 24h time", () => {
    expect(
      formatDate({
        date: "2026-11-16T19:30:00+01:00",
        timeZone,
        template: "EEEE d MMMM yyyy",
        locale: "sk",
      }),
    ).toBe("pondelok, 16. novembra 2026 • 19:30");
  });

  it("localizes a date-only Slovak template", () => {
    expect(
      formatDate({
        date: "2026-11-16T19:30:00+01:00",
        timeZone,
        withTime: false,
        template: "d MMMM yyyy",
        locale: "sk",
      }),
    ).toBe("16. novembra 2026");
  });
});

describe("formatDateRange", () => {
  it("formats an English range across months", () => {
    expect(
      formatDateRange({
        start: "2026-11-30T19:00:00+01:00",
        end: "2026-12-02T19:00:00+01:00",
        timeZone,
      }),
    ).toBe("30 November — 2 December 2026");
  });

  it("formats a Slovak range within a month", () => {
    expect(
      formatDateRange({
        start: "2026-11-16T19:00:00+01:00",
        end: "2026-11-20T19:00:00+01:00",
        timeZone,
        locale: "sk",
      }),
    ).toBe("16.—20. novembra 2026");
  });

  it("formats a Slovak range across months", () => {
    expect(
      formatDateRange({
        start: "2026-11-30T19:00:00+01:00",
        end: "2026-12-02T19:00:00+01:00",
        timeZone,
        locale: "sk",
      }),
    ).toBe("30. novembra — 2. decembra 2026");
  });

  it("treats the same weekday a week later as a multi-day range", () => {
    expect(
      formatDateRange({
        start: "2026-11-16T19:00:00+01:00",
        end: "2026-11-23T19:00:00+01:00",
        timeZone,
      }),
    ).toBe("16—23 November 2026");
  });
});

describe("formatTime", () => {
  it("writes an English time the way the date line does", () => {
    expect(formatTime({ date: "2026-11-16T20:00:00+01:00", timeZone })).toBe(
      "8pm",
    );
    expect(formatTime({ date: "2026-11-16T19:30:00+01:00", timeZone })).toBe(
      "7.30pm",
    );
  });

  it("writes a Slovak time on the 24-hour clock", () => {
    expect(
      formatTime({
        date: "2026-11-16T20:00:00+01:00",
        timeZone,
        locale: "sk",
      }),
    ).toBe("20:00");
  });
});
