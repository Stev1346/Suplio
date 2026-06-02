import { describe, expect, it } from "vitest";
import { parseCreateDesignFields } from "@/lib/server/custom-event-designs/parse-create-design-fields";

describe("parseCreateDesignFields", () => {
  it("treats a null body as no design payload", () => {
    expect(parseCreateDesignFields(null)).toEqual({
      ok: true,
      fields: {},
      hasAny: false,
    });
  });

  it("treats an empty/blank body as no design payload", () => {
    expect(parseCreateDesignFields({})).toEqual({
      ok: true,
      fields: {},
      hasAny: false,
    });
    expect(
      parseCreateDesignFields({ event_code: "  ", event_color: "" }),
    ).toEqual({ ok: true, fields: {}, hasAny: false });
  });

  it("rejects a reserved custom code", () => {
    const result = parseCreateDesignFields({ event_code: "scan" });
    expect(result.ok).toBe(false);
  });

  it("rejects an invalid (too short) custom code", () => {
    const result = parseCreateDesignFields({ event_code: "a" });
    expect(result.ok).toBe(false);
  });

  it("rejects an invalid color", () => {
    const result = parseCreateDesignFields({ event_color: "not-a-color" });
    expect(result.ok).toBe(false);
  });

  it("rejects an unknown qr design preset", () => {
    const result = parseCreateDesignFields({ qr_design: "sparkles" });
    expect(result.ok).toBe(false);
  });

  it("normalizes a valid trio of design fields", () => {
    const result = parseCreateDesignFields({
      event_code: " My-Event-1 ",
      event_color: "#7C3AED",
      qr_design: "rounded",
    });

    expect(result).toEqual({
      ok: true,
      hasAny: true,
      fields: {
        customEventCode: "my-event-1",
        event_color: "#7c3aed",
        qr_design: "rounded",
      },
    });
  });
});
