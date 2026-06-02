import { GuestEventThemeLayout } from "@/components/guests/GuestEventThemeLayout";

export default function GuestEventCodeLayout({
    children,
}: Readonly<{children: React.ReactNode}>){
    return <GuestEventThemeLayout>{children}</GuestEventThemeLayout>
}