import { LabeledSelectOption } from "@/components/ui/LabeledSelect";
import { lifecycleStatus } from "@/lib/shared/constants/routes";
import { EventLifecycleStatus } from "@/types/database";

export const EVENT_LIFECYCLE_STATUS_OPTIONS: LabeledSelectOption<EventLifecycleStatus>[] =
    [
        { value: lifecycleStatus.lower.draft, label: lifecycleStatus.cased.draft },
        { value: lifecycleStatus.lower.live, label: lifecycleStatus.cased.live },
        { value: lifecycleStatus.lower.ended, label: lifecycleStatus.cased.ended },
        {
            value: lifecycleStatus.lower.archived,
            label: lifecycleStatus.cased.archived,
        }
    ]