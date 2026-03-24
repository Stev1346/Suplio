type AppHeaderProps = {
  title?: string;
  tagLine?: string;
};

export function AppHeader({
  title = "GotATune",
  tagLine = "Scan. Request. Vote.",
}: AppHeaderProps) {
  return (
    <header className="mb-8 space-y-1 text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="text-muted-40">{tagLine}</p>
      <p className="text-muted-80 text-xs">
        Remember, requests are suggestions not demands
      </p>
    </header>
  );
}
