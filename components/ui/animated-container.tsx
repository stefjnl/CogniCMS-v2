"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useScrollReveal, ScrollRevealOptions } from "@/hooks/useScrollReveal";

// Animation types
export type AnimationType = 
  | "fade-in"
  | "fade-in-up"
  | "fade-in-down"
  | "fade-in-left"
  | "fade-in-right"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale-in"
  | "scale-in-smooth"
  | "bounce-in"
  | "flip-in"
  | "rotate-in";

// Container variants
export type ContainerVariant = 
  | "default"
  | "glass"
  | "glass-subtle"
  | "glass-soft"
  | "glass-medium"
  | "glass-strong"
  | "glass-intense"
  | "glass-card"
  | "glass-modal"
  | "glass-dropdown"
  | "glass-primary"
  | "glass-success"
  | "glass-warning"
  | "glass-error";

// Animation container props
export interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Animation type to apply */
  animation?: AnimationType;
  /** Container variant for styling */
  variant?: ContainerVariant;
  /** Scroll reveal options */
  scrollReveal?: boolean | ScrollRevealOptions;
  /** Whether to add hover effects */
  hover?: boolean;
  /** Whether to add loading state */
  loading?: boolean;
  /** Children to render */
  children: React.ReactNode;
  /** Custom animation class */
  animationClass?: string;
}

/**
 * Enhanced animated container component with Google AI Studio-inspired effects.
 * 
 * Features:
 * - Multiple animation types with smooth transitions
 * - Glassmorphism variants with different intensity levels
 * - Scroll reveal functionality with Intersection Observer
 * - Hover effects and loading states
 * - Performance optimizations with reduced motion support
 * - TypeScript support with full type safety
 * - Responsive design with mobile-first approach
 */
export const AnimatedContainer = React.forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({
    className,
    animation = "fade-in-up",
    variant = "default",
    scrollReveal = false,
    hover = false,
    loading = false,
    children,
    animationClass,
    ...props
  }, ref) => {
    // Handle scroll reveal
    const scrollRevealOptions = typeof scrollReveal === "boolean" 
      ? (scrollReveal ? { animation } : undefined)
      : { animation, ...scrollReveal };
    
    const {
      ref: scrollRef,
      isVisible,
      animationClasses,
    } = useScrollReveal(scrollRevealOptions);

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLDivElement) => {
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
        if (scrollReveal) scrollRef(node);
      },
      [ref, scrollRef, scrollReveal]
    );

    // Generate base classes based on variant
    const getVariantClasses = React.useCallback(() => {
      switch (variant) {
        case "glass":
          return "glass-medium";
        case "glass-subtle":
          return "glass-subtle";
        case "glass-soft":
          return "glass-soft";
        case "glass-medium":
          return "glass-medium";
        case "glass-strong":
          return "glass-strong";
        case "glass-intense":
          return "glass-intense";
        case "glass-card":
          return "glass-card";
        case "glass-modal":
          return "glass-modal";
        case "glass-dropdown":
          return "glass-dropdown";
        case "glass-primary":
          return "glass-primary";
        case "glass-success":
          return "glass-success";
        case "glass-warning":
          return "glass-warning";
        case "glass-error":
          return "glass-error";
        default:
          return "";
      }
    }, [variant]);

    // Generate hover classes
    const getHoverClasses = React.useCallback(() => {
      if (!hover) return "";
      
      switch (variant) {
        case "glass":
        case "glass-subtle":
        case "glass-soft":
        case "glass-medium":
        case "glass-strong":
        case "glass-intense":
          return "glass-hover";
        default:
          return "hover-lift";
      }
    }, [hover, variant]);

    // Generate animation classes
    const getAnimationClasses = React.useCallback(() => {
      if (scrollReveal) {
        return animationClasses;
      }
      
      if (loading) {
        return "animate-pulse-soft";
      }
      
      const baseAnimation = animationClass || animation;
      return baseAnimation;
    }, [scrollReveal, animationClasses, loading, animationClass, animation]);

    // Combine all classes
    const containerClasses = cn(
      getVariantClasses(),
      getHoverClasses(),
      getAnimationClasses(),
      className
    );

    return (
      <div
        ref={combinedRef}
        className={containerClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedContainer.displayName = "AnimatedContainer";

// Staggered animated container for lists
export interface StaggeredAnimatedContainerProps extends Omit<AnimatedContainerProps, "children"> {
  /** Array of items to render */
  items: React.ReactNode[];
  /** Stagger delay between items (in ms) */
  staggerDelay?: number;
  /** Custom render function for each item */
  renderItem?: (item: React.ReactNode, index: number) => React.ReactNode;
}

/**
 * Staggered animated container for lists with sequential animations.
 */
export const StaggeredAnimatedContainer = React.forwardRef<
  HTMLDivElement,
  StaggeredAnimatedContainerProps
>(
  ({
    items,
    staggerDelay = 100,
    renderItem,
    animation = "fade-in-up",
    scrollReveal = true,
    variant = "default",
    hover = false,
    className,
    ...props
  }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {items.map((item, index) => {
          const content = renderItem ? renderItem(item, index) : item;
          
          return (
            <AnimatedContainer
              key={index}
              animation={animation}
              variant={variant}
              hover={hover}
              scrollReveal={
                scrollReveal
                  ? {
                      animation,
                      delay: index * staggerDelay,
                    }
                  : false
              }
            >
              {content}
            </AnimatedContainer>
          );
        })}
      </div>
    );
  }
);

StaggeredAnimatedContainer.displayName = "StaggeredAnimatedContainer";

// Parallax container
export interface ParallaxContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Parallax speed (0-1) */
  speed?: number;
  /** Direction of parallax effect */
  direction?: "up" | "down" | "left" | "right";
  /** Children to render */
  children: React.ReactNode;
}

/**
 * Container with parallax scroll effect.
 */
export const ParallaxContainer = React.forwardRef<
  HTMLDivElement,
  ParallaxContainerProps
>(
  ({
    className,
    speed = 0.5,
    direction = "up",
    children,
    ...props
  }, ref) => {
    const [transform, setTransform] = React.useState("translate3d(0, 0, 0)");
    const elementRef = React.useRef<HTMLDivElement>(null);
    const requestRef = React.useRef<number | null>(null);

    // Handle scroll events
    const handleScroll = React.useCallback(() => {
      if (!elementRef.current) return;

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

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLDivElement) => {
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
        elementRef.current = node;
      },
      [ref]
    );

    return (
      <div
        ref={combinedRef}
        className={className}
        style={{
          transform,
          willChange: "transform",
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ParallaxContainer.displayName = "ParallaxContainer";