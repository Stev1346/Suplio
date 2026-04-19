type ErrorContext = Record<string, unknown>;

export function captureServerError(error: unknown, context?: ErrorContext): void {
  const payload = context ? { error, ...context } : { error };
  console.error("[server-error]", payload);
}
