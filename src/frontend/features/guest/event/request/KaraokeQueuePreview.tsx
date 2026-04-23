"use client";

import { Database } from "@/types/database";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

function headKaraokePreview(rows: RequestRow[]) {
  if (rows.length === 0) return null;
  const [first] = [...rows].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const who = first.performer_name?.trim() || "Unknown performer";
  const what = first.song_name?.trim() || "Unknown song";
  return { who, what };
}

function PreviewLine({
  label,
  head,
  emptyLabel,
}: {
  label: string;
  head: { who: string; what: string } | null;
  emptyLabel: string;
}) {
  return (
    <li className="gap-1 flex flex-row">
      <span className="font-medium text-secondary-80">{label}</span>
      <span className="text-muted-60">
        {head ? `${head.who} - ${head.what}` : emptyLabel}
      </span>
    </li>
  );
}

export type KaraokeQueuePreviewProps = {
  performingNow: RequestRow[];
  upNext: RequestRow[];
  queued: RequestRow[];
  className?: string;
};

export function KaraokeQueuePreview({
  performingNow,
  upNext,
  queued,
  className = "",
}: KaraokeQueuePreviewProps) {
  return (
    <div
      className={`mb-4 w-full max-w-3xl rounded-lg border border-muted-20 bg-muted-10/30 p-4 ${className}`}
    >
      <h2 className="mb-3 text-lg font-semibold text-muted-60">
        Karaoke Request List Preview
      </h2>
      <ul className="space-y-2 text-sm">
        <PreviewLine
          label="Performing now:"
          head={headKaraokePreview(performingNow)}
          emptyLabel="No one on stage yet."
        />
        <PreviewLine
          label="Up next:"
          head={headKaraokePreview(upNext)}
          emptyLabel="No one on queued up yet."
        />
        <PreviewLine
          label="First in Queue:"
          head={headKaraokePreview(queued)}
          emptyLabel="No one on queued up yet."
        />
      </ul>
    </div>
  );
}
