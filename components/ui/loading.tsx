"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Loading spinner sizes
export type LoadingSize = "sm" | "md" | "lg";

// Loading spinner variants
export type LoadingVariant = "default" | "primary" | "success" | "warning" | "error";

// Loading spinner props
export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Size of the spinner */
  size?: LoadingSize;
  /** Color variant of the spinner */
  variant?: LoadingVariant;
  /** Whether to show the spinner */
  show?: boolean;
  /** Custom text to display below spinner */
  text?: string;
}

/**
 * Enhanced loading spinner component with Google AI Studio-inspired design.
 * 
 * Features:
 * - Multiple size options (sm, md, lg)
 * - Color variants for different contexts
 * - Optional loading text
 * - Smooth animations with reduced motion support
 * - Accessibility support with proper ARIA labels
 */
export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", variant = "default", show = true, text, ...props }, ref) => {
    if (!show) return null;

    const getSizeClasses = React.useCallback(() => {
      switch (size) {
        case "sm":
          return "loading-spinner-sm";
        case "md":
          return "loading-spinner-md";
        case "lg":
          return "loading-spinner-lg";
        default:
          return "loading-spinner-md";
      }
    }, [size]);

    const getVariantClasses = React.useCallback(() => {
      switch (variant) {
        case "primary":
          return "border-t-[color:var(--color-primary-500)]";
        case "success":
          return "border-t-[color:var(--color-success-500)]";
        case "warning":
          return "border-t-[color:var(--color-warning-500)]";
        case "error":
          return "border-t-[color:var(--color-error-500)]";
        default:
          return "border-t-[color:var(--color-primary-500)]";
      }
    }, [variant]);

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center gap-3", className)}
        role="status"
        aria-label={text || "Loading"}
        {...props}
      >
        <div className={cn("loading-spinner", getSizeClasses(), getVariantClasses())} />
        {text && (
          <p className="text-sm text-[color:var(--color-text-muted)] animate-pulse-soft">
            {text}
          </p>
        )}
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

// Loading dots component
export interface LoadingDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show the dots */
  show?: boolean;
  /** Number of dots to display */
  count?: number;
  /** Size of dots */
  size?: "sm" | "md" | "lg";
  /** Color variant */
  variant?: LoadingVariant;
}

/**
 * Animated loading dots component.
 */
export const LoadingDots = React.forwardRef<HTMLDivElement, LoadingDotsProps>(
  ({ className, show = true, count = 3, size = "md", variant = "default", ...props }, ref) => {
    if (!show) return null;

    const getSizeClasses = React.useCallback(() => {
      switch (size) {
        case "sm":
          return "w-1.5 h-1.5";
        case "md":
          return "w-2 h-2";
        case "lg":
          return "w-2.5 h-2.5";
        default:
          return "w-2 h-2";
      }
    }, [size]);

    const getVariantClasses = React.useCallback(() => {
      switch (variant) {
        case "primary":
          return "bg-[color:var(--color-primary-500)]";
        case "success":
          return "bg-[color:var(--color-success-500)]";
        case "warning":
          return "bg-[color:var(--color-warning-500)]";
        case "error":
          return "bg-[color:var(--color-error-500)]";
        default:
          return "bg-[color:var(--color-primary-500)]";
      }
    }, [variant]);

    return (
      <div
        ref={ref}
        className={cn("loading-dots", className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className={cn("rounded-full", getSizeClasses(), getVariantClasses())}
          />
        ))}
      </div>
    );
  }
);

LoadingDots.displayName = "LoadingDots";

// Skeleton component props
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show the skeleton */
  show?: boolean;
  /** Skeleton variant */
  variant?: "text" | "text-sm" | "text-lg" | "avatar" | "button" | "card";
  /** Width of skeleton */
  width?: string | number;
  /** Height of skeleton */
  height?: string | number;
  /** Whether to animate */
  animate?: boolean;
}

