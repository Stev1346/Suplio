type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    "py-2 px-4 rounded font-medium disabled:opacity-50 hover:cursor-pointer";
  const variants = {
    primary: "bg-tertiary-500 text-white",
    secondary: "border border-secondary-500 text-white",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
