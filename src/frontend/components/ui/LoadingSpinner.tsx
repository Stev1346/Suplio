import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex">
      <Loader2
        className="size-12 animate-spin justify-center items-center"
        role="status"
      />
    </div>
  );
}
