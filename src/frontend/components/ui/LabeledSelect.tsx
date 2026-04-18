"use client";

import { cn } from "@/lib/utils";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export type LabeledSelectOption<T extends string = string> = {
  value: T;
  label: string;
};

export type LabeledSelectProps<T extends string> = {
  id?: string;
  label: React.ReactNode;
  value: T;
  onValueChange: (next: T) => void;
  options: LabeledSelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  contentProps?: React.ComponentProps<typeof SelectContent>;
};

export function LabeledSelect<T extends string>({
  id = "labeled-select",
  label,
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  className,
  labelClassName,
  triggerClassName,
  contentClassName,
  contentProps,
}: LabeledSelectProps<T>) {
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <Label
        htmlFor={id}
        className={cn(
          "flex items-center gap-2 text-sm",
          labelClassName,
        )}
      >
        {typeof label === "string" ? (
          <span>{label}:</span>
        ) : (
          label+":"
        )}
      </Label>
      <Select
        value={value}
        disabled={disabled}
        onValueChange={(v) => onValueChange(v as T)}
      >
        <SelectTrigger
          id={id}
          className={cn(
            "w-[min(100%,280px)] border-muted-20 bg-background",
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          position="popper"
          side="bottom"
          sideOffset={4}
          className={cn(
            "backdrop-blur supports-backdrop-filter:bg-muted-20/50 text-secondary-90",
            contentClassName,
          )}
          {...contentProps}
        >
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
