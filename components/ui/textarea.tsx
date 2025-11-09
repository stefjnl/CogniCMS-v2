import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex min-h-[60px] w-full rounded-[var(--radius-md)] border transition-all duration-200 theme-aware-transition" +
    " bg-[color:var(--color-bg-secondary)]/70 backdrop-blur-xl px-3 py-2 text-base text-[color:var(--color-text-primary)]" +
    " shadow-[var(--shadow-sm)] placeholder:text-[color:var(--color-text-muted)]" +
    " hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-secondary)]/90" +
    " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-primary)]" +
    " disabled:cursor-not-allowed disabled:opacity-60" +
    " md:text-sm",
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
        default: "px-3 py-2 text-base md:text-sm",
        sm: "px-2 py-1 text-sm",
        lg: "px-4 py-3 text-lg",
      },
      resize: {
        none: "resize-none",
        both: "resize",
        horizontal: "resize-x",
        vertical: "resize-y",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      resize: "vertical",
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string
  error?: string
  success?: string
  warning?: string
  helperText?: string
  containerClassName?: string
  showCharacterCount?: boolean
  maxLength?: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant,
    size,
    resize,
    label,
    error,
    success,
    warning,
    helperText,
    containerClassName,
    showCharacterCount,
    maxLength,
    id,
    value,
    onChange,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [characterCount, setCharacterCount] = React.useState(0)
    const textareaId = React.useId()
    const finalId = id || textareaId
    
    // Determine the actual variant based on validation states
    const actualVariant = error ? "error" : success ? "success" : warning ? "warning" : variant
    
    // Handle textarea changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setCharacterCount(newValue.length)
      onChange?.(e)
    }
    
    // Update character count when value changes externally
    React.useEffect(() => {
      if (typeof value === "string") {
        setCharacterCount(value.length)
      }
    }, [value])
    
    // Auto-resize functionality
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const mergedRef = React.useCallback((node: HTMLTextAreaElement) => {
      textareaRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }, [ref])
    
    const autoResize = React.useCallback(() => {
      const textarea = textareaRef.current
      if (textarea && resize === "none") {
        textarea.style.height = "auto"
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [resize])
    
    React.useEffect(() => {
      if (resize === "none") {
        autoResize()
      }
    }, [value, resize, autoResize])
    
    return (
      <div className={cn("relative w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={finalId}
            className={cn(
              "block text-sm font-medium mb-2 transition-colors duration-200",
              "text-[color:var(--color-text-primary)]",
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
          <textarea
            id={finalId}
            className={cn(textareaVariants({ variant: actualVariant, size, resize }), className)}
            ref={mergedRef}
            value={value}
            onChange={handleChange}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            maxLength={maxLength}
            {...props}
          />
          
          {/* Character count */}
          {showCharacterCount && maxLength && (
            <div className="absolute bottom-2 right-2 text-xs text-[color:var(--color-text-muted)] pointer-events-none">
              {characterCount}/{maxLength}
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
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }