type AppHeaderProps = {
  title?: string;
  tagLine?: string;
};

export function AppHeader({
  title = "GotATune",
  tagLine = "Scan. Request. Vote.",
}: AppHeaderProps) {
  return (
    <header className="mb-8 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="text-muted-500">{tagLine}</p>
      <p className="text-muted-700 text-xs">
        Remember, requests are suggestions not demands
      </p>
    </header>
  );
}
