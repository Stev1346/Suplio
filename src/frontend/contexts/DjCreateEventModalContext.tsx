"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreateEventForm,
  CreateEventFormPayload,
} from "@/features/dj/dashboard/components/CreateEventForm";
import { useCreateEvent } from "@/hooks/dj/useCreateEvent";
import {
  ComponentPropsWithoutRef,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

type AfterCreateFn = () => void | Promise<void>;

type DjCreateEventModalContextValue = {
  open: () => void;
  close: () => void;
  registerAfterCreate: (fn: AfterCreateFn) => () => void;
};

const DjCreateEventModalContext =
  createContext<DjCreateEventModalContextValue | null>(null);

export function useDjCreateEventModal() {
  const ctx = useContext(DjCreateEventModalContext);
  if (!ctx) {
    throw new Error(
      "useDjCreateEventModal must be used within DjCreateEventModalProvider",
    );
  }
  return ctx;
}

export function DjCreateEventModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const afterCreateRef = useRef<AfterCreateFn | null>(null);
  const { submit, loading, error, setError } = useCreateEvent();

  const registerAfterCreate = useCallback((fn: AfterCreateFn) => {
    afterCreateRef.current = fn;
    return () => {
      afterCreateRef.current = null;
    };
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) setError(null);
    },
    [setError],
  );

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(
    () => handleOpenChange(false),
    [handleOpenChange],
  );

  const handleSubmit = useCallback(
    async (payload: CreateEventFormPayload) => {
      const code = await submit(payload);
      if (!code) return false;
      await afterCreateRef.current?.();
      handleOpenChange(false);
      toast.success(payload.name + " event created!");
      return true;
    },
    [submit, handleOpenChange],
  );

  const value = useMemo(
    () => ({
      open: openModal,
      close: closeModal,
      registerAfterCreate,
    }),
    [openModal, closeModal, registerAfterCreate],
  );

  return (
    <DjCreateEventModalContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg backdrop-blur supports-backdrop-filter:bg-muted-10/80">
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
            <DialogDescription className="sr-only">
              Create a new event with name, date, mode, and optional branding.
            </DialogDescription>
          </DialogHeader>
          <CreateEventForm
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
            showCancel
            onCancel={closeModal}
            submitLabel="Create"
          />
        </DialogContent>
      </Dialog>
    </DjCreateEventModalContext.Provider>
  );
}

export function DjCreateEventModalTrigger(
  props: ComponentPropsWithoutRef<"button">,
) {
  const { open } = useDjCreateEventModal();
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
