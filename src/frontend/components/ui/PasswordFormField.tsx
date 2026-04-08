"use client";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

type PasswordFormFieldProps = {
  label: string;
  required?: boolean;
  optional?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordFormField({
  label,
  required,
  optional,
  className = "",
  id,
  ...inputProps
}: PasswordFormFieldProps) {
  const [visible, setVisible] = React.useState(false);
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const labelText = optional ? `${label} (optional)` : label;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm text-muted-60">
        {labelText} {required ? "*" : ""}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          required={required}
          autoComplete={inputProps.autoComplete ?? "current-password"}
          className={cn(
            "w-full rounded-md border border-muted-40 bg-primary-20 py-2 pl-3 pr-10 text-foreground placeholder:text-muted-60",
            className,
          )}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 inset-e-0 z-10 flex items-center px-2.5 text-muted-60 hover:text-foreground focus:outline-none focus-visible:ring-ring rounded-e-md"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={inputId}
        >
          {visible ? (
            <EyeOff className="size-5" aria-hidden />
          ) : (
            <Eye className="size-5" />
          )}
        </button>
      </div>
    </div>
  );
}
