import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/shared/constants/routes";
import Link from "next/link";
import toast from "react-hot-toast";

type CreatedEventInfoProps = {
    createdCode: string;
}

export default function CreatedEventInfo({createdCode}: CreatedEventInfoProps){
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const requestUrl = `${baseUrl}/event/${createdCode}/request`;

    async function handleCopyUrl() {
      if (!requestUrl) return;

      try {
        await navigator.clipboard.writeText(requestUrl);
        toast.success("Link copied to clipboard!");
      } catch {
        toast.error("Could not copy link.");
      }
    }
    
    return(
        <div className="flex flex-col flex-1 items-center justify-center">
        <h1 className="text-2xl font-bold mb-2">Event created</h1>
          <p className="text-secondary-60">
            Share this link or QR code with guests:
          </p>
          <Button
            variant="secondary"
            onClick={handleCopyUrl}
            className="px-4 py-2 rounded break-all mb-6"
          >
            {requestUrl}
          </Button>
          <div className="flex gap-4">
            <Link href={routes.guest.eventLanding(createdCode)}>
              <Button asChild>Open guest page</Button>
            </Link>
            <Link href={routes.dj.dashboard}>
              <Button asChild variant="secondary">DJ Dashboard</Button>
            </Link>
          </div>
        </div>
    )
}