import { useGuestDjProfileModal } from "@/contexts/GuestDjProfileModalContext";
import Link from "next/link";

type AppHeaderProps = {
  title?: string;
  tagLine?: string;
};

export function AppHeader({
  title = "GotATune",
  tagLine = "Scan. Request. Vote.",
}: AppHeaderProps) {
  const {open} = useGuestDjProfileModal();

  return (
    <header className="mb-2 space-y-1 text-center">
      <h1 className="text-3xl font-bold tracking-tight hidden sm:text-4xl">{title}</h1>
      <p className="text-muted-40">{tagLine}</p>
      <p className="text-muted-80 text-xs">
        Remember, requests are suggestions not demands
      </p>
      <Link
        href="#"
        className="text-lg text-accent-80 hover:underline"
        onClick={(e) => {
          e.preventDefault();
          open();
        }}
      >
        Meet your DJ
      </Link>
    </header>
  );
}
