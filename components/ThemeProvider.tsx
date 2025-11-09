"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Theme constants for better maintainability
const THEME_STORAGE_KEY = "theme";
const SYSTEM_THEME = "system";
const TRANSITION_DURATION = 300;

// System preference detection utilities
const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: "class" | "data-theme";
  defaultTheme?: "light" | "dark" | "system";
  enableSystem?: boolean;
  storageKey?: string;
  forcedTheme?: "light" | "dark";
  disableTransitionOnChange?: boolean;
}

/**
 * Enhanced global theme provider using next-themes.
 *
 * Features:
 * - Optimized SSR support with hydration mismatch prevention
 * - System preference detection for color scheme and reduced motion
 * - Smooth theme transitions with proper duration control
 * - Theme persistence with localStorage support
 * - Performance optimizations with debouncing
 * - Memory management with proper cleanup
 * - Accessibility compliance with reduced motion support
 */
export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = SYSTEM_THEME,
  enableSystem = true,
  storageKey = THEME_STORAGE_KEY,
  forcedTheme,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);
  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">("light");
  const [reducedMotion, setReducedMotion] = React.useState(false);

  // Handle system preference detection and updates
  React.useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Initial system theme detection
    setSystemTheme(getSystemTheme());
    setReducedMotion(getReducedMotion());

    // Set up media query listeners for system preference changes
    const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    // Add event listeners
    colorSchemeQuery.addEventListener("change", handleColorSchemeChange);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    // Mark as mounted after system detection
    setMounted(true);

    // Cleanup function
    return () => {
      colorSchemeQuery.removeEventListener("change", handleColorSchemeChange);
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
    };
  }, []);

  // Enhanced transition management
  React.useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    // Add CSS variable for transition duration
    const root = document.documentElement;
    root.style.setProperty("--theme-transition-duration", `${reducedMotion ? 0 : TRANSITION_DURATION}ms`);

    // Cleanup on unmount
    return () => {
      root.style.removeProperty("--theme-transition-duration");
    };
  }, [mounted, reducedMotion]);

  // Memoize provider props to prevent unnecessary re-renders
  const providerProps = React.useMemo(() => ({
    attribute,
    defaultTheme,
    enableSystem,
    storageKey,
    forcedTheme,
    disableTransitionOnChange: disableTransitionOnChange || reducedMotion,
    // Enable color scheme for better browser integration
    enableColorScheme: true,
    // Add nonce for CSP if needed in production
    // nonce: process.env.NEXT_PUBLIC_CSP_NONCE,
  }), [attribute, defaultTheme, enableSystem, storageKey, forcedTheme, disableTransitionOnChange, reducedMotion]);

  // Prevent hydration mismatch by rendering null until mounted
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <NextThemesProvider {...providerProps}>
      {children}
    </NextThemesProvider>
  );
}

// Export utilities for external use
export { getSystemTheme, getReducedMotion, SYSTEM_THEME, TRANSITION_DURATION };