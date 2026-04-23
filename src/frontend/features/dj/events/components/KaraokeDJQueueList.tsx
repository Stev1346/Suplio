import { karaokeRequestStatus } from "@/lib/shared/constants/routes";
import { Database, KaraokeRequestStatus, RequestStatus } from "@/types/database";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];
type KaraokeRequestRow = RequestRow & { status: KaraokeRequestStatus };

type KaraokeQueueListProps = {
  requests: RequestRow[];
  title: string;
  updatingId: string | null;
  className: string;
  onSetStatus: (requestId: string, status: KaraokeRequestStatus) => void;
};

function isKaraokeStatus(status: RequestStatus): status is KaraokeRequestStatus {
  return (
    status === karaokeRequestStatus.lower.queued ||
    status === karaokeRequestStatus.lower.upNext ||
    status === karaokeRequestStatus.lower.performingNow ||
    status === karaokeRequestStatus.lower.performed ||
    status === karaokeRequestStatus.lower.rejected 
  );
}

const ACTIONS = [
  karaokeRequestStatus.lower.queued,
  karaokeRequestStatus.lower.upNext,
  karaokeRequestStatus.lower.performingNow,
  karaokeRequestStatus.lower.performed,
  karaokeRequestStatus.lower.rejected,
] as const;

const STATUS_LABELS : Record<KaraokeRequestStatus, string> = {
  [karaokeRequestStatus.lower.queued]: "Queued",
  [karaokeRequestStatus.lower.upNext]: "Up Next",
  [karaokeRequestStatus.lower.performingNow]: "Performing Now",
  [karaokeRequestStatus.lower.performed]: "Performed",
  [karaokeRequestStatus.lower.rejected]: "Removed",
} as const;

const STATUS_BADGE_CLASS : Record<KaraokeRequestStatus, string> ={
  [karaokeRequestStatus.lower.queued]: "bg-sky-100 text-sky-800",
  [karaokeRequestStatus.lower.upNext]: "bg-violet-100 text-violet-800",
  [karaokeRequestStatus.lower.performingNow]: "bg-amber-100 text-amber-800",
  [karaokeRequestStatus.lower.performed]: "bg-emerald-100 text-emerald-800",
  [karaokeRequestStatus.lower.rejected]: "bg-rose-100 text-rose-800",
} as const;

export function KaraokeDJQueueList({
  requests,
  title,
  className,
  updatingId,
  onSetStatus,
}: KaraokeQueueListProps) {
  const karaokeRequests: KaraokeRequestRow[] = requests.filter(
    (r): r is KaraokeRequestRow => isKaraokeStatus(r.status),
  );
  return (
    <section className={className}>
      <h3 className="text-lg font-semibold mb-3 text-muted-60">{title}</h3>
      <ul className="space-y-1">
        {karaokeRequests.length === 0 ? (
          <li className="text-muted-40">No requests yet.</li>
        ) : (
          karaokeRequests.map((r) => (
            <li
              key={r.id}
              className="bg-card rounded-lg shadow border border-muted-10 p-3 flex flex-col gap-2"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium text-primary-20">
                  {r.performer_name ?? "-"}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE_CLASS[r.status]}`}
                >
                  {STATUS_LABELS[r.status]}
                </span>
              </div>
              <p className="text-accent-40 text-lg">
                {r.song_name}
                {r.artist ? ` [${r.artist}]` : ""}
              </p>
              <div className="flex flex-wrap gap-1">
                {ACTIONS.map((s) => {
                  const isCurrent = r.status === s;
                  const isUpdating = updatingId === r.id;

                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={isUpdating || isCurrent}
                      className={`rounded px-2 py-1 text-xs border transition ${
                        isCurrent
                          ? "bg-muted-10 text-white border-muted-10"
                          : "bg-transparent border-muted-20 text-muted-60 hover:bg-muted-20 hover:text-white hover:cursor-pointer"
                      } ${isUpdating ? "opacity-60 cursor-not-allowed" : ""}`}
                      onClick={() => onSetStatus(r.id, s)}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  );
                })}
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
