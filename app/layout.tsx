import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CogniCMS Studio",
  description:
    "Modern, Google AI Studio-inspired CMS experience with rich editing and preview.",
  keywords: ["CMS", "Content Management", "Studio", "Editor", "Preview"],
  authors: [{ name: "CogniCMS Team" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: "light dark",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CogniCMS Studio",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cognicms.vercel.app",
    title: "CogniCMS Studio",
    description: "Modern, Google AI Studio-inspired CMS experience with rich editing and preview.",
    siteName: "CogniCMS Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "CogniCMS Studio",
    description: "Modern, Google AI Studio-inspired CMS experience with rich editing and preview.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Enhanced root layout with mobile-first design and Google AI Studio-inspired aesthetics.
 * 
 * Features:
 * - Optimized font loading with display:swap
 * - Enhanced ThemeProvider with all optimizations
 * - Theme loading overlay for smooth transitions
 * - Proper meta tags for mobile and PWA support
 * - Accessibility improvements with semantic HTML
 * - Performance optimizations with resource hints
 * - Mobile viewport configuration for better UX
 * - Safe area support for notched devices
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="theme-loading"
    >
      <head>
        {/* Preconnect to external resources for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Theme loading prevention script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent flash of incorrect theme
              (function() {
                var theme = localStorage.getItem('theme');
                if (theme) {
                  document.documentElement.classList.add(theme);
                } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
                }
                // Mark theme as loaded
                document.documentElement.classList.remove('theme-loading');
                document.documentElement.classList.add('theme-loaded');
              })();
            `,
          }}
        />
        
        {/* Mobile viewport optimization */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Fix mobile viewport height issues
              (function() {
                function setViewportHeight() {
                  var vh = window.innerHeight * 0.01;
                  document.documentElement.style.setProperty('--vh', vh + 'px');
                }
                setViewportHeight();
                window.addEventListener('resize', setViewportHeight);
                window.addEventListener('orientationchange', setViewportHeight);
              })();
            `,
          }}
        />
      </head>
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          antialiased
          bg-[var(--background)]
          text-[var(--foreground)]
          theme-aware-transition
          min-h-screen
          mobile-safe-area
        `}
      >
        {/* Theme transition overlay */}
        <div className="theme-transition-overlay" aria-hidden="true" />
        
        {/* Enhanced ThemeProvider with all optimizations */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="theme"
          disableTransitionOnChange={false}
        >
          {/* Theme loading indicator */}
          <div className="theme-loading-indicator" aria-hidden="true">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-md)]">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                Loading theme...
              </span>
            </div>
          </div>
          
          {/* Main content wrapper */}
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
        </ThemeProvider>
        
        {/* Theme initialization script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Hide loading indicator after theme is ready
              setTimeout(function() {
                var indicator = document.querySelector('.theme-loading-indicator');
                if (indicator) {
                  indicator.classList.remove('visible');
                }
              }, 500);
              
              // Add touch device detection
              if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                document.documentElement.classList.add('touch-device');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}