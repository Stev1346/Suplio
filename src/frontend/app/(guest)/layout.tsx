import { GuestCookieInformationBanner } from "@/components/guests/GuestCookieInformationBanner";

export default function GuestLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <GuestCookieInformationBanner />
      {children}
    </>
  );
}
