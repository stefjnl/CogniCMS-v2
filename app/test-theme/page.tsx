"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSystemTheme, getReducedMotion } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { 
  Sun, 
  Moon, 
  Monitor, 
  Settings, 
  Eye, 
  EyeOff, 
  Zap, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

/**
 * Comprehensive theme testing page.
 * 
 * This page allows testing all theme functionality including:
 * - Theme switching and transitions
 * - System preference detection
 * - Reduced motion support
 * - Accessibility features
 * - Performance optimizations
 * - SSR and hydration handling
 */
export default function ThemeTestPage() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [testResults, setTestResults] = React.useState<Record<string, boolean>>({});
  const [isRunningTests, setIsRunningTests] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const runTests = React.useCallback(async () => {
    setIsRunningTests(true);
    const results: Record<string, boolean> = {};

    // Test 1: Theme provider functionality
    try {
      results.themeProvider = typeof setTheme === "function";
      results.themeResolution = typeof resolvedTheme === "string";
    } catch (error) {
      results.themeProvider = false;
      results.themeResolution = false;
    }

    // Test 2: System preference detection
    try {
      results.systemThemeDetection = typeof getSystemTheme() === "string";
      results.reducedMotionDetection = typeof getReducedMotion() === "boolean";
    } catch (error) {
      results.systemThemeDetection = false;
      results.reducedMotionDetection = false;
    }

    // Test 3: CSS custom properties
    try {
      const rootStyles = getComputedStyle(document.documentElement);
      results.cssVariables = !!rootStyles.getPropertyValue("--theme-transition-duration");
    } catch (error) {
      results.cssVariables = false;
    }

    // Test 4: Theme persistence
    try {
      localStorage.setItem("test-theme", "dark");
      results.localStorage = localStorage.getItem("test-theme") === "dark";
      localStorage.removeItem("test-theme");
    } catch (error) {
      results.localStorage = false;
    }

    // Test 5: Accessibility attributes
    try {
      const toggle = document.querySelector('[role="button"][aria-label*="theme"]');
      results.accessibilityAttributes = !!toggle;
    } catch (error) {
      results.accessibilityAttributes = false;
    }

    setTestResults(results);
    setIsRunningTests(false);
  }, [setTheme, resolvedTheme]);

  const currentTheme = React.useMemo(() => {
    if (!mounted) return "loading";
    return resolvedTheme || "unknown";
  }, [mounted, resolvedTheme]);

  const isDark = currentTheme === "dark";
  const isSystem = theme === "system";

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading theme test page...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] theme-aware-transition">
      <div className="container-wide py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Enhanced Theme Test Suite</h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Comprehensive testing for optimized theme provider and toggle functionality
          </p>
        </div>

        {/* Theme Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="surface-elevated p-6 theme-aware-transition">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Current Theme Status
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Theme:</span>
                <span className="font-mono text-sm bg-[var(--color-bg-muted)] px-2 py-1 rounded">
                  {theme}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Resolved:</span>
                <span className="font-mono text-sm bg-[var(--color-bg-muted)] px-2 py-1 rounded">
                  {resolvedTheme}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>System:</span>
                <span className="font-mono text-sm bg-[var(--color-bg-muted)] px-2 py-1 rounded">
                  {systemTheme}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Is Dark:</span>
                <span className={`font-mono text-sm px-2 py-1 rounded ${
                  isDark ? "bg-[var(--color-error-soft)] text-[var(--color-error-700)]" : "bg-[var(--color-success-soft)] text-[var(--color-success-700)]"
                }`}>
                  {isDark ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          <div className="surface-elevated p-6 theme-aware-transition">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              System Preferences
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Color Scheme:</span>
                <span className="font-mono text-sm bg-[var(--color-bg-muted)] px-2 py-1 rounded">
                  {getSystemTheme()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Reduced Motion:</span>
                <span className={`font-mono text-sm px-2 py-1 rounded ${
                  getReducedMotion() 
                    ? "bg-[var(--color-warning-soft)] text-[var(--color-warning-700)]" 
                    : "bg-[var(--color-success-soft)] text-[var(--color-success-700)]"
                }`}>
                  {getReducedMotion() ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Transition Duration:</span>
                <span className="font-mono text-sm bg-[var(--color-bg-muted)] px-2 py-1 rounded">
                  {getReducedMotion() ? "0ms" : "300ms"}
                </span>
              </div>
            </div>
          </div>

          <div className="surface-elevated p-6 theme-aware-transition">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Theme Controls
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Enhanced Toggle:</span>
                <ThemeToggle />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === "light" 
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" 
                      : "bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === "dark" 
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" 
                      : "bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === "system" 
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" 
                      : "bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                  System
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="surface-elevated p-6 mb-8 theme-aware-transition">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Automated Tests
            </h2>
            <button
              onClick={runTests}
              disabled={isRunningTests}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg hover:bg-[var(--color-primary-600)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunningTests ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Run Tests
                </>
              )}
            </button>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(testResults).map(([testName, passed]) => (
                <div
                  key={testName}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    passed 
                      ? "bg-[var(--color-success-50)] border-[var(--color-success-200)] text-[var(--color-success-700)]" 
                      : "bg-[var(--color-error-50)] border-[var(--color-error-200)] text-[var(--color-error-700)]"
                  }`}
                >
                  {passed ? (
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  )}
                  <span className="font-medium capitalize">
                    {testName.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Original Theme Tests */}
        <div className="space-y-8">
          {/* Color System Test */}
          <div className="surface-elevated p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
              Color System
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 rounded-[var(--radius-lg)] bg-[color:var(--color-primary-500)]"></div>
                <p className="text-sm text-[color:var(--color-text-muted)]">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-[var(--radius-lg)] bg-[color:var(--color-success-500)]"></div>
                <p className="text-sm text-[color:var(--color-text-muted)]">Success</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-[var(--radius-lg)] bg-[color:var(--color-warning-500)]"></div>
                <p className="text-sm text-[color:var(--color-text-muted)]">Warning</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-[var(--radius-lg)] bg-[color:var(--color-error-500)]"></div>
                <p className="text-sm text-[color:var(--color-text-muted)]">Error</p>
              </div>
            </div>
          </div>

          {/* Components Test */}
          <div className="surface-elevated p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
              Enhanced Components
            </h2>
            
            {/* Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[color:var(--color-text-secondary)]">Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            {/* Form Elements */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[color:var(--color-text-secondary)]">Form Elements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="input-test">Input Field</Label>
                  <Input id="input-test" placeholder="Enter text here..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="textarea-test">Textarea</Label>
                  <Textarea id="textarea-test" placeholder="Enter longer text here..." />
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[color:var(--color-text-secondary)]">Toggles</h3>
              <div className="flex flex-wrap gap-3">
                <Toggle>Default Toggle</Toggle>
                <Toggle variant="outline">Outline Toggle</Toggle>
                <Toggle size="sm">Small</Toggle>
                <Toggle size="lg">Large</Toggle>
              </div>
            </div>
          </div>

          {/* Glassmorphism Test */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
              Glassmorphism Effects
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-elevated p-6 space-y-2">
                <h3 className="text-lg font-medium text-[color:var(--color-text-primary)]">
                  Glass Elevated
                </h3>
                <p className="text-[color:var(--color-text-secondary)]">
                  Enhanced glassmorphism with backdrop blur and subtle shadows
                </p>
              </div>
              <div className="glass-subtle p-6 space-y-2">
                <h3 className="text-lg font-medium text-[color:var(--color-text-primary)]">
                  Glass Subtle
                </h3>
                <p className="text-[color:var(--color-text-secondary)]">
                  Lighter glass effect for less prominent elements
                </p>
              </div>
            </div>
          </div>

          {/* Animation Test */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
              Animations
            </h2>
            
            <div className="flex flex-wrap gap-4">
              <div className="surface-interactive p-4 animate-fade-in">
                <p className="text-[color:var(--color-text-primary)]">Fade In</p>
              </div>
              <div className="surface-interactive p-4 animate-slide-up">
                <p className="text-[color:var(--color-text-primary)]">Slide Up</p>
              </div>
              <div className="surface-interactive p-4 animate-scale-in">
                <p className="text-[color:var(--color-text-primary)]">Scale In</p>
              </div>
            </div>
          </div>

          {/* Typography Test */}
          <div className="surface-elevated p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
              Typography Scale
            </h2>
            
            <div className="space-y-3">
              <p className="text-xs text-[color:var(--color-text-secondary)]">Extra Small Text (12px)</p>
              <p className="text-sm text-[color:var(--color-text-secondary)]">Small Text (14px)</p>
              <p className="text-base text-[color:var(--color-text-primary)]">Base Text (16px)</p>
              <p className="text-lg text-[color:var(--color-text-primary)]">Large Text (18px)</p>
              <p className="text-xl text-[color:var(--color-text-primary)]">Extra Large Text (20px)</p>
              <p className="text-2xl text-[color:var(--color-text-primary)]">2XL Text (24px)</p>
              <p className="text-3xl text-[color:var(--color-text-primary)]">3XL Text (30px)</p>
            </div>
          </div>
        </div>

        {/* Performance Info */}
        <div className="surface-elevated p-6 theme-aware-transition mt-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Performance Optimizations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Implemented Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-success-600)]" />
                  SSR hydration mismatch prevention
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-success-600)]" />
                  Debounced theme changes (150ms)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-success-600)]" />
                  System preference listeners
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-success-600)]" />
                  Reduced motion support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-success-600)]" />
                  CSS will-change optimization
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3">Accessibility Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-success-600)]" />
                  ARIA labels and descriptions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-success-600)]" />
                  Keyboard navigation support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-success-600)]" />
                  Screen reader announcements
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-success-600)]" />
                  Focus management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[var(--color-success-600)]" />
                  High contrast mode support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}