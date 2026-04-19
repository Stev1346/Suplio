import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

test.describe("RLS matrix", () => {
  test.beforeEach(() => {
    test.skip(
      !url || !anonKey || !serviceKey,
      "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY."
    );
  });

  test("anon cannot select dj_profiles", async () => {
    const anon = createClient(url!, anonKey!);
    const { data, error } = await anon.from("dj_profiles").select("*").limit(1);
    expect(error || (data?.length ?? 0) === 0).toBeTruthy();
  });

  test("anon cannot insert into events", async () => {
    const anon = createClient(url!, anonKey!);
    const { error } = await anon
      .from("events")
      .insert({ name: "rls-probe", event_code: "ZZZZ" });
    expect(error).not.toBeNull();
  });

  test("anon cannot delete votes", async () => {
    const admin = createClient(url!, serviceKey!);
    const { data: seeded } = await admin
      .from("votes")
      .select("id")
      .limit(1)
      .maybeSingle();
    test.skip(!seeded, "Seed at least one vote row before running.");
    const anon = createClient(url!, anonKey!);
    const { error } = await anon.from("votes").delete().eq("id", seeded!.id);
    expect(error).not.toBeNull();
  });
});