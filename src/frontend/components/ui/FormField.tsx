type FormFieldProps = {
  label: string;
  required?: boolean;
  optional?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function FormField({
  label,
  required,
  optional,
  className = "",
  ...inputProps
}: FormFieldProps) {
  const labelText = optional ? `${label} (optional)` : label;

  return (
    <div>
      <label className="block text-sm text-muted-500 mb-1">
        {labelText} {required ? "*" : ""}
      </label>
      <input
        required={required}
        className={`w-full px-4 py-2 rounded bg-secondary-900 border border-muted-500 text-white ${className}`}
        {...inputProps}
      />
    </div>
  );
}
