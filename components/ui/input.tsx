import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-9 w-full rounded-[var(--radius-md)] border transition-all duration-200 theme-aware-transition" +
    " bg-[color:var(--color-bg-secondary)]/70 backdrop-blur-xl px-3 py-2 text-sm text-[color:var(--color-text-primary)]" +
    " shadow-[var(--shadow-sm)] placeholder:text-[color:var(--color-text-muted)]" +
    " hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-secondary)]/90" +
    " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-primary)]" +
    " disabled:cursor-not-allowed disabled:opacity-60" +
    " file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-[color:var(--color-text-muted)]",
  {
    variants: {
      variant: {
        default:
          "border-[color:var(--color-border-default)]",
        success:
          "border-[color:var(--color-success-500)] focus-visible:ring-[color:var(--color-success-500)]",
        error:
          "border-[color:var(--color-error-500)] focus-visible:ring-[color:var(--color-error-500)]",
        warning:
          "border-[color:var(--color-warning-500)] focus-visible:ring-[color:var(--color-warning-500)]",
        glass:
          "border-[color:var(--color-border-subtle)]/30 bg-[color:var(--color-bg-elevated)]/60 backdrop-blur-xl hover:bg-[color:var(--color-bg-elevated)]/80",
      },
      size: {
        default: "h-9 px-3 py-2 text-sm",
        sm: "h-8 px-2 py-1 text-xs",
        lg: "h-11 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  success?: string
  warning?: string
  helperText?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant,
    size,
    type,
    label,
    error,
    success,
    warning,
    helperText,
    startIcon,
    endIcon,
    containerClassName,
    id,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    const inputId = React.useId()
    const finalId = id || inputId
    
    // Determine the actual variant based on validation states
    const actualVariant = error ? "error" : success ? "success" : warning ? "warning" : variant
    
    // Handle input changes to track if it has a value
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }
    
    // Determine if floating label should be active
    const isFloatingLabelActive = isFocused || hasValue || props.placeholder
    
    return (
      <div className={cn("relative w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={finalId}
            className={cn(
              "absolute left-3 transition-all duration-200 pointer-events-none z-10",
              "text-[color:var(--color-text-muted)]",
              isFloatingLabelActive
                ? "top-1 text-xs bg-[color:var(--color-bg-primary)] px-1 rounded-sm"
                : "top-1/2 -translate-y-1/2 text-sm",
              actualVariant === "error" && "text-[color:var(--color-error-500)]",
              actualVariant === "success" && "text-[color:var(--color-success-500)]",
              actualVariant === "warning" && "text-[color:var(--color-warning-500)]",
              isFocused && "text-[color:var(--color-primary-500)]"
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)] pointer-events-none z-10">
              {startIcon}
            </div>
          )}
          
          <input
            type={type}
            id={finalId}
            className={cn(
              inputVariants({ variant: actualVariant, size }),
              startIcon && "pl-10",
              endIcon && "pr-10",
              label && "pt-6",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            onChange={handleChange}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)] pointer-events-none z-10">
              {endIcon}
            </div>
          )}
        </div>
        
        {/* Validation messages and helper text */}
        {(error || success || warning || helperText) && (
          <div className="mt-1 text-xs">
            {error && (
              <p className="text-[color:var(--color-error-500)] flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            )}
            {success && (
              <p className="text-[color:var(--color-success-500)] flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {success}
              </p>
            )}
            {warning && (
              <p className="text-[color:var(--color-warning-500)] flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {warning}
              </p>
            )}
            {!error && !success && !warning && helperText && (
              <p className="text-[color:var(--color-text-muted)]">{helperText}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }