"use client";

import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/ui/PageShell";
import { PasswordFormField } from "@/components/ui/PasswordFormField";
import { routes } from "@/lib/shared/constants/routes";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const [newPassword, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        const msg = error.message ?? "Could not update password";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      toast.success("Password has been reset");

      await fetch("/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
      router.push(routes.dj.login);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell className="flex flex-col">
      <AppHeader title="Set New Password" />
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <PasswordFormField
          label="Password"
          value={newPassword}
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
          {loading ? "Setting new password..." : "Set Password"}
        </Button>
      </form>
    </PageShell>
  );
}
