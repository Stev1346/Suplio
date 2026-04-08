"use client";

import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PageShell } from "@/components/ui/PageShell";
import { routes } from "@/lib/shared/constants/routes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Enter an email");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/auth/forgot-password", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
      }),
    });

    const body = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      const msg = body?.error ?? "Could not reset password";
      setError(msg);
      toast.error(msg);
      return;
    }

    toast.success("If an account exists, we sent a link");

    router.push(routes.dj.login);
    router.refresh();
  }

  return (
    <PageShell className="flex flex-col">
      <AppHeader title="Forgot Password" />
      <form onSubmit={onSubmit} className="w-full max-w-sm flex-1 space-y-4">
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && <p className="text-red-700 text-sm">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset"}
        </Button>
      </form>
    </PageShell>
  );
}
