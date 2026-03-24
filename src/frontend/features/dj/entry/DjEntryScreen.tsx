"use client";

import CreatedEventInfo from "@/features/dj/events/components/CreatedEventInfo";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PageShell } from "@/components/ui/PageShell";
import { useCreateEvent } from "@/hooks/dj/useCreateEvent";
import { useState } from "react";

export default function HomeScreen() {
  const [name, setName] = useState("");
  const {
    submit,
    loading: createEventLoading,
    createdCode,
    createdPin,
    error,
  } = useCreateEvent();

  async function handleCreateEvent(e: { preventDefault(): void }) {
    e.preventDefault();
    await submit(name);
  }

  if (createdCode) {

    return (
      <PageShell className="flex flex-col">
        <AppHeader/>
        <CreatedEventInfo createdCode={createdCode} createdPin={createdPin}/>
      </PageShell>
    );
  }

  return (
    <PageShell className="flex flex-col">
      <AppHeader />
      <div className="flex flex-col flex-1 items-center justify-center">
        <form
          onSubmit={handleCreateEvent}
          className="w-full max-w-sm space-y-4 flex flex-col"
        >
          <FormField
            label="Event name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder=".e.g. Jane & John's Wedding"
            required
          />
          {error && <p className="text-red-700 text-sm">{error}</p>}
          <Button type="submit" disabled={createEventLoading}>
            {createEventLoading ? "Creating..." : "Create event"}
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
