"use client";

import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageShell } from "@/components/ui/PageShell";
import { useEventCode } from "@/contexts/GuestEventContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function DashboardLoginScreen() {
  const contextEventCode = useEventCode();
  const [manualEventCode, setManualEventCode] = useState("");
  const resolvedEventCode = (contextEventCode ?? manualEventCode)
    .trim()
    .toUpperCase();
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resolvedEventCode || loading) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/dj/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventCode: resolvedEventCode, pin }),
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body?.error ?? "Could not sign in";

      setError(msg);
      toast.error(msg);
      return;
    }
    router.push(`/dj/dashboard`);
  }

  if (loading) {
    return (
      <PageShell centralize>
        <LoadingSpinner />
      </PageShell>
    );
  }

  return (
    <PageShell className="flex flex-col justify-center items-center">
      <AppHeader title="DJ Dashboard Login" />
      <div className="flex flex-1">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm space-y-4 flex flex-col justify-center"
        >
          {contextEventCode ? (
            <FormField
              label="Event code"
              value={resolvedEventCode}
              readOnly
              disabled
              className="opacity-80 cursor-not-allowed"
            />
          ) : (
            <FormField
              label="Event code"
              value={manualEventCode}
              onChange={(e) => setManualEventCode(e.target.value)}
              required
            />
          )}
          <FormField
            label="DJ PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            inputMode="numeric"
            placeholder="Enter PIN"
            required
          />
          {error && <p className="text-red-700 text-sm">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Enter Dashboard"}
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
