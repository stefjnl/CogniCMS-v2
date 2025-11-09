import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-[var(--radius-xl)] border transition-all duration-200 theme-aware-transition" +
    " text-[color:var(--color-text-primary)]",
  {
    variants: {
      variant: {
        default:
          "border-[color:var(--color-border-default)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)]",
        elevated:
          "border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1",
        glass:
          "border-[color:var(--color-border-subtle)]/30 bg-[color:var(--color-bg-elevated)]/70 backdrop-blur-xl shadow-[var(--shadow-glass-subtle)] hover:bg-[color:var(--color-bg-elevated)]/90 hover:shadow-[var(--shadow-glass-elevated)] hover:-translate-y-1",
        "glass-elevated":
          "border-[color:var(--color-border-subtle)]/20 bg-[color:var(--color-bg-elevated)]/60 backdrop-blur-xl shadow-[var(--shadow-glass-elevated)] hover:bg-[color:var(--color-bg-elevated)]/80 hover:shadow-[var(--shadow-xl)] hover:-translate-y-2",
        outline:
          "border-[color:var(--color-border-default)] bg-transparent shadow-none hover:bg-[color:var(--color-bg-secondary)]/50",
        interactive:
          "border-[color:var(--color-border-default)] bg-[color:var(--color-bg-primary)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[color:var(--color-primary-300)] hover:bg-[color:var(--color-primary-50)]/30 cursor-pointer",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 pb-6 border-b border-[color:var(--color-border-subtle)]",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-[color:var(--color-text-primary)]",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-[color:var(--color-text-muted)]",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-6", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center pt-6 border-t border-[color:var(--color-border-subtle)]",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }