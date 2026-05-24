function readBool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value === "1" || value.toLowerCase() === "true";
}

export const featureFlags = {
  djAnalytics: readBool(process.env.NEXT_PUBLIC_ENABLE_DJ_ANALYTICS),
  debugPanel: readBool(process.env.NEXT_PUBLIC_ENABLE_DEBUG_PANEL),
  customEventDesigns: readBool(
    process.env.NEXT_PUBLIC_ENABLE_CUSTOM_EVENT_DESIGNS,
  ),
} as const;

export type FeatureFlag = keyof typeof featureFlags;
