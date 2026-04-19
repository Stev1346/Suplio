import { LabeledSelectOption } from "@/components/ui/LabeledSelect";
import { DjEventsLifecycleFilter } from "@/lib/client/api/dj";
import { lifecycleStatus } from "@/lib/shared/constants/routes";

export const DJ_EVENTS_LIFECYCLE_FILTER_OPTIONS: LabeledSelectOption<DjEventsLifecycleFilter>[] =
    [
        {
            value: lifecycleStatus.lower.active,
            label: lifecycleStatus.cased.active + " (not archived)",
        },
        { value: lifecycleStatus.lower.draft, label: lifecycleStatus.cased.draft },
        { value: lifecycleStatus.lower.live, label: lifecycleStatus.cased.live },
        { value: lifecycleStatus.lower.ended, label: lifecycleStatus.cased.ended },
        {
            value: lifecycleStatus.lower.archived,
            label: lifecycleStatus.cased.archived,
        },
        { value: lifecycleStatus.lower.all, label: lifecycleStatus.cased.all }
    ]