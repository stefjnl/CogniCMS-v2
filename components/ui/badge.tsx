import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 theme-aware-transition",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[color:var(--color-primary-500)] text-[color:var(--color-text-inverse)] shadow-[var(--shadow-sm)]",
        secondary:
          "border-transparent bg-[color:var(--color-secondary)] text-[color:var(--color-secondary-foreground)]",
        destructive:
          "border-transparent bg-[color:var(--color-error-500)] text-[color:var(--color-text-inverse)]",
        outline:
          "border-[color:var(--color-border-default)] text-[color:var(--color-text-primary)]",
        success:
          "border-transparent bg-[color:var(--color-success-500)] text-[color:var(--color-text-inverse)]",
        warning:
          "border-transparent bg-[color:var(--color-warning-500)] text-[color:var(--color-text-primary)]",
        info:
          "border-transparent bg-[color:var(--color-info-500)] text-[color:var(--color-text-inverse)]",
        // Glassmorphism variants
        glass:
          "border-[color:var(--color-border-subtle)]/30 bg-[color:var(--color-bg-elevated)]/70 backdrop-blur-xl text-[color:var(--color-text-primary)] shadow-[var(--shadow-glass-subtle)]",
        "glass-primary":
          "border-[color:var(--color-primary-500)]/30 bg-[color:var(--color-primary-500)]/10 backdrop-blur-xl text-[color:var(--color-primary-700)] shadow-[var(--shadow-glass-subtle)]",
        // Subtle variants for Google AI Studio aesthetic
        subtle:
          "border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text-secondary)]",
        "subtle-primary":
          "border-[color:var(--color-primary-200)] bg-[color:var(--color-primary-50)] text-[color:var(--color-primary-700)]",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }