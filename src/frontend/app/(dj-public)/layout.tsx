export default function DjPublicLayout({ children }: { children: React.ReactNode }) {
    return <main className="min-h-dvh bg-background pt-15">{children}</main>;
  }