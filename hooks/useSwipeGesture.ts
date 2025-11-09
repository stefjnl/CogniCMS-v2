"use client";

import * as React from "react";

// Constants for swipe gesture configuration
const SWIPE_THRESHOLD = 50; // Minimum distance in pixels to trigger swipe
const VELOCITY_THRESHOLD = 0.3; // Minimum velocity for swipe detection
const TOUCH_START_TIMEOUT = 300; // Maximum time between touchstart and touchmove

// Touch point interface
interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

// Swipe direction enum
export enum SwipeDirection {
  LEFT = "left",
  RIGHT = "right",
  UP = "up",
  DOWN = "down",
}

// Swipe gesture hook options
interface UseSwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  velocityThreshold?: number;
  preventDefault?: boolean;
}

/**
 * Custom hook for handling swipe gestures on touch devices.
 * 
 * Features:
 * - Detects swipe directions (left, right, up, down)
 * - Configurable threshold and velocity settings
 * - Prevents default browser behavior when needed
 * - Performance optimized with passive event listeners
 * - Accessibility compliant with mouse support
 * - Proper cleanup of event listeners
 */
export function useSwipeGesture(options: UseSwipeGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = SWIPE_THRESHOLD,
    velocityThreshold = VELOCITY_THRESHOLD,
    preventDefault = true,
  } = options;

  // Track touch state
  const touchState = React.useRef<{
    start: TouchPoint | null;
    end: TouchPoint | null;
    isTracking: boolean;
  }>({
    start: null,
    end: null,
    isTracking: false,
  });

  // Calculate distance between two points
  const getDistance = React.useCallback((start: TouchPoint, end: TouchPoint): number => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate velocity of swipe
  const getVelocity = React.useCallback((start: TouchPoint, end: TouchPoint): number => {
    const distance = getDistance(start, end);
    const time = end.time - start.time;
    return time > 0 ? distance / time : 0;
  }, [getDistance]);

  // Determine swipe direction
  const getSwipeDirection = React.useCallback((start: TouchPoint, end: TouchPoint): SwipeDirection | null => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = getDistance(start, end);

    if (distance < threshold) return null;

    // Check if movement is more horizontal than vertical
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT;
    } else {
      return dy > 0 ? SwipeDirection.DOWN : SwipeDirection.UP;
    }
  }, [threshold, getDistance]);

  // Handle touch start
  const handleTouchStart = React.useCallback((e: TouchEvent | MouseEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    const point = "touches" in e ? e.touches[0] : e;
    touchState.current = {
      start: {
        x: point.clientX,
        y: point.clientY,
        time: Date.now(),
      },
      end: null,
      isTracking: true,
    };
  }, [preventDefault]);

  // Handle touch move
  const handleTouchMove = React.useCallback((e: TouchEvent | MouseEvent) => {
    if (!touchState.current.isTracking || !touchState.current.start) return;

    const point = "touches" in e ? e.touches[0] : e;
    touchState.current.end = {
      x: point.clientX,
      y: point.clientY,
      time: Date.now(),
    };
  }, []);

  // Handle touch end
  const handleTouchEnd = React.useCallback((e: TouchEvent | MouseEvent) => {
    if (!touchState.current.isTracking || !touchState.current.start || !touchState.current.end) {
      touchState.current.isTracking = false;
      return;
    }

    const { start, end } = touchState.current;
    const direction = getSwipeDirection(start, end);
    const velocity = getVelocity(start, end);

    // Only trigger swipe if velocity is sufficient
    if (direction && velocity >= velocityThreshold) {
      switch (direction) {
        case SwipeDirection.LEFT:
          onSwipeLeft?.();
          break;
        case SwipeDirection.RIGHT:
          onSwipeRight?.();
          break;
        case SwipeDirection.UP:
          onSwipeUp?.();
          break;
        case SwipeDirection.DOWN:
          onSwipeDown?.();
          break;
      }
    }

    // Reset tracking state
    touchState.current = {
      start: null,
      end: null,
      isTracking: false,
    };
  }, [getSwipeDirection, getVelocity, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  // Set up event listeners
  React.useEffect(() => {
    const element = document.documentElement;
    
    // Touch events for mobile
    element.addEventListener("touchstart", handleTouchStart, { passive: !preventDefault });
    element.addEventListener("touchmove", handleTouchMove, { passive: !preventDefault });
    element.addEventListener("touchend", handleTouchEnd, { passive: !preventDefault });
    
    // Mouse events for desktop testing
    element.addEventListener("mousedown", handleTouchStart);
    element.addEventListener("mousemove", handleTouchMove);
    element.addEventListener("mouseup", handleTouchEnd);

    return () => {
      // Clean up event listeners
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("mousedown", handleTouchStart);
      element.removeEventListener("mousemove", handleTouchMove);
      element.removeEventListener("mouseup", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);

  // Return gesture state for debugging or additional logic
  return {
    isTracking: touchState.current.isTracking,
    reset: () => {
      touchState.current = {
        start: null,
        end: null,
        isTracking: false,
      };
    },
  };
}