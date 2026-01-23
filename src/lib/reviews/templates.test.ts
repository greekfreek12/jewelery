import { describe, it, expect } from "vitest";
import { renderTemplate, parseRatingFromMessage, DEFAULT_TEMPLATES } from "./templates";

describe("renderTemplate", () => {
  it("replaces all template variables", () => {
    const template = "Hey {{contact_name}}, thanks for choosing {{business_name}}! Leave a review: {{review_link}}";
    const result = renderTemplate(template, {
      business_name: "Bob's Plumbing",
      contact_name: "John",
      review_link: "https://g.page/review/123",
    });
    expect(result).toBe("Hey John, thanks for choosing Bob's Plumbing! Leave a review: https://g.page/review/123");
  });

  it("handles missing variables gracefully", () => {
    const template = "Hello {{contact_name}}!";
    const result = renderTemplate(template, {
      business_name: "Test Co",
      contact_name: "",
    });
    expect(result).toBe("Hello !");
  });

  it("replaces multiple occurrences of same variable", () => {
    const template = "{{business_name}} is the best! Choose {{business_name}}!";
    const result = renderTemplate(template, {
      business_name: "Ace HVAC",
      contact_name: "Jane",
    });
    expect(result).toBe("Ace HVAC is the best! Choose Ace HVAC!");
  });
});

describe("parseRatingFromMessage", () => {
  describe("single digit ratings", () => {
    it("parses single digit 1-5", () => {
      expect(parseRatingFromMessage("1")).toBe(1);
      expect(parseRatingFromMessage("2")).toBe(2);
      expect(parseRatingFromMessage("3")).toBe(3);
      expect(parseRatingFromMessage("4")).toBe(4);
      expect(parseRatingFromMessage("5")).toBe(5);
    });

    it("handles whitespace around numbers", () => {
      expect(parseRatingFromMessage("  3  ")).toBe(3);
      expect(parseRatingFromMessage("\n4\n")).toBe(4);
    });

    it("returns null for invalid numbers", () => {
      expect(parseRatingFromMessage("0")).toBe(null);
      expect(parseRatingFromMessage("6")).toBe(null);
      expect(parseRatingFromMessage("10")).toBe(null);
    });
  });

  describe("star ratings", () => {
    it("parses X star format", () => {
      expect(parseRatingFromMessage("5 star")).toBe(5);
      expect(parseRatingFromMessage("4 stars")).toBe(4);
      expect(parseRatingFromMessage("3 STARS")).toBe(3);
    });

    it("parses X/5 format", () => {
      expect(parseRatingFromMessage("5/5")).toBe(5);
      expect(parseRatingFromMessage("3/5")).toBe(3);
      expect(parseRatingFromMessage("1/5")).toBe(1);
    });
  });

  describe("word formats", () => {
    it("parses rated X format", () => {
      expect(parseRatingFromMessage("rated 5")).toBe(5);
      expect(parseRatingFromMessage("rate 4")).toBe(4);
      expect(parseRatingFromMessage("RATED 3")).toBe(3);
    });

    it("parses X out of 5 format", () => {
      expect(parseRatingFromMessage("5 out of 5")).toBe(5);
      expect(parseRatingFromMessage("3 out of 5")).toBe(3);
    });
  });

  describe("messages starting with rating", () => {
    it("extracts rating from message start", () => {
      expect(parseRatingFromMessage("5 great work!")).toBe(5);
      expect(parseRatingFromMessage("4 - good job")).toBe(4);
    });

    it("returns null for random text", () => {
      expect(parseRatingFromMessage("Great work!")).toBe(null);
      expect(parseRatingFromMessage("Thanks for everything")).toBe(null);
    });
  });

  describe("edge cases", () => {
    it("handles empty string", () => {
      expect(parseRatingFromMessage("")).toBe(null);
    });

    it("handles messages with numbers later in text", () => {
      // Numbers not at start should be ignored
      expect(parseRatingFromMessage("You guys are #1")).toBe(null);
    });
  });
});

describe("DEFAULT_TEMPLATES", () => {
  it("has all required template types", () => {
    expect(DEFAULT_TEMPLATES.review_request).toBeDefined();
    expect(DEFAULT_TEMPLATES.review_positive).toBeDefined();
    expect(DEFAULT_TEMPLATES.review_negative).toBeDefined();
    expect(DEFAULT_TEMPLATES.review_reminder_1).toBeDefined();
    expect(DEFAULT_TEMPLATES.review_reminder_2).toBeDefined();
    expect(DEFAULT_TEMPLATES.review_blast).toBeDefined();
  });

  it("uses correct delay days for reminders", () => {
    expect(DEFAULT_TEMPLATES.review_reminder_1.delay_days).toBe(3);
    expect(DEFAULT_TEMPLATES.review_reminder_2.delay_days).toBe(7);
  });
});
