import { NotFound } from "@/components/NotFound";
import { TopRequestList } from "@/components/TopRequestList";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PageShell } from "@/components/ui/PageShell";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

type Props = { eventCode?: string };

export default function SongRequestScreen({ eventCode }: Props) {
  const router = useRouter();
  const [event, setEvent] = useState<{
    id: string;
    name: string;
    allow_requests: boolean;
  } | null>(null);
  const [topRequests, setTopRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [songName, setSongName] = useState("");
  const [artist, setArtist] = useState("");
  const [message, setMessage] = useState("");

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

      const { data: requestData } = await supabase
        .from("requests")
        .select("*")
        .eq("event_id", eventData.id)
        .in("status", ["pending", "accepted"])
        .order("votes", { ascending: false })
        .limit(10);

      setTopRequests(requestData ?? []);
      setLoading(false);
    }
    load();
  }, [eventCode]);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!event?.allow_requests || !event.id) return;
    setSubmitLoading(true);

    const { error } = await supabase.from("requests").insert({
      event_id: event.id,
      song_name: songName.trim(),
      artist: artist.trim() || null,
      message: message.trim() || null,
    });

    setSubmitLoading(false);
    if (error) return;
    if (!eventCode) return;

    router.push(`/event/${eventCode}/vote`);
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
