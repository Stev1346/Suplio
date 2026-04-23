"use client";

import type { RequestStatus } from "@/types/database";
import { FilterX } from "lucide-react";

type RequestStatusFiltersProps = {
  statuses: RequestStatus[];
  selected: Set<RequestStatus>;
  counts: Record<RequestStatus, number>;
  onToggle: (status: RequestStatus) => void;
  onClear: () => void;
};

export function RequestStatusFilters({
  statuses,
  selected,
  counts,
  onToggle,
  onClear,
}: RequestStatusFiltersProps) {
  return (
    <>
      <div className="flex flex-wrap flex-row items-center justify-start gap-2">
        {statuses.map((status) => {
          const active = selected.has(status);
          return (
            <button
              key={status}
              type="button"
              onClick={() => onToggle(status)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                active
                  ? "bg-muted-10 text-white border border-muted-10 hover:cursor-pointer"
                  : "border bg-transparent border-muted-20 text-muted-60 hover:bg-muted-20 hover:text-white hover:cursor-pointer"
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <span className="capitalize">{status.replaceAll("_"," ")}</span>
                <span className="text-xs opacity-80">({counts[status]})</span>
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onClear}
          disabled={selected.size === 0}
          className="text-xl font-medium bg-clear text-muted-90 ml-auto hover:cursor-pointer disabled:opacity-50"
        >
          <FilterX />
        </button>
      </div>
    </>
  );
}