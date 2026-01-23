import { describe, it, expect } from "vitest";
import {
  emptyTwiml,
  smsReplyTwiml,
  forwardCallTwiml,
  voicemailTwiml,
  missedCallTwiml,
} from "./webhook";

describe("TwiML Generation", () => {
  describe("emptyTwiml", () => {
    it("generates valid empty response", () => {
      const result = emptyTwiml();
      expect(result).toBe('<?xml version="1.0" encoding="UTF-8"?><Response />');
    });
  });

  describe("smsReplyTwiml", () => {
    it("generates valid SMS response", () => {
      const result = smsReplyTwiml("Hello World");
      expect(result).toContain("<Message>Hello World</Message>");
      expect(result).toContain('<?xml version="1.0"');
      expect(result).toContain("<Response>");
    });

    it("escapes XML special characters", () => {
      const result = smsReplyTwiml('Hello <World> & "Friends"');
      expect(result).toContain("&lt;World&gt;");
      expect(result).toContain("&amp;");
      expect(result).toContain("&quot;Friends&quot;");
    });
  });

  describe("forwardCallTwiml", () => {
    it("generates valid call forwarding response", () => {
      const result = forwardCallTwiml("+15551234567");
      expect(result).toContain("<Dial");
      expect(result).toContain("<Number>+15551234567</Number>");
      expect(result).toContain('timeout="30"');
      expect(result).toContain('action="/api/textgrid/voice/status"');
    });

    it("includes caller ID when provided", () => {
      const result = forwardCallTwiml("+15551234567", "+15559876543");
      expect(result).toContain('callerId="+15559876543"');
    });

    it("respects custom timeout", () => {
      const result = forwardCallTwiml("+15551234567", undefined, 45);
      expect(result).toContain('timeout="45"');
    });
  });

  describe("voicemailTwiml", () => {
    it("generates valid voicemail response", () => {
      const result = voicemailTwiml("Bob's Plumbing");
      expect(result).toContain("<Say");
      expect(result).toContain("Bob&apos;s Plumbing");
      expect(result).toContain("<Record");
      expect(result).toContain('maxLength="120"');
    });

    it("escapes business name for XML", () => {
      const result = voicemailTwiml('Test & "Demo" <Company>');
      expect(result).toContain("Test &amp; &quot;Demo&quot; &lt;Company&gt;");
    });
  });

  describe("missedCallTwiml", () => {
    it("generates valid missed call response", () => {
      const result = missedCallTwiml();
      expect(result).toContain("<Say");
      expect(result).toContain("<Hangup />");
      expect(result).toContain("text you back shortly");
    });
  });
});

describe("TwiML XML Validity", () => {
  const xmlDeclarationRegex = /^<\?xml version="1\.0" encoding="UTF-8"\?>/;
  const responseTagRegex = /<Response.*?>/;

  it("all TwiML functions start with XML declaration", () => {
    expect(emptyTwiml()).toMatch(xmlDeclarationRegex);
    expect(smsReplyTwiml("test")).toMatch(xmlDeclarationRegex);
    expect(forwardCallTwiml("+1234567890")).toMatch(xmlDeclarationRegex);
    expect(voicemailTwiml("Test")).toMatch(xmlDeclarationRegex);
    expect(missedCallTwiml()).toMatch(xmlDeclarationRegex);
  });

  it("all TwiML functions contain Response tag", () => {
    expect(emptyTwiml()).toMatch(responseTagRegex);
    expect(smsReplyTwiml("test")).toMatch(responseTagRegex);
    expect(forwardCallTwiml("+1234567890")).toMatch(responseTagRegex);
    expect(voicemailTwiml("Test")).toMatch(responseTagRegex);
    expect(missedCallTwiml()).toMatch(responseTagRegex);
  });
});
