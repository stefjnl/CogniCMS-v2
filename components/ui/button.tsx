import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium" +
    " px-3 py-2 transition-all duration-200 theme-aware-transition" +
    " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-primary)]" +
    " disabled:pointer-events-none disabled:opacity-50" +
    " [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
    " shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--color-primary-500)] text-[color:var(--color-primary-foreground)] shadow hover:bg-[color:var(--color-primary-600)]",
        destructive:
          "bg-[color:var(--color-error-500)] text-[color:var(--color-destructive-foreground)] shadow-sm hover:bg-[color:var(--color-error-600)]",
        outline:
          "border border-[color:var(--color-border-default)] bg-[color:var(--color-bg-primary)] shadow-sm hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-foreground)]",
        secondary:
          "bg-[color:var(--color-secondary)] text-[color:var(--color-secondary-foreground)] shadow-sm hover:bg-[color:var(--color-secondary)]/80",
        ghost: "hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-foreground)]",
        link: "text-[color:var(--color-primary-500)] underline-offset-4 hover:underline",
        success:
          "bg-[color:var(--color-success-500)] text-[color:var(--color-text-inverse)] shadow-sm hover:bg-[color:var(--color-success-600)]",
        warning:
          "bg-[color:var(--color-warning-500)] text-[color:var(--color-text-primary)] shadow-sm hover:bg-[color:var(--color-warning-600)]",
        info:
          "bg-[color:var(--color-info-500)] text-[color:var(--color-text-inverse)] shadow-sm hover:bg-[color:var(--color-info-600)]",
        // Glassmorphism variants
        glass:
          "border border-[color:var(--color-border-subtle)]/30 bg-[color:var(--color-bg-elevated)]/70 backdrop-blur-xl text-[color:var(--color-text-primary)] shadow-[var(--shadow-glass-subtle)] hover:bg-[color:var(--color-bg-elevated)]/90 hover:shadow-[var(--shadow-glass-elevated)]",
        "glass-primary":
          "border border-[color:var(--color-primary-500)]/30 bg-[color:var(--color-primary-500)]/10 backdrop-blur-xl text-[color:var(--color-primary-700)] shadow-[var(--shadow-glass-subtle)] hover:bg-[color:var(--color-primary-500)]/20 hover:shadow-[var(--shadow-glass-elevated)]",
        // Subtle variants for Google AI Studio aesthetic
        subtle:
          "text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-secondary)]",
        "subtle-primary":
          "text-[color:var(--color-primary-600)] hover:text-[color:var(--color-primary-700)] hover:bg-[color:var(--color-primary-50)]",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 rounded-[var(--radius-sm)] px-3 text-xs",
        lg: "h-10 rounded-[var(--radius-lg)] px-5 text-base",
        xl: "h-12 rounded-[var(--radius-xl)] px-6 text-lg",
        icon:
          "h-9 w-9 rounded-[var(--radius-full)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-elevated)]/95",
        "icon-sm":
          "h-8 w-8 rounded-[var(--radius-full)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-elevated)]/95",
        "icon-lg":
          "h-10 w-10 rounded-[var(--radius-full)] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-elevated)]/95",
      },
      state: {
        default: "",
        loading: "cursor-wait opacity-80",
        success: "bg-[color:var(--color-success-500)] text-[color:var(--color-text-inverse)]",
        error: "bg-[color:var(--color-error-500)] text-[color:var(--color-text-inverse)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  successText?: string
  errorText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    state,
    asChild = false,
    loading = false,
    loadingText,
    successText,
    errorText,
    children,
    disabled,
    ...props
  }, ref) => {
    const [currentState, setCurrentState] = React.useState<"default" | "success" | "error">("default")
    const [isLoading, setIsLoading] = React.useState(false)
    
    // Handle loading state
    React.useEffect(() => {
      setIsLoading(loading)
    }, [loading])
    
    // Handle state changes
    React.useEffect(() => {
      if (state && state !== "default" && state !== "loading") {
        setCurrentState(state)
        // Auto-reset success/error states after 3 seconds
        if (state === "success" || state === "error") {
          const timer = setTimeout(() => {
            setCurrentState("default")
          }, 3000)
          return () => clearTimeout(timer)
        }
      }
    }, [state])
    
    // Determine button content based on state
    const getButtonContent = () => {
      if (isLoading || state === "loading") {
        return (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            {loadingText || "Loading..."}
          </>
        )
      }
      
      if (currentState === "success") {
        return (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successText || "Success"}
          </>
        )
      }
      
      if (currentState === "error") {
        return (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {errorText || "Error"}
          </>
        )
      }
      
      return children
    }
    
    // Determine if button should be disabled
    const isDisabled = disabled || isLoading || state === "loading"
    
    // Determine actual state for styling
    const actualState = isLoading || state === "loading" ? "loading" : currentState
    
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, state: actualState, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {getButtonContent()}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }