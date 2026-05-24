export const EVENT_CODE_RULES = {
    minLength: 4,
    maxLength: 24,
    pattern: /^[a-z0-9-]+$/,
    normalize(input: string) {
      return input.trim().toLowerCase();
    },
    reserved: new Set([
      "admin",
      "api",
      "dj",
      "event",
      "events",
      "login",
      "signup",
      "scan",
    ]),
      /** Uniqueness checked against non-archived events only (draft/live/ended). */
  uniquenessScope: "non_archived" as const,
  } as const;
  
  export function validateEventCode(raw: string): string | null {
    const value = EVENT_CODE_RULES.normalize(raw);
  
    if (value.length < EVENT_CODE_RULES.minLength) return "Code is too short";
    if (value.length > EVENT_CODE_RULES.maxLength) return "Code is too long";
    if (!EVENT_CODE_RULES.pattern.test(value))
      return "Use lowercase letters, numbers, and hyphens only";
    if (EVENT_CODE_RULES.reserved.has(value)) return "That code is reserved";
  
    return null;
  }