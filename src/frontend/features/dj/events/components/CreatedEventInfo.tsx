import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/shared/constants/routes";
import Link from "next/link";
import toast from "react-hot-toast";

type CreatedEventInfoProps = {
    createdCode: string;
    createdPin: string | null;
}

export default function CreatedEventInfo({createdCode, createdPin}: CreatedEventInfoProps){
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
          <p className="text-muted-100">
            Share this link or QR code with guests:
          </p>
          <Button
            variant="secondary"
            onClick={handleCopyUrl}
            className="px-4 py-2 rounded break-all mb-6"
          >
            {requestUrl}
          </Button>
          <div
            className="w-full max-w-md mb-6 rounded-lg border p-4
          flex flex-col items-center
          bg-amber-50 border-amber-300 text-amber-900"
          >
            <p className="font-semibold mb-1">DJ PIN (save this now)</p>
            <p className="text-2xl tracking-widest font-bold">
              {createdPin ?? "-------"}
            </p>
            <p className="text-sm mt-2">
              This PIN protects the dashboard and may only be shown once
            </p>
          </div>
          <div className="flex gap-4">
            <Link href={routes.guest.eventLanding(createdCode)}>
              <Button>Open guest page</Button>
            </Link>
            <Link href={routes.dj.dashboard}>
              <Button variant="secondary">DJ Dashboard</Button>
            </Link>
          </div>
        </div>
    )
}