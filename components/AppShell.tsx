"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

// Constants for better maintainability
const HEADER_HEIGHT = "h-14 sm:h-16";

/**
 * Simplified AppShell component with minimal header.
 *
 * Features:
 * - Minimal header with logo and theme toggle only
 * - Full-width content area for CMS editor
 * - Clean, distraction-free interface
 */
export const AppShell = React.memo(function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen flex-col">
      {/* Minimal Header: Logo + Theme Toggle */}
      <header
        className={cn(
          "glass-nav sticky top-0 z-30",
          HEADER_HEIGHT,
          "flex items-center justify-between gap-3",
          "border-b border-[color:var(--color-border-default)]",
          "px-3 sm:px-4 lg:px-6"
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium"
          aria-label="CogniCMS Studio home"
        >
          <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-2xl bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)] shadow-[var(--shadow-md)]">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
          <span className="hidden sm:inline-block text-[11px] sm:text-xs font-semibold text-[color:var(--color-text-primary)]">
            CogniCMS Studio
          </span>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />
      </header>

      {/* Full-width Main Content */}
      <main className="flex-1 overflow-y-auto bg-[color:var(--color-bg-secondary)] p-3 sm:p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
});