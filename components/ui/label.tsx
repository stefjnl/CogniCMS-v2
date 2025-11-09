"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" +
    " transition-all duration-200 theme-aware-transition",
  {
    variants: {
      variant: {
        default:
          "text-sm text-[color:var(--color-text-primary)]",
        secondary:
          "text-sm text-[color:var(--color-text-secondary)]",
        muted:
          "text-sm text-[color:var(--color-text-muted)]",
        primary:
          "text-sm text-[color:var(--color-primary-600)]",
        success:
          "text-sm text-[color:var(--color-success-600)]",
        warning:
          "text-sm text-[color:var(--color-warning-600)]",
        error:
          "text-sm text-[color:var(--color-error-600)]",
        info:
          "text-sm text-[color:var(--color-info-600)]",
        // Size variants
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      weight: "medium",
    },
  }
)

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  required?: boolean
  helperText?: string
  errorText?: string
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({
  className,
  variant,
  weight,
  required,
  helperText,
  errorText,
  children,
  ...props
}, ref) => {
  // Determine the actual variant based on error state
  const actualVariant = errorText ? "error" : variant
  
  return (
    <div className="space-y-1">
      <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants({ variant: actualVariant, weight }), className)}
        {...props}
      >
        {children}
        {required && (
          <span className="text-[color:var(--color-error-500)] ml-1" aria-label="required">
            *
          </span>
        )}
      </LabelPrimitive.Root>
      
      {/* Helper text or error text */}
      {(helperText || errorText) && (
        <p className={cn(
          "text-xs",
          errorText
            ? "text-[color:var(--color-error-500)]"
            : "text-[color:var(--color-text-muted)]"
        )}>
          {errorText || helperText}
        </p>
      )}
    </div>
  )
})
Label.displayName = LabelPrimitive.Root.displayName

export { Label, labelVariants }