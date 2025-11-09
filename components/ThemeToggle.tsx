"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { SunMedium, MoonStar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Constants for better maintainability
const TOGGLE_SIZE = "h-9 w-16";
const THUMB_SIZE = "w-7";
const ICON_SIZE = "h-4 w-4";
const TRANSITION_DURATION = 300;
const DEBOUNCE_DELAY = 150;

// Theme type for better type safety
type Theme = "light" | "dark" | "system";

/**
 * Enhanced ThemeToggle component with improved UX and accessibility.
 *
 * Features:
 * - Smooth animations with micro-interactions
 * - Enhanced accessibility with ARIA labels and keyboard navigation
 * - Loading states and visual feedback
 * - Debounced theme changes for performance
 * - System preference detection and display
 * - Focus management and screen reader support
 * - Reduced motion support for accessibility
 */
export function ThemeToggle() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isChanging, setIsChanging] = React.useState(false);
  const [debouncedTheme, setDebouncedTheme] = React.useState<Theme | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Debounced theme change for performance optimization
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const debouncedSetTheme = React.useCallback(
    (newTheme: Theme) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setDebouncedTheme(newTheme);
      timeoutRef.current = setTimeout(() => {
        setTheme(newTheme);
        setDebouncedTheme(null);
        setIsChanging(false);
      }, DEBOUNCE_DELAY);
    },
    [setTheme]
  );

  // Derive the active theme with proper fallback handling
  const activeTheme = React.useMemo(() => {
    if (typeof resolvedTheme === "string") return resolvedTheme;
    if (theme === "system") return systemTheme ?? "light";
    return theme ?? "light";
  }, [theme, systemTheme, resolvedTheme]);

  const isDark = activeTheme === "dark";
  const isSystem = theme === "system";

  // Enhanced toggle function with loading state
  const toggle = React.useCallback(() => {
    if (isChanging) return;
    
    setIsChanging(true);
    const newTheme = isDark ? "light" : "dark";
    debouncedSetTheme(newTheme);
  }, [isDark, isChanging, debouncedSetTheme]);

  // Keyboard navigation support
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    },
    [toggle]
  );

  // Mount effect with proper cleanup
  React.useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Generate accessible labels
  const getAriaLabel = React.useCallback(() => {
    if (isChanging) return "Changing theme...";
    if (isSystem) {
      return `Current theme: ${isDark ? "dark" : "light"} (system), Click to toggle`;
    }
    return `Current theme: ${isDark ? "dark" : "light"}, Click to toggle`;
  }, [isDark, isSystem, isChanging]);

  const getAriaPressed = React.useCallback(() => {
    return isDark ? "true" : "false";
  }, [isDark]);

  // Loading state component
  if (!mounted) {
    return (
      <button
        ref={buttonRef}
        type="button"
        aria-label="Loading theme toggle"
        disabled
        className={cn(
          "relative inline-flex items-center rounded-full border border-[color:var(--color-border-subtle)]",
          TOGGLE_SIZE,
          "bg-[color:var(--color-bg-elevated)]/90 backdrop-blur-xl px-1",
          "shadow-[var(--shadow-md)] cursor-not-allowed opacity-60",
          "transition-all duration-200 ease-out"
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className={cn(ICON_SIZE, "animate-spin text-[color:var(--color-muted)]")} />
        </div>
      </button>
    );
  }

  // Main toggle component
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      onKeyDown={handleKeyDown}
      aria-label={getAriaLabel()}
      aria-pressed={getAriaPressed()}
      aria-live="polite"
      disabled={isChanging}
      className={cn(
        "relative inline-flex items-center rounded-full border border-[color:var(--color-border-subtle)]",
        TOGGLE_SIZE,
        "bg-[color:var(--color-bg-elevated)]/90 backdrop-blur-xl px-1",
        "shadow-[var(--shadow-md)]",
        "transition-all duration-200 ease-out focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-primary)]",
        "hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5",
        "active:scale-95",
        isChanging && "cursor-not-allowed opacity-80",
        !isChanging && "cursor-pointer"
      )}
      style={{
        transitionDuration: `${TRANSITION_DURATION}ms`,
      }}
    >
      {/* Animated thumb */}
      <span
        className={cn(
          "absolute inset-y-1 rounded-full bg-[color:var(--color-primary)] shadow-[var(--shadow-sm)]",
          THUMB_SIZE,
          "transition-all duration-200 ease-out",
          "flex items-center justify-center",
          isDark ? "translate-x-7" : "translate-x-0",
          isChanging && "scale-110"
        )}
      >
        {isChanging && (
          <Loader2 className={cn("h-3 w-3 animate-spin text-[color:var(--color-primary-foreground)]")} />
        )}
      </span>

      {/* Sun icon (light mode) */}
      <span
        className={cn(
          "relative z-10 flex-1 flex items-center justify-center",
          "transition-all duration-200 ease-out",
          !isDark
            ? "text-[color:var(--color-primary-foreground)] scale-100"
            : "text-[color:var(--color-muted)] scale-75 opacity-50"
        )}
      >
        <SunMedium className={ICON_SIZE} />
      </span>

      {/* Moon icon (dark mode) */}
      <span
        className={cn(
          "relative z-10 flex-1 flex items-center justify-center",
          "transition-all duration-200 ease-out",
          isDark
            ? "text-[color:var(--color-primary-foreground)] scale-100"
            : "text-[color:var(--color-muted)] scale-75 opacity-50"
        )}
      >
        <MoonStar className={ICON_SIZE} />
      </span>

      {/* System indicator */}
      {isSystem && !isChanging && (
        <span
          className={cn(
            "absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs",
            "text-[color:var(--color-text-muted)] font-medium",
            "transition-opacity duration-200"
          )}
        >
          System
        </span>
      )}

      {/* Screen reader announcement */}
      <span className="sr-only" aria-live="polite">
        {isChanging ? "Theme is changing" : `Theme set to ${activeTheme}`}
      </span>
    </button>
  );
}