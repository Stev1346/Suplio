import { Database } from "@/types/database";
import { TopRequestList } from "./TopRequestList";
import { PageShell } from "./ui/PageShell";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

type EventOverProps = {
  eventName: string;
  topRequests: RequestRow[];
};

export function EventOver({ eventName, topRequests }: EventOverProps) {
  return (
    <PageShell>
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-muted-60 text-xl text-center mb-1 ">
          Thank you for coming!{" "}
        </p>
        <p className="text-muted-60 text-center text-3xl mb-1 ">
          <b>{eventName}</b> is now over.
        </p>
        <p className="text-muted-60 text-center mb-4 ">
          {" "}
          Take a look at the top voted songs of the night below!
        </p>

        <TopRequestList
          requests={topRequests}
          title="Top voted requests tonight"
          className="mb-4 overflow-scroll no-scrollbar"
        />
        <p className="text-muted-60 text-center">
          See you at the next event!
        </p>
      </div>
    </PageShell>
  );
}
