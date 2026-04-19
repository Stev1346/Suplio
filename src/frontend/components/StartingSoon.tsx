import Link from "next/link";
import { PageShell } from "./ui/PageShell";
import { useGuestDjProfileModal } from "@/contexts/GuestDjProfileModalContext";

type StartingSoonProps = {
  eventName: string;
};

export function StartingSoon({ eventName }: StartingSoonProps) {
    const {open} = useGuestDjProfileModal();
  return (
    <PageShell>
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-muted-60 mb-1 text-xl">Thank you for being here.</p>
        <p className="text-muted-60 text-center text-3xl mb-1 ">
          <b>{eventName}</b> will be starting shortly.
        </p>
        <Link
        href="#"
        className="text-lg text-accent-80 mb-1 hover:underline"
        onClick={(e) => {
          e.preventDefault();
          open();
        }}
      >
        Check out your DJ
      </Link>
        <p className="text-muted-60 text-center mb-1 ">
          If the event has started, remind the DJ to go live. DJs are human and
          do forget things.
        </p>
      </div>
    </PageShell>
  );
}
