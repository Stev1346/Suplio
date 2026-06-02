import { describe, expect, it } from "vitest";
import {
  EVENT_CODE_RULES,
  validateEventCode,
} from "@/lib/shared/custom-event-designs/event-code-rules";

describe("validateEventCode", () => {
  it("rejects codes shorter than the minimum length", () => {
    expect(validateEventCode("abc")).toBe("Code is too short");
  });

  it("rejects codes longer than the maximum length", () => {
    expect(validateEventCode("a".repeat(EVENT_CODE_RULES.maxLength + 1))).toBe(
      "Code is too long",
    );
  });

  it("rejects codes with disallowed characters", () => {
    expect(validateEventCode("Bad Code!")).toBe(
      "Use lowercase letters, numbers, and hyphens only",
    );
  });

  it("rejects reserved words (that still pass length/pattern)", () => {
    expect(validateEventCode("scan")).toBe("That code is reserved");
    expect(validateEventCode("admin")).toBe("That code is reserved");
    expect(validateEventCode("events")).toBe("That code is reserved");
  });

  it("accepts a valid url-safe code", () => {
    expect(validateEventCode("my-event-1")).toBeNull();
  });

  it("normalizes case before validating, so uppercase valid codes pass", () => {
    expect(validateEventCode("My-Event-1")).toBeNull();
  });
});

describe("EVENT_CODE_RULES.normalize", () => {
  it("trims surrounding whitespace and lowercases", () => {
    expect(EVENT_CODE_RULES.normalize("  ABC-Def  ")).toBe("abc-def");
  });

  it("scopes uniqueness to non-archived events", () => {
    expect(EVENT_CODE_RULES.uniquenessScope).toBe("non_archived");
  });
});
