"use client";

import { useEventCode } from "@/contexts/GuestEventContext";
import { useEvent } from "@/hooks/guest/useEventByCode";
import { featureFlags } from "@/lib/shared/config/feature-flags";
import {
  resolveGuestEventTheme,
} from "@/lib/shared/custom-event-designs/resolve-guest-event-theme";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

const THEME_VAR_KEYS = [
  "--hue",
  "--primary-color",
  "--secondary-color",
  "--background",
  "--foreground",
  "--guest-primary-button",
  "--guest-primary-button-hover",
  "--guest-heading-accent",
  "--guest-focus-ring",
  "--guest-badge-accent",
] as const;

export function GuestEventThemeLayout({ children }: Props) {
  const eventCode = useEventCode();
  const { event } = useEvent(eventCode, { realtime: true });

  const theme =
    featureFlags.customEventDesigns && event?.event_color
      ? resolveGuestEventTheme(event.event_color)
      : null;

  const themeVars = theme?.cssVars ?? null;

  useEffect(() => {
    const root = document.documentElement;

    if (!themeVars) {
      for (const key of THEME_VAR_KEYS) {
        root.style.removeProperty(key);
      }
      return;
    }

    for (const [key, value] of Object.entries(themeVars)) {
      if (value != null) {
        root.style.setProperty(key, String(value));
      }
    }

    return () => {
      for (const key of THEME_VAR_KEYS) {
        root.style.removeProperty(key);
      }
    };
  }, [themeVars]);

  return (
    <main
      className="min-h-dvh bg-background pt-15"
      style={themeVars ?? undefined}
    >
      {children}
    </main>
  );
}
