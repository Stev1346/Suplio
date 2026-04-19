import { GuestCookieInformationBanner } from "@/components/guests/GuestCookieInformationBanner";

export default function GuestLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <GuestCookieInformationBanner />
      <main className="min-h-dvh bg-background pt-15">{children}</main>
    </>
  );
}
