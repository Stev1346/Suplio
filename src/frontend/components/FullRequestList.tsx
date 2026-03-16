import { Database, EventStatus } from "@/types/database";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

const STATUS_LABELS: Record<EventStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  played: "Played",
};
const STATUS_BADGE_CLASS: Record<EventStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  played: "bg-secondary-600 text-muted-700",
};

type FullRequestListProps = {
  requests: RequestRow[];
  title?: string;
  className?: string;
  hiddenTitle?: boolean;
  onSetStatus?: (requestId: string, status: EventStatus) => void;
  updatingId?: string | null;
};

export function FullRequestList({
  requests,
  title = "Tonight's Request List",
  className = "",
  hiddenTitle = false,
  onSetStatus,
  updatingId = null,
}: FullRequestListProps) {
  return (
    <section className={className}>
      <h2
        className="text-lg font-semibold mb-3 text-muted-500"
        hidden={hiddenTitle}
      >
        {title}
      </h2>
      <ul className="space-y-1">
        {requests.length === 0 && (
          <li className="text-muted-300">No requests yet.</li>
        )}
        {requests.map((r) => (
          <li
            key={r.id}
            className="bg-white rounded-lg shadow border border-muted-100 p-3 flex flex-col gap-2"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium text-primary-900 flex flex-row">
                <p>{r.song_name} </p>
                <p className="ml-1.5 text-surface-500">{r.artist ? `[${r.artist}]` : ""}</p>
              </span>
              <span className="text-tertiary-500 font-semibold text-sm shrink-0">
                {r.votes} vote{r.votes === 1 ? "" : "s"}
              </span>
            </div>
            {r.message && <p className="text-muted-500 text-sm">{r.message}</p>}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE_CLASS[r.status]}`}
              >
                {STATUS_LABELS[r.status]}
              </span>
              {onSetStatus && (
                <div className="flex gap-1 flex-wrap">
                  {(["accepted", "rejected", "played"] as const).map(
                    (status) => {
                      const isCurrent = r.status === status;
                      const isUpdating = updatingId === r.id;
                      return (
                        <button
                          key={status}
                          type="button"
                          disabled={isUpdating}
                          onClick={() => onSetStatus(r.id, status)}
                          className={`py-1 px-2 rounded text-sm font-medium disabled:opacity-50
                                ${
                                  isCurrent
                                    ? "bg-muted-300 text-muted-600 cursor-default"
                                    : status === "accepted"
                                      ? "bg-green-600 text-white hover:bg-green-700"
                                      : status === "rejected"
                                        ? "bg-red-600 text-white hover:bg-red-700"
                                        : "bg-secondary-600 text-white hover:bg-secondary-700"
                                }
                                `}
                        >
                          {STATUS_LABELS[status]}
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
