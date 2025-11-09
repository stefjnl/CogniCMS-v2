"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] text-sm font-medium" +
    " hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-foreground)]" +
    " disabled:pointer-events-none disabled:opacity-50" +
    " data-[state=on]:bg-[color:var(--color-accent)] data-[state=on]:text-[color:var(--color-accent-foreground)]" +
    " [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0" +
    " focus-visible:border-[color:var(--color-ring)] focus-visible:ring-[color:var(--color-ring)]/50 focus-visible:ring-[3px]" +
    " outline-none transition-[color,box-shadow] duration-200" +
    " aria-invalid:ring-[color:var(--color-error-500)]/20 dark:aria-invalid:ring-[color:var(--color-error-500)]/40 aria-invalid:border-[color:var(--color-error-500)]" +
    " whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-[color:var(--color-border-default)] bg-transparent shadow-[var(--shadow-xs)] hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-foreground)]",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }