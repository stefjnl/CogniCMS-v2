"use client";

import * as React from "react";
import { 
  AnimatedContainer, 
  StaggeredAnimatedContainer, 
  ParallaxContainer 
} from "@/components/ui/animated-container";
import { 
  LoadingSpinner, 
  LoadingDots, 
  Skeleton, 
  SkeletonCard, 
  LoadingOverlay,
  ProgressBar 
} from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Animation test page showcasing all glassmorphism effects and animations.
 * 
 * This page demonstrates:
 * - Enhanced glassmorphism utilities with multiple intensity levels
 * - Smooth entrance/exit animations for components
 * - Hover animations and state transitions
 * - Loading animations and skeleton screens
 * - Scroll-triggered animations
 * - Parallax effects
 * - Performance optimizations with reduced motion support
 */
export default function AnimationTestPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [overlayVisible, setOverlayVisible] = React.useState(false);

  // Simulate loading progress
  React.useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsLoading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isLoading]);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setProgress(0);
  };

  const handleOverlayDemo = () => {
    setOverlayVisible(true);
    setTimeout(() => setOverlayVisible(false), 3000);
  };

  // Sample data for staggered animations
  const sampleItems = React.useMemo(() => [
    "Enhanced glassmorphism effects",
    "Smooth entrance animations",
    "Interactive hover states",
    "Loading skeleton screens",
    "Scroll-triggered reveals",
    "Parallax scrolling effects",
    "Performance optimizations",
    "Reduced motion support",
  ], []);

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-secondary)]">
      {/* Loading Overlay */}
      <LoadingOverlay
        show={overlayVisible}
        text="Demonstrating loading overlay..."
        variant="glass"
      />

      {/* Header */}
      <header className="glass-nav sticky top-0 z-40 border-b border-[color:var(--color-border-default)]">
        <div className="container-wide px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[color:var(--color-text-primary)]">
                Animation Showcase
              </h1>
              <span className="text-sm text-[color:var(--color-text-muted)]">
                Google AI Studio-inspired effects
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide px-4 py-8 space-y-12">
        
        {/* Hero Section with Parallax */}
        <section className="relative py-20">
          <ParallaxContainer speed={0.3} className="absolute inset-0">
            <div className="glass-intense rounded-[var(--radius-3xl)] h-96 opacity-20" />
          </ParallaxContainer>
          
          <div className="relative z-10 text-center space-y-6">
            <AnimatedContainer
              animation="fade-in-down"
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-5xl font-bold text-[color:var(--color-text-primary)]">
                Enhanced Animations
              </h2>
              <p className="text-xl text-[color:var(--color-text-secondary)]">
                Experience smooth, performant animations with Google AI Studio-inspired design
              </p>
            </AnimatedContainer>
            
            <AnimatedContainer
              animation="fade-in-up"
              delay={300}
              className="flex justify-center gap-4"
            >
              <Button onClick={handleLoadingDemo} variant="glass">
                Test Loading States
              </Button>
              <Button onClick={handleOverlayDemo} variant="glass-primary">
                Test Overlay
              </Button>
            </AnimatedContainer>
          </div>
        </section>

        {/* Glassmorphism Variants */}
        <section className="space-y-6">
          <AnimatedContainer animation="fade-in-up">
            <h3 className="text-3xl font-bold text-[color:var(--color-text-primary)] mb-6">
              Glassmorphism Variants
            </h3>
          </AnimatedContainer>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { variant: "glass-subtle", label: "Subtle" },
              { variant: "glass-soft", label: "Soft" },
              { variant: "glass-medium", label: "Medium" },
              { variant: "glass-strong", label: "Strong" },
              { variant: "glass-intense", label: "Intense" },
              { variant: "glass-card", label: "Card" },
            ].map((item, index) => (
              <AnimatedContainer
                key={item.variant}
                variant={item.variant as any}
                animation="fade-in-up"
                scrollReveal={{ delay: index * 100 }}
                hover
                className="p-6 text-center"
              >
                <h4 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-2">
                  {item.label}
                </h4>
                <p className="text-sm text-[color:var(--color-text-secondary)]">
                  Glassmorphism with {item.label.toLowerCase()} intensity
                </p>
              </AnimatedContainer>
            ))}
          </div>
        </section>

        {/* Animation Types */}
        <section className="space-y-6">
          <AnimatedContainer animation="fade-in-up">
            <h3 className="text-3xl font-bold text-[color:var(--color-text-primary)] mb-6">
              Animation Types
            </h3>
          </AnimatedContainer>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { animation: "fade-in", label: "Fade In" },
              { animation: "slide-up", label: "Slide Up" },
              { animation: "scale-in", label: "Scale In" },
              { animation: "bounce-in", label: "Bounce In" },
              { animation: "flip-in", label: "Flip In" },
              { animation: "rotate-in", label: "Rotate In" },
              { animation: "fade-in-left", label: "Fade Left" },
              { animation: "fade-in-right", label: "Fade Right" },
            ].map((item, index) => (
              <AnimatedContainer
                key={item.animation}
                variant="glass-card"
                animation={item.animation as any}
                scrollReveal={{ delay: index * 150 }}
                hover
                className="p-6 text-center"
              >
                <h4 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-2">
                  {item.label}
                </h4>
                <p className="text-sm text-[color:var(--color-text-secondary)]">
                  {item.animation} animation
                </p>
              </AnimatedContainer>
            ))}
          </div>
        </section>

        {/* Loading States */}
        <section className="space-y-6">
          <AnimatedContainer animation="fade-in-up">
            <h3 className="text-3xl font-bold text-[color:var(--color-text-primary)] mb-6">
              Loading States
            </h3>
          </AnimatedContainer>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Spinners and Dots */}
            <AnimatedContainer
              variant="glass-card"
              animation="fade-in-right"
              className="p-6 space-y-6"
            >
              <h4 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
                Spinners & Dots
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-around">
                  <LoadingSpinner size="sm" />
                  <LoadingSpinner size="md" />
                  <LoadingSpinner size="lg" />
                </div>
                
                <div className="flex items-center justify-around">
                  <LoadingDots variant="primary" />
                  <LoadingDots variant="success" />
                  <LoadingDots variant="warning" />
                </div>
              </div>
            </AnimatedContainer>

            {/* Skeletons */}
            <AnimatedContainer
              variant="glass-card"
              animation="fade-in-left"
              className="p-6 space-y-6"
            >
              <h4 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
                Skeleton Screens
              </h4>
              
              <div className="space-y-4">
                <Skeleton variant="text" />
                <Skeleton variant="text-sm" width="80%" />
                <Skeleton variant="text-lg" width="60%" />
                
                <div className="flex items-center gap-3">
                  <Skeleton variant="avatar" width={40} height={40} />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text-sm" width="60%" />
                  </div>
                </div>
              </div>
            </AnimatedContainer>
          </div>

          {/* Progress Bar */}
          <AnimatedContainer
            variant="glass-card"
            animation="fade-in-up"
            className="p-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
                  Progress Bar
                </h4>
                <Button onClick={handleLoadingDemo} size="sm">
                  {isLoading ? "Loading..." : "Start Demo"}
                </Button>
              </div>
              
              <ProgressBar 
                value={progress} 
                showPercentage 
                animate 
                variant="primary" 
              />
            </div>
          </AnimatedContainer>

          {/* Skeleton Card */}
          <AnimatedContainer
            animation="fade-in-up"
            delay={200}
          >
            <SkeletonCard avatar lines={4} button />
          </AnimatedContainer>
        </section>

        {/* Staggered List */}
        <section className="space-y-6">
          <AnimatedContainer animation="fade-in-up">
            <h3 className="text-3xl font-bold text-[color:var(--color-text-primary)] mb-6">
              Staggered Animations
            </h3>
          </AnimatedContainer>
          
          <StaggeredAnimatedContainer
            items={sampleItems}
            animation="fade-in-up"
            variant="glass-card"
            hover
            staggerDelay={100}
            renderItem={(item, index) => (
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[color:var(--color-primary-500)]/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-[color:var(--color-primary-600)]">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-[color:var(--color-text-secondary)]">{item}</p>
                </div>
              </div>
            )}
          />
        </section>

        {/* Interactive Demo */}
        <section className="space-y-6">
          <AnimatedContainer animation="fade-in-up">
            <h3 className="text-3xl font-bold text-[color:var(--color-text-primary)] mb-6">
              Interactive Demo
            </h3>
          </AnimatedContainer>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedContainer
              variant="glass-primary"
              animation="bounce-in"
              hover
              className="p-6 text-center cursor-pointer"
            >
              <div className="text-4xl mb-4">✨</div>
              <h4 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-2">
                Hover Effects
              </h4>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Hover over this card to see the glassmorphism hover effect
              </p>
            </AnimatedContainer>

            <AnimatedContainer
              variant="glass-success"
              animation="flip-in"
              hover
              className="p-6 text-center cursor-pointer"
            >
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-2">
                Smooth Transitions
              </h4>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                All transitions use GPU-accelerated transforms
              </p>
            </AnimatedContainer>

            <AnimatedContainer
              variant="glass-warning"
              animation="rotate-in"
              hover
              className="p-6 text-center cursor-pointer"
            >
              <div className="text-4xl mb-4">🚀</div>
              <h4 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-2">
                Performance
              </h4>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Optimized for 60fps animations
              </p>
            </AnimatedContainer>
          </div>
        </section>

        {/* Colored Glassmorphism */}
        <section className="space-y-6">
          <AnimatedContainer animation="fade-in-up">
            <h3 className="text-3xl font-bold text-[color:var(--color-text-primary)] mb-6">
              Colored Glassmorphism
            </h3>
          </AnimatedContainer>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedContainer
              variant="glass-primary"
              animation="fade-in-up"
              scrollReveal={{ delay: 0 }}
              hover
              className="p-6 text-center"
            >
              <h4 className="text-lg font-semibold text-[color:var(--color-primary-700)] mb-2">
                Primary
              </h4>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Primary colored glass
              </p>
            </AnimatedContainer>

            <AnimatedContainer
              variant="glass-success"
              animation="fade-in-up"
              scrollReveal={{ delay: 100 }}
              hover
              className="p-6 text-center"
            >
              <h4 className="text-lg font-semibold text-[color:var(--color-success-700)] mb-2">
                Success
              </h4>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Success colored glass
              </p>
            </AnimatedContainer>

            <AnimatedContainer
              variant="glass-warning"
              animation="fade-in-up"
              scrollReveal={{ delay: 200 }}
              hover
              className="p-6 text-center"
            >
              <h4 className="text-lg font-semibold text-[color:var(--color-warning-700)] mb-2">
                Warning
              </h4>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Warning colored glass
              </p>
            </AnimatedContainer>

            <AnimatedContainer
              variant="glass-error"
              animation="fade-in-up"
              scrollReveal={{ delay: 300 }}
              hover
              className="p-6 text-center"
            >
              <h4 className="text-lg font-semibold text-[color:var(--color-error-700)] mb-2">
                Error
              </h4>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Error colored glass
              </p>
            </AnimatedContainer>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass-nav border-t border-[color:var(--color-border-default)] mt-20">
        <div className="container-wide px-4 py-8">
          <div className="text-center text-[color:var(--color-text-muted)]">
            <p>Animation Showcase - Google AI Studio-inspired Design System</p>
            <p className="text-sm mt-2">
              Built with enhanced glassmorphism effects and smooth animations
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}