type PageShellProps = {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
  centralize?: boolean;
};

export function PageShell({
  children,
  className = "",
  narrow = false,
  centralize = false,
}: PageShellProps) {
  return (
    <div
      className={`min-h-screen bg-primary-900 text-white p-6 
                  ${narrow ? "max-w-lg mx-auto" : ""} 
                  ${centralize ? "flex items-center justify-center" : ""}
                  ${className}`}
    >
      {children}
    </div>
  );
}
