type PageShellProps = {
  children: React.ReactNode;
  className?: string;
  centralize?: boolean;
};

export function PageShell({
  children,
  className = "",
  centralize = true,
}: PageShellProps) {
  return (
    <div
      className={`min-h-screen w-full bg-background text-foreground px-4 py-6 sm:px-6 lg:px-8
                  ${centralize ? "flex items-center justify-center" : ""}
                  ${className}`}
    >
      {children}
    </div>
  );
}
