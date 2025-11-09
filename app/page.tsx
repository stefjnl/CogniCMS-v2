"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CMSLayout } from "@/components/cms/CMSLayout";
import { ContentProvider } from "@/lib/state/ContentContext";
import { ContentSchema } from "@/types/content";
import { Toaster } from "sonner";
import { AppShell } from "@/components/AppShell";

// Constants for better maintainability
const LOADING_TIMEOUT = 10000; // 10 seconds timeout
const RETRY_DELAY = 2000; // 2 seconds delay before retry

interface LoadedData {
  content: ContentSchema;
  html: string;
  sha?: {
    html: string;
    content: string;
  };
}

interface LoadingState {
  isLoading: boolean;
  isRetrying: boolean;
  retryCount: number;
}

/**
 * Enhanced home page with mobile-first design and Google AI Studio-inspired aesthetics.
 * 
 * Features:
 * - Optimized loading states with proper feedback
 * - Enhanced error handling with retry functionality
 * - Mobile-first responsive design
 * - Accessibility compliance with semantic HTML
 * - Performance optimizations with lazy loading
 * - Proper focus management for screen readers
 * - Smooth animations and micro-interactions
 */
export default function Home() {
  const [data, setData] = useState<LoadedData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    isRetrying: false,
    retryCount: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Handle authentication check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("cms-auth") === "true";

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [router]);

  // Load content with enhanced error handling
  const loadContent = async (isRetry = false) => {
    try {
      setLoadingState(prev => ({
        ...prev,
        isLoading: true,
        isRetrying: isRetry,
      }));

      // Add timeout for loading
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => reject(new Error("Loading timeout")), LOADING_TIMEOUT);
      });

      const apiResponse = await Promise.race([
        fetch("/api/content/load"),
        timeoutPromise,
      ]);

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(
          errorData.error || "Failed to load content from GitHub"
        );
      }

      const loadedData = await apiResponse.json();
      setData(loadedData);
      setError(null);
      setLoadingState({
        isLoading: false,
        isRetrying: false,
        retryCount: 0,
      });
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : "Failed to load content from GitHub";
      
      setError(errorMessage);
      setLoadingState(prev => ({
        ...prev,
        isLoading: false,
        isRetrying: false,
        retryCount: isRetry ? prev.retryCount + 1 : prev.retryCount,
      }));
    }
  };

  // Initial content load
  useEffect(() => {
    loadContent();
  }, []);

  // Handle retry with delay
  const handleRetry = () => {
    setTimeout(() => {
      loadContent(true);
    }, RETRY_DELAY);
  };

  // Enhanced loading state component
  if (loadingState.isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <div className="glass-elevated px-6 py-8 text-center max-w-sm w-full animate-fade-in">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-[3px] border-[color:var(--color-primary-soft)] border-r-transparent" />
            <h2 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-2">
              {loadingState.isRetrying ? "Retrying..." : "Loading your workspace"}
            </h2>
            <p className="text-xs text-[color:var(--color-text-muted)] mb-1">
              {loadingState.isRetrying 
                ? `Attempt ${loadingState.retryCount + 1} - Please wait...`
                : "Connecting to CogniCMS Studio..."
              }
            </p>
            {loadingState.isRetrying && (
              <p className="text-[10px] text-[color:var(--color-text-muted)] mt-2">
                This may take a moment if the server is waking up
              </p>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  // Enhanced error state component
  if (error || !data) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <div className="glass-elevated max-w-md w-full px-6 py-8 text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 mx-auto rounded-full bg-[color:var(--color-error-soft)] flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[color:var(--color-error)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <div>
              <h1 className="text-sm font-semibold text-[color:var(--color-error)] mb-2">
                {error ? "Connection Error" : "Unable to load workspace"}
              </h1>
              <p className="text-xs text-[color:var(--color-text-muted)] leading-relaxed">
                {error || "Something went wrong while connecting to the content API."}
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleRetry}
                disabled={loadingState.isRetrying}
                className="w-full mobile-touch-target inline-flex items-center justify-center rounded-[var(--radius-md)] px-4 py-2.5 text-[11px] font-medium bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] shadow-[var(--shadow-md)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loadingState.isRetrying ? "Retrying..." : "Try Again"}
              </button>
              
              {loadingState.retryCount > 2 && (
                <button
                  onClick={() => window.location.reload()}
                  className="w-full mobile-touch-target inline-flex items-center justify-center rounded-[var(--radius-md)] px-4 py-2.5 text-[11px] font-medium bg-[color:var(--color-bg-elevated)] text-[color:var(--color-text-primary)] border border-[color:var(--color-border-subtle)] transition-all hover:bg-[color:var(--color-bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-primary)]"
                >
                  Refresh Page
                </button>
              )}
            </div>

            {loadingState.retryCount > 0 && (
              <p className="text-[10px] text-[color:var(--color-text-muted)] mt-3">
                Retry attempts: {loadingState.retryCount}
              </p>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  // Main content with enhanced structure
  return (
    <AppShell>
      <ContentProvider
        initialContent={data.content}
        initialHtml={data.html}
        initialSha={data.sha || undefined}
      >
        <div className="animate-fade-in">
          <CMSLayout />
        </div>
      </ContentProvider>
      
      {/* Enhanced toast notifications */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: "glass-elevated border border-[color:var(--color-border-subtle)]",
          style: {
            background: "var(--color-bg-elevated)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border-subtle)",
          },
        }}
      />
    </AppShell>
  );
}