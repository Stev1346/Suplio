"use client";

import { NotFound } from "@/components/NotFound";
import { TopRequestList } from "@/components/TopRequestList";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageShell } from "@/components/ui/PageShell";
import { useEventCode } from "@/contexts/GuestEventContext";
import { useEvent } from "@/hooks/guest/useEventByCode";
import { useEventRequests } from "@/hooks/guest/useEventRequests";
import { useSupabaseBrowser } from "@/hooks/useSupabaseBrowser";
import { insertRequest } from "@/lib/client/api/requests";
import { compareRankedRequests } from "@/lib/request-ranking";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SongRequestScreen() {
  const supabase = useSupabaseBrowser();
  const eventCode = useEventCode();
  const router = useRouter();
  const {
    event,
    loading: eventLoading,
    error: eventError,
  } = useEvent(eventCode, { realtime: true });
  const {
    requests,
    loading: requestLoading,
    error: requestError,
  } = useEventRequests(
    event?.id,
    { orderBy: "song_name", ascending: true },
    { realtime: true },
  );
  const topRequests = requests
    .filter((r) => r.status === "pending" || r.status === "accepted")
    .sort(compareRankedRequests)
    .slice(0, 10);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [songName, setSongName] = useState("");
  const [artist, setArtist] = useState("");
  const [message, setMessage] = useState("");
  const isLoading = !!eventCode && (requestLoading || eventLoading);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!event?.allow_requests || !event.id) return;

    setSubmitLoading(true);

    const { error } = await insertRequest(supabase, {
      event_id: event.id,
      song_name: songName.trim(),
      artist: artist.trim() || null,
      message: message.trim() || null,
    });

    setSubmitLoading(false);
    if (error) {
      toast.error("Could not submit request. Try again");
      return;
    }

    if (!error && eventCode) {
      router.push(`/event/${eventCode}/vote`);
    }
  }

  if (isLoading) {
    return (
      <PageShell centralize>
        <LoadingSpinner />
      </PageShell>
    );
  }

  if (!eventCode || !event) {
    return <NotFound variant="event" />;
  }

  return (
    <PageShell centralize className="flex-col">
      <AppHeader tagLine="Request a song" />
      {(eventError || requestError) && (
        <p className="text-red-400 text-sm mb-2">
          {requestError ?? eventError}
        </p>
      )}
      <div className="flex-1 flex-col items-center">
      {!event.allow_requests ? (
        <h1 className="text-accent-60 text-3xl text-center mb-4">
          Requests are paused for this event.
        </h1>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mb-10">
          <FormField
            label="Song name"
            required
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
          />
          <FormField
            label="Artist"
            optional
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
          <FormField
            label="Message for DJ"
            optional
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button type="submit" disabled={submitLoading} className="w-full">
            {submitLoading ? "Submitting..." : "Request song"}
          </Button>
        </form>
      )}
      <TopRequestList
        requests={topRequests}
        title="Top requested tonight"
        className="mb-4 max-h-90 overflow-scroll no-scrollbar"
      />
      <div className="flex flex-row">
        <Link
          href={`/event/${eventCode}`}
          className="text-secondary-60 text-lg hover:text-secondary-40 mr-auto"
        >
          Share Event URL
        </Link>
        <Link
          href={`/event/${eventCode}/vote`}
          className="text-secondary-60 text-lg hover:text-secondary-40 ml-auto"
        >
          View Request List
        </Link>
      </div>
      </div>
    </PageShell>
  );
}
