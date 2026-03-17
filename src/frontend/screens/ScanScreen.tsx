import { NotFound } from "@/components/NotFound";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/ui/PageShell";
import { useEventCode } from "@/contexts/EventContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ScanScreen() {
  const eventCode = useEventCode();
  const [event, setEvent] = useState<{
    id: string;
    name: string;
    allow_requests: boolean;
  } | null>(null);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const eventUrl = eventCode ? `${baseUrl}/event/${eventCode}` : "";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("id,name,allow_requests")
        .eq("event_code", eventCode)
        .single();

      if (eventError || !eventData) {
        setLoading(false);
        return;
      }
      setEvent(eventData);
      setLoading(false);
    }
    load();
  }, [eventCode]);

  async function handleCopyUrl() {
    if (!eventUrl) return;

    try {
      await navigator.clipboard.writeText(eventUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link.");
    }
  }

  if (eventCode && loading) {
    return (
      <PageShell narrow>
        <p className="text-muted-500">Loading...</p>
      </PageShell>
    );
  }

  if (!eventCode || !event) {
    return <NotFound narrow variant="event" />;
  }

  return (
    <PageShell narrow className="flex flex-col items-center">
      <AppHeader tagLine="Scan to request a song" />
      <h1 className="text-3xl font-bold mb-2 text-center">Welcome to <br/>{event.name}</h1>
      <p className="text-muted-100 mb-2">Share this link with others:</p>
      <Button
        variant="secondary"
        onClick={handleCopyUrl}
        className="px-4 py-2 rounded break-all mb-6"
      >
        {eventUrl}
      </Button>
      <div className="flex gap-4">
        <Link href={`/event/${eventCode}/request`}>
          <Button>Request a song</Button>
        </Link>
      </div>
    </PageShell>
  );
}
