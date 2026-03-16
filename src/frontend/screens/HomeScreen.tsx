import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PageShell } from "@/components/ui/PageShell";
import { useCreateEvent } from "@/hooks/useCreateEvent";
import Link from "next/link";
import { useState } from "react";

export default function HomeScreen() {
  const [name, setName] = useState("");
  const {submit, loading: createEventLoading, createdCode, error, setError} = useCreateEvent();

  async function handleCreateEvent(e :{preventDefault() : void}){
    e.preventDefault();
    await submit(name);
  }

  if (createdCode) {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const eventUrl = `${baseUrl}/event/${createdCode}`;

    return (
      <PageShell className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-2">Event created</h1>
        <p className="text-muted-100">
          Share this link or QR code with guests:
        </p>
        <p className="bg-surface-600 px-4 py-2 rounded break-all mb-6">
          {eventUrl}
        </p>
        <div className="flex gap-4">
          <Link href={`/event/${createdCode}`}>
            <Button>Open guest page</Button>
          </Link>
          <Link href={`/dashboard/${createdCode}`}>
            <Button variant="secondary">DJ Dashboard</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="flex flex-col items-center justify-center">
      <AppHeader />
      <form onSubmit={handleCreateEvent} className="w-full max-w-sm space-y-4">
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
    </PageShell>
  );
}
