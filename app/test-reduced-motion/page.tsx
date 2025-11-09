"use client";

import * as React from "react";
import { 
  AnimatedContainer, 
  StaggeredAnimatedContainer 
} from "@/components/ui/animated-container";
import { 
  LoadingSpinner, 
  LoadingDots, 
  Skeleton 
} from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Reduced motion accessibility test page.
 * 
 * This page demonstrates that all animations properly respect the
 * user's reduced motion preferences for accessibility compliance.
 */
export default function ReducedMotionTestPage() {
  const [showAnimations, setShowAnimations] = React.useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  // Check for reduced motion preference
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleAnimations = () => {
    setShowAnimations(!showAnimations);
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-secondary)]">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-40 border-b border-[color:var(--color-border-default)]">
        <div className="container-wide px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[color:var(--color-text-primary)]">
                Reduced Motion Test
              </h1>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  prefersReducedMotion 
                    ? "bg-[color:var(--color-success-500)]/20 text-[color:var(--color-success-700)]"
                    : "bg-[color:var(--color-warning-500)]/20 text-[color:var(--color-warning-700)]"
                }`}>
                  {prefersReducedMotion ? "Reduced Motion ON" : "Reduced Motion OFF"}
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide px-4 py-8 space-y-12">
        
        {/* Info Section */}
        <section className="text-center space-y-6">
          <AnimatedContainer
            animation="fade-in-down"
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-[color:var(--color-text-primary)]">
              Accessibility Compliance
            </h2>
            <p className="text-lg text-[color:var(--color-text-secondary)]">
              All animations respect user preferences for reduced motion
            </p>
          </AnimatedContainer>
          
          <AnimatedContainer
            animation="fade-in-up"
            delay={200}
          >
            <Button onClick={toggleAnimations} variant="glass">
              {showAnimations ? "Hide" : "Show"} Animations
            </Button>
          </AnimatedContainer>
        </section>

        {/* Animation Status */}
        {prefersReducedMotion && (
          <AnimatedContainer
            variant="glass-success"
            animation="fade-in-up"
            className="p-6 text-center"
          >
            <h3 className="text-xl font-semibold text-[color:var(--color-success-700)] mb-2">
              ♿ Accessibility Mode Active
            </h3>
            <p className="text-[color:var(--color-text-secondary)]">
              All animations are simplified or disabled to respect your motion preferences.
              This ensures a comfortable experience for users with vestibular disorders.
            </p>
          </AnimatedContainer>
        )}

        {/* Test Animations */}
        {showAnimations && (
          <>
            {/* Basic Animations */}
            <section className="space-y-6">
              <AnimatedContainer animation="fade-in-up">
                <h3 className="text-3xl font-bold text-[color:var(--color-text-primary)] mb-6">
                  Animation Types
                </h3>
              </AnimatedContainer>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { animation: "fade-in", label: "Fade In" },
                  { animation: "slide-up", label: "Slide Up" },
                  { animation: "scale-in", label: "Scale In" },
                  { animation: "bounce-in", label: "Bounce In" },
                  { animation: "flip-in", label: "Flip In" },
                  { animation: "rotate-in", label: "Rotate In" },
                ].map((item, index) => (
                  <AnimatedContainer
                    key={item.animation}
                    variant="glass-card"
                    animation={item.animation as any}
                    scrollReveal={{ delay: index * 100 }}
                    hover
                    className="p-6 text-center"
                  >
                    <h4 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-2">
                      {item.label}
                    </h4>
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                      {prefersReducedMotion ? "Simplified" : "Full animation"}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AnimatedContainer
                  variant="glass-card"
                  animation="fade-in-right"
                  className="p-6 space-y-6"
                >
                  <h4 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
                    Spinners
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

                <AnimatedContainer
                  variant="glass-card"
                  animation="fade-in-left"
                  className="p-6 space-y-6"
                >
                  <h4 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
                    Skeletons
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
            </section>

            {/* Staggered List */}
            <section className="space-y-6">
              <AnimatedContainer animation="fade-in-up">
                <h3 className="text-3xl font-bold text-[color:var(--color-text-primary)] mb-6">
                  Staggered List
                </h3>
              </AnimatedContainer>
              
              <StaggeredAnimatedContainer
                items={[
                  "Item 1: Should animate with delay",
                  "Item 2: Should animate with delay",
                  "Item 3: Should animate with delay",
                  "Item 4: Should animate with delay",
                  "Item 5: Should animate with delay",
                ]}
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
                      <p className="text-xs text-[color:var(--color-text-muted)]">
                        {prefersReducedMotion ? "No stagger" : "Staggered"}
                      </p>
                    </div>
                  </div>
                )}
              />
            </section>

            {/* Interactive Elements */}
            <section className="space-y-6">
              <AnimatedContainer animation="fade-in-up">
                <h3 className="text-3xl font-bold text-[color:var(--color-text-primary)] mb-6">
                  Interactive Elements
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
                    Hover Effect
                  </h4>
                  <p className="text-sm text-[color:var(--color-text-secondary)]">
                    {prefersReducedMotion ? "No hover animation" : "Smooth hover animation"}
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
                    Transform
                  </h4>
                  <p className="text-sm text-[color:var(--color-text-secondary)]">
                    {prefersReducedMotion ? "No transform" : "3D transform"}
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
                    Motion
                  </h4>
                  <p className="text-sm text-[color:var(--color-text-secondary)]">
                    {prefersReducedMotion ? "Reduced motion" : "Full motion"}
                  </p>
                </AnimatedContainer>
              </div>
            </section>
          </>
        )}

        {/* Instructions */}
        <section className="space-y-6">
          <AnimatedContainer
            variant="glass-subtle"
            animation="fade-in-up"
            className="p-6"
          >
            <h3 className="text-xl font-semibold text-[color:var(--color-text-primary)] mb-4">
              How to Test Reduced Motion
            </h3>
            <div className="space-y-3 text-[color:var(--color-text-secondary)]">
              <p>
                <strong>macOS:</strong> System Preferences → Accessibility → Display → Reduce motion
              </p>
              <p>
                <strong>Windows:</strong> Settings → Ease of Access → Display → Show animations in Windows
              </p>
              <p>
                <strong>Browser:</strong> Some browsers support this preference in their accessibility settings
              </p>
            </div>
          </AnimatedContainer>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass-nav border-t border-[color:var(--color-border-default)] mt-20">
        <div className="container-wide px-4 py-8">
          <div className="text-center text-[color:var(--color-text-muted)]">
            <p>Reduced Motion Accessibility Test</p>
            <p className="text-sm mt-2">
              Ensuring comfortable experiences for all users
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}