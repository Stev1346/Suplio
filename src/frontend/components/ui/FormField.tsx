import * as React from "react";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  required?: boolean;
  type?: string;
  optional?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function FormField({
  label,
  required,
  type,
  optional,
  className = "",
  id,
  ...inputProps
}: FormFieldProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const labelText = optional ? `${label} (optional)` : label;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm text-muted-60">
        {labelText} {required ? "*" : ""}
      </label>
      <input
        id={inputId}
        type={type}
        required={required}
        className={cn(
          "w-full rounded-md border border-muted-40 bg-primary-20 px-3 py-2 text-foreground placeholder:text-muted-60",
          className,
        )}
        {...inputProps}
      />
    </div>
  );
}