/**
 * Enhanced skeleton component for loading states.
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    show = true, 
    variant = "text", 
    width, 
    height, 
    animate = true,
    style,
    ...props 
  }, ref) => {
    if (!show) return null;

    const getVariantClasses = React.useCallback(() => {
      switch (variant) {
        case "text":
          return "skeleton-text";
        case "text-sm":
          return "skeleton-text-sm";
        case "text-lg":
          return "skeleton-text-lg";
        case "avatar":
          return "skeleton-avatar";
        case "button":
          return "skeleton-button";
        case "card":
          return "skeleton-card";
        default:
          return "skeleton-text";
      }
    }, [variant]);

    const computedStyle = React.useMemo(() => ({
      width: width || style?.width,
      height: height || style?.height,
      ...style,
    }), [width, height, style]);

    return (
      <div
        ref={ref}
        className={cn(
          getVariantClasses(),
          animate && "skeleton",
          className
        )}
        style={computedStyle}
        role="status"
        aria-label="Loading content"
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

// Skeleton card component
export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show the skeleton card */
  show?: boolean;
  /** Whether to include avatar */
  avatar?: boolean;
  /** Number of text lines */
  lines?: number;
  /** Whether to include button */
  button?: boolean;
}

/**
 * Skeleton card component for card loading states.
 */
export const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, show = true, avatar = true, lines = 3, button = true, ...props }, ref) => {
    if (!show) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "glass-card p-4 space-y-3",
          className
        )}
        {...props}
      >
        {avatar && (
          <div className="flex items-center space-x-3">
            <Skeleton variant="avatar" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text-sm" width="60%" />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {Array.from({ length: lines }, (_, index) => (
            <Skeleton
              key={index}
              variant={index === 0 ? "text-lg" : "text"}
              width={index === lines - 1 ? "80%" : "100%"}
            />
          ))}
        </div>
        
        {button && (
          <div className="flex justify-end space-x-2 pt-2">
            <Skeleton variant="button" width={80} />
            <Skeleton variant="button" width={60} />
          </div>
        )}
      </div>
    );
  }
);

SkeletonCard.displayName = "SkeletonCard";

// Loading overlay component
export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show the overlay */
  show?: boolean;
  /** Overlay variant */
  variant?: "default" | "glass";
  /** Loading spinner size */
  spinnerSize?: LoadingSize;
  /** Loading text */
  text?: string;
  /** Whether to blur background */
  blur?: boolean;
}

/**
 * Loading overlay component for covering sections or full page.
 */
export const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ 
    className, 
    show = true, 
    variant = "default", 
    spinnerSize = "lg",
    text,
    blur = true,
    ...props 
  }, ref) => {
    if (!show) return null;

    const getVariantClasses = React.useCallback(() => {
      switch (variant) {
        case "glass":
          return "glass-modal bg-[color:var(--glass-modal-bg)]/90";
        default:
          return "bg-[color:var(--color-bg-primary)]/95";
      }
    }, [variant]);

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          getVariantClasses(),
          blur && "backdrop-blur-sm",
          className
        )}
        role="status"
        aria-label={text || "Loading"}
        {...props}
      >
        <LoadingSpinner size={spinnerSize} text={text} />
      </div>
    );
  }
);

LoadingOverlay.displayName = "LoadingOverlay";

// Progress bar component
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Progress value (0-100) */
  value?: number;
  /** Whether to show percentage */
  showPercentage?: boolean;
  /** Whether to animate */
  animate?: boolean;
  /** Color variant */
  variant?: LoadingVariant;
}

/**
 * Enhanced progress bar component with smooth animations.
 */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ 
    className, 
    value = 0, 
    showPercentage = false, 
    animate = true,
    variant = "primary",
    ...props 
  }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(0);

    // Animate progress value
    React.useEffect(() => {
      if (!animate) {
        setDisplayValue(value);
        return;
      }

      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);

      return () => clearTimeout(timer);
    }, [value, animate]);

    const getVariantClasses = React.useCallback(() => {
      switch (variant) {
        case "primary":
          return "bg-[color:var(--color-primary-500)]";
        case "success":
          return "bg-[color:var(--color-success-500)]";
        case "warning":
          return "bg-[color:var(--color-warning-500)]";
        case "error":
          return "bg-[color:var(--color-error-500)]";
        default:
          return "bg-[color:var(--color-primary-500)]";
      }
    }, [variant]);

    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        <div className="relative">
          <div className="w-full bg-[color:var(--color-bg-muted)] rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                getVariantClasses()
              )}
              style={{ width: `${displayValue}%` }}
            />
          </div>
          {showPercentage && (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-[color:var(--color-text-muted)]">
              {Math.round(displayValue)}%
            </span>
          )}
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";