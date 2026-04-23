import { LabeledSelectOption } from "@/components/ui/LabeledSelect";
import { eventMode } from "@/lib/shared/constants/routes";
import { EventMode } from "@/types/database";

export const DJ_EVENTS_MODE_OPTIONS: LabeledSelectOption<EventMode>[] = [
    {
        value: eventMode.lower.songRequest,
        label: eventMode.cased.songRequest
    },
    {
        value: eventMode.lower.karaoke,
        label: eventMode.cased.karaoke
    }
] as const;