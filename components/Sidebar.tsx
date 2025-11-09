"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  Settings2,
  ChevronDown,
  ChevronRight,
  Folder,
  Users,
  BarChart3,
  HelpCircle
} from "lucide-react";

// Constants for better maintainability
const ICON_SIZE = "h-4 w-4";
const ANIMATION_DURATION = 200;
const KEYBOARD_NAVIGATION_KEYS = ["ArrowUp", "ArrowDown", "Enter", " ", "Escape"];

// Enhanced sidebar item interface with nested support
export interface SidebarItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  active?: boolean;
  disabled?: boolean;
  badge?: string | number;
  children?: SidebarItem[];
}

// Default navigation items with enhanced structure
const defaultItems: SidebarItem[] = [
  { 
    label: "Dashboard", 
    href: "/", 
    icon: LayoutDashboard,
  },
  { 
    label: "Content", 
    href: "/content", 
    icon: FileText,
    children: [
      { label: "Pages", href: "/content/pages" },
      { label: "Posts", href: "/content/posts" },
      { label: "Media", href: "/content/media" },
    ]
  },
  { 
    label: "Playground", 
    href: "/playground", 
    icon: Sparkles,
  },
  { 
    label: "Analytics", 
    href: "/analytics", 
    icon: BarChart3,
  },
  { 
    label: "Team", 
    href: "/team", 
    icon: Users,
  },
  { 
    label: "Settings", 
    href: "/settings", 
    icon: Settings2,
  },
];

interface SidebarProps {
  items?: SidebarItem[];
  className?: string;
  isMobile?: boolean;
}

/**
 * Enhanced Sidebar component with mobile-first design and Google AI Studio-inspired aesthetics.
 * 
 * Features:
 * - Smooth animations and micro-interactions
 * - Keyboard navigation support
 * - Nested navigation with expand/collapse
 * - Active state indicators with proper styling
 * - Badge support for notifications
 * - Accessibility compliance with ARIA labels
 * - Mobile-optimized touch targets
 * - Performance optimizations with React.memo
 * - Focus management for keyboard navigation
 */
