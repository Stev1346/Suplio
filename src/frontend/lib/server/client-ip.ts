import type { NextRequest } from "next/server";

export function getClientIp(req: NextRequest | Request): string {
  const xff =
    "headers" in req && typeof req.headers.get === "function"
      ? req.headers.get("x-forwarded-for")
      : null;
  const ip = xff
    ? xff.split(",")[0].trim()
    : "headers" in req && typeof req.headers.get === "function"
      ? (req.headers.get("x-real-ip") ?? "")
      : "";
  return ip || "unknown";
}
