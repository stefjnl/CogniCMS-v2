"use client";

import * as React from "react";

// Animation types for scroll reveal
export type ScrollRevealAnimation = 
  | "fade-in-up"
  | "fade-in-down"
  | "fade-in-left"
  | "fade-in-right"
  | "scale-in"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right";

// Configuration options for scroll reveal
export interface ScrollRevealOptions {
  /** Animation type to apply */
  animation?: ScrollRevealAnimation;
  /** Delay before animation starts (in ms) */
  delay?: number;
  /** Duration of animation (in ms) */
  duration?: number;
  /** Threshold for when animation should trigger (0-1) */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Whether to animate only once or every time */
  once?: boolean;
  /** Custom CSS class to apply */
  className?: string;
}

// Default options
const DEFAULT_OPTIONS: Required<Omit<ScrollRevealOptions, "animation" | "className">> = {
  delay: 0,
  duration: 500,
  threshold: 0.1,
  rootMargin: "0px",
  once: true,
};

/**
 * Enhanced scroll reveal hook with Google AI Studio-inspired animations.
 * 
 * Features:
 * - Multiple animation types with smooth transitions
 * - Intersection Observer for performance optimization
 * - Configurable delay, duration, and threshold
 * - Support for one-time or repeated animations
 * - Reduced motion support for accessibility
 * - TypeScript support with full type safety
 * 
 * @param options - Configuration options for scroll reveal
 * @returns Object containing ref, isVisible, and animation classes
 */
export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const {
    animation = "fade-in-up",
    delay,
    duration,
    threshold,
    rootMargin,
    once,
    className,
  } = { ...DEFAULT_OPTIONS, ...options };

  const [isVisible, setIsVisible] = React.useState(false);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const elementRef = React.useRef<HTMLElement>(null);
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Generate animation classes based on type and options
  const getAnimationClasses = React.useCallback(() => {
    if (prefersReducedMotion) {
      return isVisible ? "animate-fade-in" : "";
    }

    const baseClass = animation;
    const delayClass = delay > 0 ? `animate-delay-${delay}` : "";
    const customClass = className || "";

    return isVisible ? `${baseClass} ${delayClass} ${customClass}`.trim() : "";
  }, [animation, delay, className, isVisible, prefersReducedMotion]);

  // Handle intersection callback
  const handleIntersection = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting) {
        setIsVisible(true);
        setHasAnimated(true);

        // If once is true, disconnect observer after first animation
        if (once && observerRef.current) {
          observerRef.current.disconnect();
        }
      } else if (!once) {
        setIsVisible(false);
      }
    },
    [once]
  );

  // Set up intersection observer
  React.useEffect(() => {
    if (!elementRef.current) return;

    // Create observer with options
    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    // Start observing the element
    observerRef.current.observe(elementRef.current);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold, rootMargin]);

  // Listen for reduced motion changes
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => {
      // Force re-render when reduced motion preference changes
      setIsVisible((prev) => prev);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return {
    ref: elementRef,
    isVisible,
    hasAnimated,
    animationClasses: getAnimationClasses(),
    shouldAnimate: !prefersReducedMotion || isVisible,
  };
}

/**
 * Hook for staggered animations in lists
 * 
 * @param itemCount - Number of items in the list
 * @param baseOptions - Base options for each item
 * @param staggerDelay - Delay between each item (in ms)
 * @returns Array of scroll reveal hooks for each item
 */
export function useStaggeredScrollReveal(
  itemCount: number,
  baseOptions: ScrollRevealOptions = {},
  staggerDelay: number = 100
) {
  return React.useMemo(
    () =>
      Array.from({ length: itemCount }, (_, index) =>
        useScrollReveal({
          ...baseOptions,
          delay: (baseOptions.delay || 0) + index * staggerDelay,
        })
      ),
    [itemCount, baseOptions, staggerDelay]
  );
}

/**
 * Hook for parallax scroll effects
 * 
 * @param speed - Parallax speed (0-1, where 0.5 is half speed)
 * @param direction - Direction of parallax effect
 * @returns Object containing ref and transform value
 */
export function useParallax(
  speed: number = 0.5,
  direction: "up" | "down" | "left" | "right" = "up"
) {
  const [transform, setTransform] = React.useState("translate3d(0, 0, 0)");
  const elementRef = React.useRef<HTMLElement>(null);
  const requestRef = React.useRef<number | null>(null);

  // Handle scroll events
  const handleScroll = React.useCallback(() => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const scrolled = window.pageYOffset;
    const rate = scrolled * -speed;

    let transformValue = "";
    switch (direction) {
      case "up":
        transformValue = `translate3d(0, ${rate}px, 0)`;
        break;
      case "down":
        transformValue = `translate3d(0, ${-rate}px, 0)`;
        break;
      case "left":
        transformValue = `translate3d(${rate}px, 0, 0)`;
        break;
      case "right":
        transformValue = `translate3d(${-rate}px, 0, 0)`;
        break;
    }

    setTransform(transformValue);
  }, [speed, direction]);

  // Set up scroll listener
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const throttledHandleScroll = () => {
      if (requestRef.current) return;
      requestRef.current = requestAnimationFrame(() => {
        handleScroll();
        requestRef.current = null;
      });
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [handleScroll]);

  return {
    ref: elementRef,
    transform,
    style: {
      transform,
      willChange: "transform",
    },
  };
}