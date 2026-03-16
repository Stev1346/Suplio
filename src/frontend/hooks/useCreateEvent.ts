import { createEvent } from "@/lib/events";
import { useCallback, useState } from "react";

export function useCreateEvent(){
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (name: string) => {
    if(!name.trim()){
        setError("Event name is required");
        return null
    }

    setError(null);
    setLoading(true);

    const {data, error: err} = await createEvent(name);
    setLoading(false);
    if(err){
        setError(err);
        return null;
    }

    if(data) setCreatedCode(data.event_code);
    return data?.event_code ?? null;
  }, []);

  return {submit, loading, createdCode, error, setError}
}