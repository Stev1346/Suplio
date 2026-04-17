"use client";

import { fetchGuestDjProfile } from "@/lib/client/api/guest-dj-profile";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
  ComponentPropsWithoutRef,
  useMemo,
} from "react";
import { useEventCode } from "./GuestEventContext";
import {
  DjProfilePublicFields,
  DjProfilePublicView,
} from "@/features/dj/profile/DjProfilePublicView";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type GuestDjProfileModalContextValue = {
  open: () => void;
  close: () => void;
};

const GuestDjProfileModalContext =
  createContext<GuestDjProfileModalContextValue | null>(null);

export function useGuestDjProfileModal() {
  const ctx = useContext(GuestDjProfileModalContext);
  if (!ctx) {
    throw new Error(
      "useGuestDjProfileModal must be used within GuestDjProfileModalProvider",
    );
  }
  return ctx;
}

export function GuestDjProfileModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const eventCode = useEventCode();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<DjProfilePublicFields | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !eventCode) return;

    let cancelled = false;

    const task = Promise.resolve().then(async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await fetchGuestDjProfile(eventCode);
      if (cancelled) return;

      setLoading(false);
      if (error) {
        setProfile(null);
        setError(error);
        return;
      }
      setProfile(data);
    });

    void task;

    return () => {
      cancelled = true;
    };
  }, [open, eventCode]);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setProfile(null);
      setError(null);
      setLoading(false);
    }
  }, []);

  const openModal = useCallback(() => {
    if (!eventCode) return;
    setOpen(true);
  }, [eventCode]);

  const closeModal = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  const value = useMemo(
    () => ({ open: openModal, close: closeModal }),
    [openModal, closeModal],
  );

  return (
    <GuestDjProfileModalContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader className="text-3xl text-center">
            <DialogTitle>Your DJ</DialogTitle>
            <DialogDescription className="sr-only">
              Public profile for the DJ running this event.
            </DialogDescription>
          </DialogHeader>
          {loading && <LoadingSpinner />}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!loading && profile && (
            <div className="flex justify-center">
              <DjProfilePublicView profile={profile} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </GuestDjProfileModalContext.Provider>
  );
}

export function GuestDjProfileModalTrigger(
  props: ComponentPropsWithoutRef<"button">,
) {
  const { open } = useGuestDjProfileModal();
  return (
    <button
      type="button"
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        open();
      }}
    />
  );
}