export const Sidebar = React.memo(function Sidebar({ 
  items = defaultItems, 
  className,
  isMobile = false 
}: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
  const sidebarRef = React.useRef<HTMLElement>(null);
  const itemRefs = React.useRef<(HTMLAnchorElement | HTMLButtonElement)[]>([]);

  // Flatten items for keyboard navigation
  const flattenedItems = React.useMemo(() => {
    const result: (SidebarItem & { depth: number; parent?: string })[] = [];
    
    const flatten = (items: SidebarItem[], depth = 0, parent?: string) => {
      items.forEach((item) => {
        result.push({ ...item, depth, parent });
        if (item.children && expandedItems.has(item.label)) {
          flatten(item.children, depth + 1, item.label);
        }
      });
    };
    
    flatten(items);
    return result;
  }, [items, expandedItems]);

  // Check if an item is active
  const isItemActive = React.useCallback((item: SidebarItem): boolean => {
    if (item.href === pathname) return true;
    if (item.children) {
      return item.children.some(child => child.href === pathname);
    }
    return false;
  }, [pathname]);

  // Toggle expanded state for nested items
  const toggleExpanded = React.useCallback((label: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (!KEYBOARD_NAVIGATION_KEYS.includes(e.key)) return;

    e.preventDefault();
    
    switch (e.key) {
      case "ArrowDown":
        setFocusedIndex((prev) => {
          const next = (prev + 1) % flattenedItems.length;
          itemRefs.current[next]?.focus();
          return next;
        });
        break;
        
      case "ArrowUp":
        setFocusedIndex((prev) => {
          const next = prev <= 0 ? flattenedItems.length - 1 : prev - 1;
          itemRefs.current[next]?.focus();
          return next;
        });
        break;
        
      case "Enter":
      case " ":
        if (focusedIndex >= 0) {
          const item = flattenedItems[focusedIndex];
          if (item.children) {
            toggleExpanded(item.label);
          } else if (item.href) {
            // Navigate to href
            window.location.href = item.href;
          }
        }
        break;
        
      case "Escape":
        setFocusedIndex(-1);
        sidebarRef.current?.focus();
        break;
    }
  }, [flattenedItems, focusedIndex, toggleExpanded]);

  // Render sidebar item with enhanced styling
  const renderItem = React.useCallback((
    item: SidebarItem & { depth: number; parent?: string },
    index: number
  ) => {
    const Icon = item.icon;
    const isActive = isItemActive(item);
    const isExpanded = expandedItems.has(item.label);
    const hasChildren = item.children && item.children.length > 0;
    const paddingLeft = `${0.75 + (item.depth * 1)}rem`;

    if (hasChildren) {
      return (
        <div key={`${item.label}-${item.depth}`} className="w-full">
          <button
            ref={(el) => { itemRefs.current[index] = el!; }}
            type="button"
            className={cn(
              "group flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium",
              "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]",
              "hover:bg-[color:var(--color-bg-elevated)]/95",
              "transition-all duration-200",
              "outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-primary)]",
              isActive && "bg-[color:var(--color-bg-elevated)] text-[color:var(--color-primary)] shadow-sm",
              item.disabled && "opacity-50 cursor-not-allowed",
              isMobile && "mobile-touch-target"
            )}
            style={{ paddingLeft }}
            onClick={() => !item.disabled && toggleExpanded(item.label)}
            aria-expanded={isExpanded}
            aria-haspopup="true"
            disabled={item.disabled}
          >
            {Icon && (
              <Icon className={cn(ICON_SIZE, "text-[color:var(--color-text-muted)] group-hover:text-[color:var(--color-primary)]", 
                isActive && "text-[color:var(--color-primary)]")} />
            )}
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="rounded-full bg-[color:var(--color-primary)] px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--color-primary-foreground)]">
                {item.badge}
              </span>
            )}
            {isExpanded ? (
              <ChevronDown className={cn(ICON_SIZE, "text-[color:var(--color-text-muted)]")} />
            ) : (
              <ChevronRight className={cn(ICON_SIZE, "text-[color:var(--color-text-muted)]")} />
            )}
          </button>
          
          {/* Nested items with animation */}
          {hasChildren && (
            <div className={cn(
              "overflow-hidden transition-all duration-200 ease-in-out",
              isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="mt-1 space-y-1">
                {item.children!.map((child, childIndex) => {
                  const childItem = { ...child, depth: item.depth + 1, parent: item.label };
                  const childFlattenedIndex = flattenedItems.findIndex(
                    (fi) => fi.label === child.label && fi.depth === childItem.depth
                  );
                  return renderItem(childItem, childFlattenedIndex);
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={`${item.label}-${item.depth}`}
        ref={(el) => { itemRefs.current[index] = el!; }}
        href={item.href || "#"}
        className={cn(
          "group flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium",
          "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-primary)]",
          "hover:bg-[color:var(--color-bg-elevated)]/95",
          "transition-all duration-200",
          "outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-primary)]",
          isActive && "bg-[color:var(--color-bg-elevated)] text-[color:var(--color-primary)] shadow-sm",
          item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          isMobile && "mobile-touch-target"
        )}
        style={{ paddingLeft }}
        aria-current={isActive ? "page" : undefined}
      >
        {Icon && (
          <Icon className={cn(ICON_SIZE, "text-[color:var(--color-text-muted)] group-hover:text-[color:var(--color-primary)]", 
            isActive && "text-[color:var(--color-primary)]")} />
        )}
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="rounded-full bg-[color:var(--color-primary)] px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--color-primary-foreground)]">
            {item.badge}
          </span>
        )}
      </Link>
    );
  }, [expandedItems, flattenedItems, isItemActive, isMobile, toggleExpanded]);

  // Auto-expand parent items when active
  React.useEffect(() => {
    const activeItem = items.find(item => isItemActive(item));
    if (activeItem?.children) {
      setExpandedItems((prev) => new Set(prev).add(activeItem.label));
    }
  }, [items, isItemActive, pathname]);

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "app-shell-sidebar flex flex-col gap-2",
        "bg-[color:var(--color-bg-tertiary)]/80 backdrop-blur-xl",
        "p-3 h-full overflow-y-auto mobile-scrollbar-hide",
        className
      )}
      aria-label="Primary navigation"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Workspace header */}
      <div className="mb-4 px-1 pt-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
          Workspace
        </p>
        <p className="text-xs text-[color:var(--color-text-muted)] mt-1">
          CogniCMS Studio
        </p>
      </div>

      {/* Navigation items */}
      <nav className="flex flex-col gap-1" role="navigation">
        {flattenedItems.map((item, index) => renderItem(item, index))}
      </nav>

      {/* Help section */}
      <div className="mt-auto pt-4 border-t border-[color:var(--color-border-subtle)]">
        <Link
          href="/help"
          className="group flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium"
        >
          <HelpCircle className={cn(ICON_SIZE, "text-[color:var(--color-text-muted)] group-hover:text-[color:var(--color-primary)]")} />
          <span className="text-[color:var(--color-text-muted)] group-hover:text-[color:var(--color-text-primary)]">
            Help & Support
          </span>
        </Link>
      </div>

      {/* Status indicator */}
      <div className="pt-3 text-[9px] text-[color:var(--color-text-muted)]">
        <p>Changes auto-saved.</p>
      </div>
    </aside>
  );
});