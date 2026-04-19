import { Database } from "@/types/database";
import { Card, CardContent, CardHeader } from "./ui/card";
import { requestStatus } from "@/lib/shared/constants/routes";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

type TopRequestListProps = {
  requests: RequestRow[];
  title?: string;
  className?: string;
  hiddenTitle?: boolean;
};

export function TopRequestList({
  requests,
  title = "Top requested tonight",
  className = "",
  hiddenTitle = false,
}: TopRequestListProps) {
  return (
    <section className={className}>
      <Card>
        <CardHeader>
          <h2
            className="text-lg font-semibold mb-3 text-muted-40"
            hidden={hiddenTitle}
          >
            {title}
          </h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {requests.length === 0 && (
              <li className="text-muted-60">No requests yet.</li>
            )}
            {requests.map((r, i) => (
              <li
                key={r.id}
                className="flex justify-between items-center py-2 border-b border-muted-20"
              >
                <span>
                  {i + 1}. {r.song_name}
                  {r.artist ? ` - ${r.artist}` : ""}
                  {r.status === requestStatus.lower.played ? " [PLAYED]" : ""}
                </span>
                <span className="text-accent-40 font-medium">
                  {r.votes} vote{r.votes === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
