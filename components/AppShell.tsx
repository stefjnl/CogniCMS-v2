"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Sparkles, Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sidebar } from "@/components/Sidebar";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";

// Constants for better maintainability
const HEADER_HEIGHT = "h-14 sm:h-16";
const SIDEBAR_WIDTH = "w-64";
const MOBILE_BREAKPOINT = "md";
const ANIMATION_DURATION = 300;

// Breadcrumb item interface
interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Search state interface
interface SearchState {
  isOpen: boolean;
  query: string;
}

/**
 * Enhanced AppShell component with mobile-first design and Google AI Studio-inspired aesthetics.
 * 
 * Features:
 * - Mobile-first responsive design with proper breakpoints
 * - Enhanced header with glassmorphism effects
 * - Integrated search functionality
 * - Breadcrumb navigation support
 * - Improved mobile hamburger menu
 * - Proper touch targets (44px minimum)
 * - Smooth animations and micro-interactions
 * - Accessibility compliance with ARIA labels
 * - Performance optimizations with React.memo
 * - Focus management for keyboard navigation
 */
export const AppShell = React.memo(function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [searchState, setSearchState] = React.useState<SearchState>({
    isOpen: false,
    query: "",
  });
  const [isAnimating, setIsAnimating] = React.useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  // Swipe gesture support for mobile sidebar
  useSwipeGesture({
    onSwipeRight: () => {
      // Only open sidebar on mobile when swiping from left edge
      if (window.innerWidth < 768 && !sidebarOpen) {
        handleSidebarToggle();
      }
    },
    onSwipeLeft: () => {
      // Close sidebar on mobile when swiping left
      if (window.innerWidth < 768 && sidebarOpen) {
        handleSidebarToggle();
      }
    },
    threshold: 60, // Slightly higher threshold for better UX
    velocityThreshold: 0.4,
    preventDefault: false, // Allow page scrolling
  });

  // Generate breadcrumbs from current pathname
  const breadcrumbs = React.useMemo((): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];
    
    let currentPath = "";
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      crumbs.push({ label, href: currentPath });
    });
    
    return crumbs;
  }, [pathname]);

  // Handle sidebar toggle with animation
  const handleSidebarToggle = React.useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSidebarOpen((prev) => {
      const newState = !prev;
      
      // Store previous focus element when opening
      if (newState && !previousFocusRef.current) {
        previousFocusRef.current = document.activeElement as HTMLElement;
      }
      
      // Restore focus when closing
      if (!newState && previousFocusRef.current) {
        setTimeout(() => {
          previousFocusRef.current?.focus();
          previousFocusRef.current = null;
        }, ANIMATION_DURATION);
      }
      
      return newState;
    });
    
    setTimeout(() => setIsAnimating(false), ANIMATION_DURATION);
  }, [isAnimating]);

  // Handle search toggle
  const handleSearchToggle = React.useCallback(() => {
    setSearchState((prev) => {
      const newState = { ...prev, isOpen: !prev.isOpen };
      
      // Focus search input when opening
      if (newState.isOpen && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      
      return newState;
    });
  }, []);

  // Handle search query change
  const handleSearchQueryChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchState((prev) => ({ ...prev, query: e.target.value }));
  }, []);

  // Handle search submit
  const handleSearchSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchState.query.trim()) {
      // Implement search functionality here
      console.log("Searching for:", searchState.query);
      setSearchState({ isOpen: false, query: "" });
    }
  }, [searchState.query]);

  // Handle escape key to close sidebar/search
  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (searchState.isOpen) {
        setSearchState((prev) => ({ ...prev, isOpen: false }));
      } else if (sidebarOpen) {
        handleSidebarToggle();
      }
    }
  }, [searchState.isOpen, sidebarOpen, handleSidebarToggle]);

  // Handle click outside to close sidebar
  const handleClickOutside = React.useCallback((e: MouseEvent) => {
    if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      handleSidebarToggle();
    }
  }, [sidebarOpen, handleSidebarToggle]);

  // Set up event listeners
  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleKeyDown, handleClickOutside]);

  // Handle route change to close mobile sidebar
  React.useEffect(() => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [pathname, sidebarOpen]);

  return (
    <div className="app-shell mobile-viewport-height">
      {/* Enhanced Top Navigation */}
      <header 
        className={cn(
          "glass-nav sticky top-0 z-30",
          HEADER_HEIGHT,
          "flex items-center justify-between gap-3",
          "border-b border-[color:var(--color-border-default)]",
          "px-3 sm:px-4 lg:px-6",
          "mobile-safe-area"
        )}
      >
        {/* Left section: Menu toggle + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile menu toggle */}
          <button
            type="button"
            className={cn(
              "mobile-touch-target inline-flex items-center justify-center rounded-full",
              "border border-[color:var(--color-border-subtle)]",
              "bg-[color:var(--color-bg-elevated)]/90 backdrop-blur-xl",
              "shadow-[var(--shadow-md)]",
              "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]",
              "mobile-focus-ring",
              MOBILE_BREAKPOINT + ":hidden"
            )}
            aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={sidebarOpen}
            aria-controls="mobile-sidebar"
            onClick={handleSidebarToggle}
          >
            {sidebarOpen ? (
              <X className="h-4 w-4 text-[color:var(--color-text-muted)]" />
            ) : (
              <Menu className="h-4 w-4 text-[color:var(--color-text-muted)]" />
            )}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="app-shell-logo flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-muted)]"
            aria-label="CogniCMS Studio home"
          >
            <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-2xl bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)] shadow-[var(--shadow-md)]">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="text-[11px] sm:text-xs font-semibold text-[color:var(--color-text-primary)]">
                CogniCMS Studio
              </span>
            </span>
          </Link>
        </div>

        {/* Center section: Search (hidden on mobile, visible on larger screens) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--color-text-muted)]" />
            <input
              type="search"
              placeholder="Search..."
              value={searchState.query}
              onChange={handleSearchQueryChange}
              className="mobile-search-input pl-10"
              aria-label="Search"
            />
          </form>
        </div>

        {/* Right section: Mobile search + Theme toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search toggle */}
          <button
            type="button"
            className={cn(
              "mobile-touch-target inline-flex items-center justify-center rounded-full",
              "border border-[color:var(--color-border-subtle)]",
              "bg-[color:var(--color-bg-elevated)]/90 backdrop-blur-xl",
              "shadow-[var(--shadow-md)]",
              "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]",
              "mobile-focus-ring",
              "md:hidden"
            )}
            aria-label={searchState.isOpen ? "Close search" : "Open search"}
            aria-expanded={searchState.isOpen}
            onClick={handleSearchToggle}
          >
            <Search className="h-4 w-4 text-[color:var(--color-text-muted)]" />
          </button>

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile search overlay */}
      {searchState.isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm mobile-overlay-enter"
            onClick={handleSearchToggle}
          />
          <div className="absolute top-0 left-0 right-0 p-3 mobile-glass-elevated mobile-sidebar-enter">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--color-text-muted)]" />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search..."
                value={searchState.query}
                onChange={handleSearchQueryChange}
                className="mobile-search-input pl-10"
                aria-label="Search"
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 mobile-touch-target rounded-full p-1 hover:bg-[color:var(--color-bg-subtle)]"
                onClick={handleSearchToggle}
                aria-label="Close search"
              >
                <X className="h-4 w-4 text-[color:var(--color-text-muted)]" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Breadcrumb navigation */}
      <nav className="breadcrumb-nav px-3 sm:px-4 lg:px-6 py-2 bg-[color:var(--color-bg-secondary)]/50 border-b border-[color:var(--color-border-subtle)]">
        <ol className="flex items-center gap-1">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href || crumb.label} className="breadcrumb-item">
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className={cn(
                    "breadcrumb-link",
                    index === breadcrumbs.length - 1 && "breadcrumb-current pointer-events-none"
                  )}
                  aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="breadcrumb-current">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="breadcrumb-separator h-3 w-3" />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Main layout: Sidebar + Content */}
      <div className="app-shell-main flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside 
          ref={sidebarRef}
          className={cn(
            "app-shell-sidebar hidden flex-col gap-2 border-r border-[color:var(--color-border-default)]",
            "bg-[color:var(--color-bg-tertiary)]/80 backdrop-blur-xl p-3",
            MOBILE_BREAKPOINT + ":flex",
            SIDEBAR_WIDTH,
            "shrink-0"
          )}
          aria-label="Primary navigation"
        >
          <Sidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            id="mobile-sidebar"
            className={cn(
              "fixed inset-0 z-40 flex",
              MOBILE_BREAKPOINT + ":hidden"
            )}
          >
            <div
              className="flex-1 bg-black/30 backdrop-blur-sm mobile-overlay-enter"
              onClick={handleSidebarToggle}
            />
            <div className={cn(SIDEBAR_WIDTH, "p-3 mobile-glass-elevated mobile-sidebar-enter")}>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main content area */}
        <main
          className={cn(
            "app-shell-content flex-1 overflow-y-auto",
            "bg-[color:var(--color-bg-secondary)]",
            "p-3 sm:p-4 lg:p-6 space-y-4",
            "mobile-scrollbar-hide"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
});