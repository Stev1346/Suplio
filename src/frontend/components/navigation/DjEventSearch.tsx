"use client";

import { useDjEventSearch } from "@/hooks/dj/useDjEventSearch";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/Button";
import { Search } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { routes } from "@/lib/shared/constants/routes";
import { cn } from "@/lib/utils";

type Props = {
  inputClassName?: string;
  className?: string;
};

export function DjEventSearch({ inputClassName, className }: Props) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { query, setQuery, items, loading, error } = useDjEventSearch();

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmed = query.trim();
  const showList = open && trimmed.length > 0;

  const goToEvent = useCallback(
    (eventCode: string) => {
      router.push(routes.dj.eventDetailByCode(eventCode));
      setOpen(false);
      setActiveIndex(-1);
      setQuery("");
    },
    [router, setQuery],
  );

  useEffect(() => {
    function onDocPointerDown(e: PointerEvent) {
      const el = rootRef.current;
      if (!el || el.contains(e.target as Node)) return;
      setOpen(false);
      setActiveIndex(-1);
    }
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setActiveIndex(-1);
    });
    return () => {
      cancelled = true;
    };
  }, [items, query]);

  useEffect(() => {
    if(!showList || activeIndex < 0 ) return;
    const el = document.getElementById(`${listId}-opt-${activeIndex}`);
    el?.scrollIntoView({block: "nearest", behavior: "smooth"});
  }, [activeIndex, showList, listId, items.length])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showList) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!items.length) return;
      setActiveIndex((i) => (i + 1) % items.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!items.length) return;
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
      return;
    }
    if (e.key === "Enter") {
      if (activeIndex >= 0 && items[activeIndex]) {
        e.preventDefault();
        goToEvent(items[activeIndex].event_code);
      }
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex min-h-9 w-full items-stretch overflow-hidden ",
          "rounded-md border border-secondary-60 bg-transparent shadow-xs",
        )}
      >
        <Input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setOpen(true);
          }}
          onKeyDown={(e) => {
            handleKeyDown(e);
          }}
          placeholder="Search events by name or code..."
          aria-autocomplete="list"
          className={cn(
            inputClassName,
            "min-w-0 flex-1 rounded-none border-0 shadow-none",
            "text-sm text-secondary-80 placeholder:text-secondary-60",
            "bg-transparent dark:bg-transparent focus-visible:ring-0",
            "focus-visible:ring-offset-0",
          )}
        />
        <Button
          type="button"
          variant={"secondary"}
          size={"icon-sm"}
          className={cn(
            "shrink-0 rounded-none border-0",
            "border-secondary-60 bg-transparent hover:bg-secondary-20",
          )}
          aria-label="Focus search"
          onClick={() => {
            inputRef.current?.focus();
            setOpen(true);
          }}
        >
          <Search className="size-4" />
        </Button>
      </div>

      {showList && (
        <div
          id={listId}
          role="listbox"
          className="absolute right-0 z-50 mt-1 max-h-72 w-[min(100vw-2rem,22rem)] 
          overflow-auto rounded-md border border-muted-10 bg-background shadow-md sm:w-80"
        >
          {trimmed.length < 2 ? (
            <p className="px-3 py-2 text-sm text-muted-90">
              Type at least 2 characters
            </p>
          ) : loading ? (
            <p className="px-3 py-2 text-sm text-muted-90">
              Searching...
            </p>
          ) : error ? (
            <p className="px-3 py-2 text-sm text-red-600">{error}</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-90">
              No matches
            </p>
          ) : (
            <ul className="py-1">
              {items.map((ev, idx) => {
                const id = `${listId}-opt-${idx}`;
                const active = idx === activeIndex;
                return (
                  <li key={ev.id} id={id} role="option" aria-selected={active}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted-20",
                        active && "bg-muted-20",
                      )}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => goToEvent(ev.event_code)}
                    >
                      <span className="font-medium text-secondary-90">
                        {ev.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {ev.event_code}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
