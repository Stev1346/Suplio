import Link from "next/link";
import { AppHeader } from "./ui/AppHeader";
import { Button } from "./ui/Button";
import { PageShell } from "./ui/PageShell";
import { SearchX } from "lucide-react";
import { routes } from "@/lib/shared/constants/routes";

type NotFoundProps = {
  variant?: "page" | "event";
  message?: string;
};

export function NotFound({ variant = "page", message }: NotFoundProps) {
  const isEvent = variant === "event";
  const title = isEvent ? "Event not found" : "Page not found";
  const defaultMessage = isEvent
    ? "We couldn't find an event with that code. Check the link or return to home page"
    : "This page doesn't exist. Check the URL or return to home page";

  return (
    <PageShell className="flex flex-col">
      <AppHeader tagLine={title} />

      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-muted-60 mb-6 flex flex-row w-80">
          <SearchX className="mr-2 size-15" /> {message ?? defaultMessage}
        </p>
        <Link href={routes.home}>
          <Button variant="secondary">Go home</Button>
        </Link>
      </div>
    </PageShell>
  );
}
