import { Database } from "@/types/database";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

type TopRequestListProps = {
  requests: RequestRow[];
  title?: string;
};

export function TopRequestList({
  requests,
  title = "Top requested tonight",
}: TopRequestListProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 text-muted-500">{title}</h2>
      <ul className="space-y-2">
        {requests.length === 0 && (
          <li className="text-muted-300">No requests yet.</li>
        )}
        {requests.map((r, i) => (
          <li
            key={r.id}
            className="flex justify-between items-center py-2 border-b border-muted-50"
          >
            <span>
                {i+1}. {r.song_name}
                {r.artist ? ` - ${r.artist}` : ""}
            </span>
            <span className="text-surface-50 font-medium">{r.votes} votes</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
