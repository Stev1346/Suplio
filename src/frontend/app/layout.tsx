import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { EventCodeProvider } from "@/contexts/GuestEventContext";
import { cn } from "@/lib/utils";
import { TopNavShell } from "@/components/navigation/TopNavShell";
import { GuestDjProfileModalProvider } from "@/contexts/GuestDjProfileModalContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GotATune",
  description: "Scan. Request. Vote.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <EventCodeProvider>
          <GuestDjProfileModalProvider>
            <TopNavShell />
            <main className="min-h-dvh bg-background pt-15">{children}</main>
          </GuestDjProfileModalProvider>
        </EventCodeProvider>

        <Toaster position="top-center" />
      </body>
    </html>
  );
}
