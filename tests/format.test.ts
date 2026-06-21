import { describe, it, expect } from "vitest";
import { format } from "../src/format";
import { parseISO, parse } from "../src/parse";

// ─── parseISO ────────────────────────────────────────────────────

describe("parseISO — valid date-only strings", () => {
  it("parses a basic date-only string as local midnight", () => {
    const d = parseISO("2026-01-15");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
  });

  it("parses Feb 29 in a leap year", () => {
    const d = parseISO("2024-02-29");
    expect(d.getMonth()).toBe(1);
    expect(d.getDate()).toBe(29);
  });

  it("handles month boundaries — Dec 31", () => {
    const d = parseISO("2026-12-31");
    expect(d.getMonth()).toBe(11);
    expect(d.getDate()).toBe(31);
  });
});

describe("parseISO — valid datetime strings", () => {
  it("parses local datetime without timezone", () => {
    const d = parseISO("2026-01-15T10:30:00");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(10);
    expect(d.getMinutes()).toBe(30);
  });

  it("parses UTC datetime with Z suffix", () => {
    const d = parseISO("2026-01-15T10:30:00Z");
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCHours()).toBe(10);
    expect(d.getUTCMinutes()).toBe(30);
  });

  it("parses datetime with offset", () => {
    const d = parseISO("2026-01-15T10:30:00+09:00");
    expect(d.getUTCHours()).toBe(1);
    expect(d.getUTCMinutes()).toBe(30);
  });

  it("parses datetime with milliseconds", () => {
    const d = parseISO("2026-01-15T10:30:00.123");
    expect(d.getMilliseconds()).toBe(123);
  });
});

describe("parseISO — invalid inputs", () => {
  it("throws RangeError on non-ISO string", () => {
    expect(() => parseISO("not-a-date")).toThrow(RangeError);
  });

  it("throws RangeError on empty string", () => {
    expect(() => parseISO("")).toThrow(RangeError);
  });

  it("throws RangeError on partial date", () => {
    expect(() => parseISO("2026-01")).toThrow(RangeError);
  });

  it("throws RangeError on random text", () => {
    expect(() => parseISO("hello world")).toThrow(RangeError);
  });

  it("throws RangeError on invalid date-only value", () => {
    expect(() => parseISO("2026-02-30")).toThrow(RangeError);
  });

  it("parses year 0000 date-only string", () => {
    const d = parseISO("0000-01-15");
    expect(d.getFullYear()).toBe(0);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(15);
  });

  it("throws RangeError on invalid full ISO datetime", () => {
    // This hits the isNaN guard in the full ISO path (line 38)
    expect(() => parseISO("2026-01-15T25:99:99")).toThrow(RangeError);
  });

  it("throws RangeError on invalid full ISO date component", () => {
    expect(() => parseISO("2026-02-30T10:30:00")).toThrow(RangeError);
  });
});

// ─── parse ───────────────────────────────────────────────────────

describe("parse — various patterns", () => {
  it("parses yyyy-MM-dd", () => {
    const d = parse("2026-01-15", "yyyy-MM-dd");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(15);
  });

  it("parses dd/MM/yyyy (European format)", () => {
    const d = parse("15/01/2026", "dd/MM/yyyy");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(15);
  });

  it("parses with time components", () => {
    const d = parse("2026-01-15 14:30:45", "yyyy-MM-dd HH:mm:ss");
    expect(d.getHours()).toBe(14);
    expect(d.getMinutes()).toBe(30);
    expect(d.getSeconds()).toBe(45);
  });

  it("parses with hour and minute components", () => {
    const d = parse("2026-01-15 14:30", "yyyy-MM-dd HH:mm");
    expect(d.getHours()).toBe(14);
    expect(d.getMinutes()).toBe(30);
    expect(d.getSeconds()).toBe(0);
  });

  it("parses with milliseconds", () => {
    const d = parse("2026-01-15 14:30:45.123", "yyyy-MM-dd HH:mm:ss.SSS");
    expect(d.getMilliseconds()).toBe(123);
  });

  it("defaults missing time components to zero", () => {
    const d = parse("2026-01-15", "yyyy-MM-dd");
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
  });

  it("parses patterns with trailing literal characters", () => {
    const d = parse("2026-01-15.", "yyyy-MM-dd.");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(15);
  });

  it("parses non-fast patterns with all time tokens", () => {
    const pattern = "yyyy.MM.dd HH_mm_ss_SSS";
    const first = parse("2026.01.15 14_30_45_123", pattern);
    const second = parse("2026.01.15 14_30_45_123", pattern);

    expect(first.getHours()).toBe(14);
    expect(first.getMinutes()).toBe(30);
    expect(first.getSeconds()).toBe(45);
    expect(first.getMilliseconds()).toBe(123);
    expect(second.getTime()).toBe(first.getTime());
  });
});

