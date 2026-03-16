import { Check, X } from "lucide-react";

type AllowRequestsSwitchProps = {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function AllowRequestsSwitch({
  checked,
  onToggle,
  disabled = false,
}: AllowRequestsSwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-500 text-sm font-medium">Requests Allowed</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={checked ? "Allow requests (on)" : "Allow requests (off)"}
        onClick={onToggle}
        disabled={disabled}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}
      >
        {checked ? (
          <Check className="h-5 w-5" aria-hidden />
        ) : (
          <X className="h-5 w-5" aria-hidden />
        )}
      </button>
    </div>
  );
}
