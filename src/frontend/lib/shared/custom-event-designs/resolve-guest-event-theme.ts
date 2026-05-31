import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";
import { EVENT_COLOR_POLICY, SURFACE_CONTRAST_RULE, SurfaceKey } from "./color-policy";
import { normalizeEventColor } from "./normalize-event-color";

extend([a11yPlugin]);

export type GuestEventTheme = {
    hue: number;
    cssVars: React.CSSProperties;
};

function accentHue(baseHue: number): number {
    return (baseHue + 60) % 360;
}

function primaryToken(baseHue: number, lightness: number): string {
    return `hsl(${baseHue} 50% ${lightness}%)`;
}

function accentToken(baseHue: number, lightness: number): string {
    return `hsl(${accentHue(baseHue)} 50% ${lightness}%)`;
}

export function hexToHue(hex: string): number {
    const h = colord(hex).toHsl().h;
    if (!Number.isFinite(h)) {
        return EVENT_COLOR_POLICY.platformDefaultHue;
    }
    return Math.round(h);
}

type SurfaceColorMap = Record<SurfaceKey, string>;

function resolveSurfaceColors(hue: number): SurfaceColorMap {
    const pageBg = primaryToken(hue, 10);
    const fallbackHue = EVENT_COLOR_POLICY.platformDefaultHue;

    const preferred: SurfaceColorMap = {
        primaryButton: accentToken(hue, 60),
        headingAccent: accentToken(hue, 80),
        focusRing: accentToken(hue, 60),
        badgeAccent: accentToken(hue, 80),
    };

    const fallback: SurfaceColorMap = {
        primaryButton: accentToken(fallbackHue, 60),
        headingAccent: accentToken(fallbackHue, 80),
        focusRing: accentToken(fallbackHue, 60),
        badgeAccent: accentToken(fallbackHue, 80),
    };

    return (Object.keys(preferred) as SurfaceKey[]).reduce((acc, surface) => {
        const thresholdKey = SURFACE_CONTRAST_RULE[surface];
        const minContrast = EVENT_COLOR_POLICY[thresholdKey];
        const fg = preferred[surface];
        const bg = surface === "primaryButton" ? "#ffffff" : pageBg;
        acc[surface] = colord(fg).contrast(bg) >= minContrast ? fg : fallback[surface];
        return acc;
    }, {} as SurfaceColorMap);
}

export function resolveGuestEventHue(
    eventColor: string | null | undefined
): number | null {
    const hex = eventColor ? normalizeEventColor(eventColor) : null;
    if (!hex) return null;

    const hue = hexToHue(hex);
    return hue;
}

export function resolveGuestEventTheme(
    eventColor: string | null | undefined
): GuestEventTheme | null {
    const hex = eventColor ? normalizeEventColor(eventColor) : null;
    if(!hex) return null;
    
    const hue = hexToHue(hex);
    const surfaces= resolveSurfaceColors(hue);

    return {
        hue,
        cssVars: {
            "--hue": hue,
            "--primary-color": `hsl(${hue} 50% 10%)`,
            "--secondary-color": `hsl(${hue} 50% 90%)`,
            "--background": `hsl(${hue} 50% 10%)`,
            "--foreground": `hsl(${hue} 50% 90%)`,
            "--guest-primary-button": surfaces.primaryButton,
            "--guest-primary-button-hover": colord(surfaces.primaryButton)
              .darken(0.12)
              .toHslString(),
            "--guest-heading-accent": surfaces.headingAccent,
            "--guest-focus-ring": surfaces.focusRing,
            "--guest-badge-accent": surfaces.badgeAccent,
          } as React.CSSProperties,
    }
}

export function guestEventHueVars(hue: number): React.CSSProperties {
    return {
        "--hue": hue,
        "--primary-color": `hsl(${hue} 50% 10%)`,
        "--secondary-color": `hsl(${hue} 50% 90%)`,
        "--background": `hsl(${hue} 50% 10%)`,
        "--foreground": `hsl(${hue} 50% 90%)`,
    } as React.CSSProperties;
}