import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type CreateEventCardProps = {
  loading: boolean;
  error: string | null;
  onCreate: (name: string) => Promise<void>;
};

export function CreateEventCard({
  loading,
  error,
  onCreate,
}: CreateEventCardProps) {
  const [name, setName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    await onCreate(name.trim());
    setName("");
  }

  return (
    <Card id="create-event">
      <CardHeader>
        <CardTitle>Create Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Event name"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </form>
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
