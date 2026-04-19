import { LoadingSpinner } from "./LoadingSpinner";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
    return (
      <div className="flex flex-1 items-center justify-center py-12" role="status" aria-live="polite">
        <LoadingSpinner />
        <span className="sr-only">{label}</span>
      </div>
    );
  }