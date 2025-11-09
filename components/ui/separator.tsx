import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const separatorVariants = cva(
  "shrink-0 transition-all duration-200 theme-aware-transition",
  {
    variants: {
      orientation: {
        horizontal: "h-[1px] w-full",
        vertical: "h-full w-[1px]",
      },
      variant: {
        default: "bg-[color:var(--color-border-default)]",
        subtle: "bg-[color:var(--color-border-subtle)]",
        strong: "bg-[color:var(--color-border-strong)]",
        primary: "bg-[color:var(--color-primary-200)]",
        success: "bg-[color:var(--color-success-200)]",
        warning: "bg-[color:var(--color-warning-200)]",
        error: "bg-[color:var(--color-error-200)]",
        info: "bg-[color:var(--color-info-200)]",
        // Glassmorphism variants
        glass: "bg-gradient-to-r from-transparent via-[color:var(--color-border-subtle)]/30 to-transparent",
        "glass-vertical": "bg-gradient-to-b from-transparent via-[color:var(--color-border-subtle)]/30 to-transparent",
      },
      size: {
        default: "",
        sm: "scale-75",
        lg: "scale-125",
        xl: "scale-150",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      variant: "default",
      size: "default",
    },
  }
)

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
    VariantProps<typeof separatorVariants> {}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    { 
      className, 
      orientation, 
      variant, 
      size,
      decorative = true,
      ...props 
    },
    ref
  ) => {
    // Determine the actual variant based on orientation for glass variants
    const actualVariant = variant === "glass" && orientation === "vertical" 
      ? "glass-vertical" 
      : variant

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(separatorVariants({ orientation, variant: actualVariant, size }), className)}
        {...props}
      />
    )
  }
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator, separatorVariants }