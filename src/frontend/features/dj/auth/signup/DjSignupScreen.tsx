"use client";

import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PageShell } from "@/components/ui/PageShell";
import { PasswordFormField } from "@/components/ui/PasswordFormField";
import { routes } from "@/lib/shared/constants/routes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function DjSignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [stageName, setStageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/auth/sign-up", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        stage_name: stageName,
      }),
    });

    const body = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      const msg = body?.error ?? "Could not complete sign up";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (body.needsEmailConfirmation) {
      toast.success("Check your email to confirm your account.");
      return;
    }

    router.push(routes.dj.login);
    router.refresh();
  }

  return (
    <PageShell className="flex-col">
      <AppHeader title="Create DJ Account" hideDjLink />
      <form onSubmit={onSubmit} className="flex-1 w-full max-w-sm space-y-4">
        <FormField
          label="Stage name"
          value={stageName}
          onChange={(e) => setStageName(e.target.value)}
          required
        />
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordFormField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <PasswordFormField
          label="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {error && <p className="text-red-700 text-sm">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
        <p className="text-center text-sm">
            Already have an account?{" "}
            <Link href={routes.dj.login} className="underline">
            Log in
            </Link>
        </p>
      </form>
    </PageShell>
  );
}
