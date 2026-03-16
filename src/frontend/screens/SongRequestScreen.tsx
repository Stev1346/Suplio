import { NotFound } from "@/components/NotFound";
import { TopRequestList } from "@/components/TopRequestList";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PageShell } from "@/components/ui/PageShell";
import { useEvent } from "@/hooks/useEvent";
import { useEventRequests } from "@/hooks/useEventRequests";
import { insertRequest } from "@/lib/requests";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { eventCode?: string };

export default function SongRequestScreen({ eventCode }: Props) {
  const router = useRouter();
  const { event, loading: eventLoading } = useEvent(eventCode);
  const { requests: topRequests, loading: requestLoading } = useEventRequests(
    event?.id,
    {
      statuses: ["pending", "accepted"],
      orderBy: "votes",
      ascending: false,
      limit: 10,
    },
  );
  const [submitLoading, setSubmitLoading] = useState(false);
  const [songName, setSongName] = useState("");
  const [artist, setArtist] = useState("");
  const [message, setMessage] = useState("");
  const isLoading = !!eventCode && (requestLoading || eventLoading);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!event?.allow_requests || !event.id) return;

    setSubmitLoading(true);

    const {error} = await insertRequest({
      event_id: event.id,
      song_name: songName.trim(),
      artist: artist.trim() || null,
      message: message.trim() || null
    });

    setSubmitLoading(false);

    if(!error && eventCode){
      router.push(`/event/${eventCode}/vote`)
    }
  }

  if (isLoading) {
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
    <PageShell narrow>
      <AppHeader tagLine="Request a song" />
      {!event.allow_requests ? (
        <p className="text-tertiary-500">Requests are paused for this event.</p>
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
          className="text-secondary-700 text-lg hover:text-surface-300 mr-auto"
        >
          ← Share Event URL
        </Link>
        <Link
          href={`/event/${eventCode}/vote`}
          className="text-secondary-700 text-lg hover:text-surface-300 ml-auto"
        >
          View Request List →
        </Link>
      </div>
    </PageShell>
  );
}