describe("parse — error cases", () => {
  it("throws RangeError on mismatched literal characters", () => {
    expect(() => parse("2026-01-15", "yyyy/MM/dd")).toThrow(RangeError);
  });

  it("throws RangeError on unexpected end of input", () => {
    expect(() => parse("2026-01", "yyyy-MM-dd")).toThrow(RangeError);
  });

  it("throws RangeError when token input is shorter than expected", () => {
    expect(() => parse("2026-01-", "yyyy-MM-dd")).toThrow(RangeError);
  });

  it("throws RangeError on invalid calendar date", () => {
    expect(() => parse("2026-02-30", "yyyy-MM-dd")).toThrow(RangeError);
  });

  it("throws RangeError on invalid time", () => {
    expect(() => parse("2026-01-15 25:00:00", "yyyy-MM-dd HH:mm:ss")).toThrow(RangeError);
  });

  it("throws RangeError on non-numeric token input", () => {
    expect(() => parse("2026-aa-15", "yyyy-MM-dd")).toThrow(RangeError);
  });

  it("throws RangeError on trailing input", () => {
    expect(() => parse("2026-01-15 extra", "yyyy-MM-dd")).toThrow(RangeError);
  });
});

describe("parse — round-trip with format", () => {
  it("round-trips yyyy-MM-dd HH:mm:ss", () => {
    const original = new Date(2026, 0, 15, 14, 30, 45);
    const pattern = "yyyy-MM-dd HH:mm:ss";
    const formatted = format(original, pattern);
    const parsed = parse(formatted, pattern);
    expect(parsed.getFullYear()).toBe(original.getFullYear());
    expect(parsed.getMonth()).toBe(original.getMonth());
    expect(parsed.getDate()).toBe(original.getDate());
    expect(parsed.getHours()).toBe(original.getHours());
    expect(parsed.getMinutes()).toBe(original.getMinutes());
    expect(parsed.getSeconds()).toBe(original.getSeconds());
  });
});

// ─── format — all tokens including MMMM, MMM ────────────────────

describe("format — month name tokens", () => {
  it("formats MMMM (full month name)", () => {
    expect(format(new Date(2026, 0, 15), "MMMM")).toBe("January");
    expect(format(new Date(2026, 5, 30), "MMMM")).toBe("June");
    expect(format(new Date(2026, 11, 25), "MMMM")).toBe("December");
  });

  it("formats MMM (abbreviated month name)", () => {
    expect(format(new Date(2026, 0, 15), "MMM")).toBe("Jan");
    expect(format(new Date(2026, 5, 30), "MMM")).toBe("Jun");
    expect(format(new Date(2026, 11, 25), "MMM")).toBe("Dec");
  });

  it("formats EEEE, MMMM d, yyyy (full readable date)", () => {
    const d = new Date(2026, 0, 15); // Thursday
    expect(format(d, "EEEE, MMMM d, yyyy")).toBe("Thursday, January 15, 2026");
  });
});

describe("format — all tokens", () => {
  it("formats yy (2-digit year)", () => {
    const d = new Date(2026, 0, 5);
    expect(format(d, "yy")).toBe("26");
  });

  it("formats unpadded single-digit M and d", () => {
    const d = new Date(2026, 0, 5, 9, 5, 3);
    expect(format(d, "M/d/yyyy")).toBe("1/5/2026");
  });

  it("formats 12h with AM/PM", () => {
    const morning = new Date(2026, 0, 15, 9, 5);
    expect(format(morning, "h:mm a")).toBe("9:05 AM");
    const evening = new Date(2026, 0, 15, 14, 30);
    expect(format(evening, "hh:mm a")).toBe("02:30 PM");
  });

  it("formats hh as zero-padded 12-hour time", () => {
    expect(format(new Date(2026, 0, 15, 9, 0), "hh")).toBe("09");
  });

  it("formats midnight as 12 AM", () => {
    expect(format(new Date(2026, 0, 15, 0, 0), "h a")).toBe("12 AM");
  });

  it("formats noon as 12 PM", () => {
    expect(format(new Date(2026, 0, 15, 12, 0), "h a")).toBe("12 PM");
  });

  it("formats weekday EEEE and EEE", () => {
    const d = new Date(2026, 0, 15); // Thursday
    expect(format(d, "EEEE")).toBe("Thursday");
    expect(format(d, "EEE")).toBe("Thu");
  });

  it("formats H (unpadded 24h)", () => {
    const d = new Date(2026, 0, 15, 9, 5, 3);
    expect(format(d, "H:m:s")).toBe("9:5:3");
  });

  it("formats SSS for milliseconds", () => {
    expect(format(new Date(2026, 0, 15, 0, 0, 0, 5), "SSS")).toBe("005");
  });

  it("formats common fast-path date/time patterns", () => {
    const d = new Date(2026, 0, 5, 9, 5, 3, 7);

    expect(format(d, "yyyy-MM-dd")).toBe("2026-01-05");
    expect(format(d, "yyyy-MM-dd HH:mm")).toBe("2026-01-05 09:05");
    expect(format(d, "yyyy-MM-dd HH:mm:ss")).toBe("2026-01-05 09:05:03");
    expect(format(d, "yyyy-MM-dd HH:mm:ss.SSS")).toBe("2026-01-05 09:05:03.007");
  });

  it("formats each day of the week", () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(2026, 0, 4 + i);
      expect(format(d, "EEEE")).toBe(days[i]);
    }
  });

  it("formats each month full name", () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    for (let i = 0; i < 12; i++) {
      const d = new Date(2026, i, 1);
      expect(format(d, "MMMM")).toBe(months[i]);
    }
  });

  it("formats each month abbreviated", () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    for (let i = 0; i < 12; i++) {
      const d = new Date(2026, i, 1);
      expect(format(d, "MMM")).toBe(months[i]);
    }
  });
});
