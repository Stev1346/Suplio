import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-60 text-white hover:bg-accent-40 hover:opacity-90 hover:cursor-pointer",
        secondary:
          "border border-secondary-60 text-white hover:bg-secondary-20 hover:cursor-pointer",
        ghost:
          "text-foreground hover:bg-muted-10 hover:text-foreground hover:cursor-pointer",
        outline:
          "border border-muted-20 bg-transparent hover:bg-muted-20 hover:text-muted-90 hover:cursor-pointer",
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
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean};

export function Button({ className, variant, size, asChild= false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
