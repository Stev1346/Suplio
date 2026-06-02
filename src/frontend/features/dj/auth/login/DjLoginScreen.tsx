"use client";

import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PageShell } from "@/components/ui/PageShell";
import { PasswordFormField } from "@/components/ui/PasswordFormField";
import { sanitizeInternalNextPath } from "@/lib/shared/utils/sanitize-internal-next-path";
import { routes } from "@/lib/shared/constants/routes";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { LoadingState } from "@/components/ui/LoadingState";

const ERROR_MESSAGES: Record<string, string> = {
  verify_email:
    "Confirm your email before using the DJ dashboard. Check your inbox.",
  auth: "That sign-in link expired or is invalid. Sign in with email and password.",
  session_expired: "Your session reached its time limit. Sign in again."
};

export default function DjLoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = sanitizeInternalNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persistedFlash, setPersistedFlash] = useState<string | null>(null);

  const code = searchParams.get("error");
  const derivedFlash = code
    ? (ERROR_MESSAGES[code] ?? "Something went wrong. Try signing in again.")
    : null;

  const urlError = persistedFlash ?? derivedFlash;
  const stripOnceRef = useRef(false);

  useEffect(() => {
    if (!code) {
      stripOnceRef.current = false;
      return;
    }
    if (stripOnceRef.current) return;
    stripOnceRef.current = true;

    const msg =
      ERROR_MESSAGES[code] ?? "Something went wrong. Try signing in again.";
    startTransition(() => {
      setPersistedFlash(msg);
    });
    toast.error(msg);

    const q = new URLSearchParams();
    if (next) {
      q.set("next", next!);
    }
    const qs = q.toString();
    router.replace(qs ? `/dj/login?${qs}` : "/dj/login");
  }, [code, router,next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    startTransition(() => setPersistedFlash(null));

    const res = await fetch("/auth/sign-in", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body?.error ?? "Could not sign in";

      setError(msg);
      toast.error(msg);
      return;
    }
    router.push(next);
    router.refresh();
  }

  if (loading) {
    return (
      <PageShell centralize>
        <LoadingState />
      </PageShell>
    );
  }

  return (
    <PageShell className="flex-col">
      <AppHeader title="Log In" hideDjLink />
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
          {urlError && (
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              {urlError}
            </p>
          )}
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

          {error && <p className="text-red-700 text-sm">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="flex-1 flex flex-col items-center">
          <Link
            href={routes.dj.forgotPassword}
            className="text-accent-60 mb-1.5 hover:cursor-pointer hover:underline"
          >
            Forgot Password?
          </Link>
          <Link
            href={routes.dj.signup}
            className="text-accent-80 hover:cursor-pointer hover:underline"
          >
            No account? Sign Up Here
          </Link>
        </div>
    </PageShell>
  );
}
