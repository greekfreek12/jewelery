import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cn,
  formatPhoneNumber,
  formatRelativeTime,
  truncate,
  parseRating,
  interpolateTemplate,
} from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", true && "conditional")).toBe("base conditional");
    expect(cn("base", false && "conditional")).toBe("base");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});

describe("formatPhoneNumber", () => {
  it("formats 10-digit US numbers", () => {
    expect(formatPhoneNumber("5551234567")).toBe("(555) 123-4567");
    expect(formatPhoneNumber("1234567890")).toBe("(123) 456-7890");
  });

  it("formats 11-digit numbers with country code", () => {
    expect(formatPhoneNumber("15551234567")).toBe("(555) 123-4567");
    expect(formatPhoneNumber("11234567890")).toBe("(123) 456-7890");
  });

  it("strips non-numeric characters", () => {
    expect(formatPhoneNumber("(555) 123-4567")).toBe("(555) 123-4567");
    expect(formatPhoneNumber("+1-555-123-4567")).toBe("(555) 123-4567");
  });

  it("returns original for invalid numbers", () => {
    expect(formatPhoneNumber("123")).toBe("123");
    expect(formatPhoneNumber("invalid")).toBe("invalid");
    expect(formatPhoneNumber("123456789012")).toBe("123456789012");
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Just now" for recent times', () => {
    const recent = new Date("2024-01-15T11:59:30Z");
    expect(formatRelativeTime(recent)).toBe("Just now");
  });

  it("returns minutes ago for times < 1 hour", () => {
    const thirtyMinsAgo = new Date("2024-01-15T11:30:00Z");
    expect(formatRelativeTime(thirtyMinsAgo)).toBe("30m ago");
  });

  it("returns hours ago for times < 24 hours", () => {
    const fiveHoursAgo = new Date("2024-01-15T07:00:00Z");
    expect(formatRelativeTime(fiveHoursAgo)).toBe("5h ago");
  });

  it("returns days ago for times < 7 days", () => {
    const threeDaysAgo = new Date("2024-01-12T12:00:00Z");
    expect(formatRelativeTime(threeDaysAgo)).toBe("3d ago");
  });

  it("returns formatted date for older times", () => {
    const oldDate = new Date("2024-01-01T12:00:00Z");
    expect(formatRelativeTime(oldDate)).toBe("Jan 1");
  });

  it("accepts string dates", () => {
    expect(formatRelativeTime("2024-01-15T11:30:00Z")).toBe("30m ago");
  });
});

describe("truncate", () => {
  it("truncates long strings", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
    expect(truncate("This is a long message", 10)).toBe("This is a ...");
  });

  it("returns original string if shorter than limit", () => {
    expect(truncate("Hi", 10)).toBe("Hi");
    expect(truncate("Hello", 5)).toBe("Hello");
  });

  it("handles edge cases", () => {
    expect(truncate("", 5)).toBe("");
    expect(truncate("Hello", 0)).toBe("...");
  });
});

describe("parseRating", () => {
  it("parses valid ratings 1-5", () => {
    expect(parseRating("1")).toBe(1);
    expect(parseRating("2")).toBe(2);
    expect(parseRating("3")).toBe(3);
    expect(parseRating("4")).toBe(4);
    expect(parseRating("5")).toBe(5);
  });

  it("returns null for invalid ratings", () => {
    expect(parseRating("0")).toBe(null);
    expect(parseRating("6")).toBe(null);
    expect(parseRating("hello")).toBe(null);
    expect(parseRating("")).toBe(null);
  });

  it("only accepts exact single digits", () => {
    expect(parseRating("5 stars")).toBe(null);
    expect(parseRating("55")).toBe(null);
    expect(parseRating(" 5")).toBe(null);
  });
});

describe("interpolateTemplate", () => {
  it("replaces template variables", () => {
    const template = "Hello {{name}}, welcome to {{company}}!";
    const result = interpolateTemplate(template, {
      name: "John",
      company: "Acme",
    });
    expect(result).toBe("Hello John, welcome to Acme!");
  });

  it("preserves unknown variables", () => {
    const template = "Hello {{name}}, your code is {{code}}";
    const result = interpolateTemplate(template, { name: "Jane" });
    expect(result).toBe("Hello Jane, your code is {{code}}");
  });

  it("handles empty template", () => {
    expect(interpolateTemplate("", { foo: "bar" })).toBe("");
  });

  it("handles no variables in template", () => {
    expect(interpolateTemplate("Hello World", { foo: "bar" })).toBe("Hello World");
  });
});
