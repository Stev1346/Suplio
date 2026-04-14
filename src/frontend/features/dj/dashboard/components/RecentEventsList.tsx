import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DjEventListItem } from "@/lib/client/api/dj";
import { routes } from "@/lib/shared/constants/routes";
import Link from "next/link";

type RecentEventsListProps = {
  items: DjEventListItem[];
  page: number;
  hasNextPage: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function RecentEventsList({
  items,
  page,
  hasNextPage,
  onPrev,
  onNext,
}: RecentEventsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <div>
              <p className="font-medium">{event.name}</p>
              <p className="text-sm text-muted-foreground">
                Code: {event.event_code}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={routes.guest.scan(event.event_code)}>
              <Button variant={"primary"}>Guest Page</Button>
              </Link>

            <Link href={routes.dj.eventDetailByCode(event.event_code)}>
              <Button variant={"outline"} className="">Manage</Button>
            </Link>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Button
            variant={"outline"}
            disabled={page <= 1}
            onClick={onPrev}
          >
            Previous
          </Button>
          <Button
            variant={"outline"}
            disabled={!hasNextPage}
            onClick={onNext}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
