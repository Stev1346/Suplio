import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent-60 text-white hover:bg-accent-40 hover:opacity-90",
        secondary: "border border-secondary-60 text-white hover:bg-secondary-20",
        ghost:
          "text-foreground hover:bg-muted-10 hover:text-foreground",
        outline:
          "border border-secondary-60 bg-transparent hover:bg-secondary-20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
        "icon-sm": "size-9 shrink-0 p-0 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}