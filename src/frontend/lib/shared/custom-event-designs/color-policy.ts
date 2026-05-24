export const EVENT_COLOR_POLICY = {
    inputFormat: /^#[0-9a-fA-F]{6}$/,
    minContrastForText: 4.5,
    minContrastForLargeText: 3.0,
    fallbackAccent: "#7c3aed",
  } as const;
  
  export type SurfaceKey =
    | "primaryButton"
    | "headingAccent"
    | "focusRing"
    | "badgeAccent";
  
  /** Which contrast threshold applies per guest surface. */
  export const SURFACE_CONTRAST_RULE: Record<
    SurfaceKey,
    "minContrastForText" | "minContrastForLargeText"
  > = {
    primaryButton: "minContrastForText",
    headingAccent: "minContrastForLargeText",
    focusRing: "minContrastForText",
    badgeAccent: "minContrastForLargeText",
  };
  
  /** If contrast fails, use fallback accent on that surface. */
  export const SURFACE_FALLBACK: Record<SurfaceKey, "fallbackAccent"> = {
    primaryButton: "fallbackAccent",
    headingAccent: "fallbackAccent",
    focusRing: "fallbackAccent",
    badgeAccent: "fallbackAccent",
  };