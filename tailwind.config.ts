import type { Config } from "tailwindcss";

const config: Config = {
  // Use CSS-first approach with Tailwind v4
  // The actual configuration is in app/globals.css using @theme inline
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    extend: {
      // Enhanced color system using OKLCH with semantic tokens
      colors: {
        // shadcn/ui compatibility colors - now using our enhanced tokens
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "oklch(var(--color-primary-50))",
          100: "oklch(var(--color-primary-100))",
          200: "oklch(var(--color-primary-200))",
          300: "oklch(var(--color-primary-300))",
          400: "oklch(var(--color-primary-400))",
          500: "oklch(var(--color-primary-500))",
          600: "oklch(var(--color-primary-600))",
          700: "oklch(var(--color-primary-700))",
          800: "oklch(var(--color-primary-800))",
          900: "oklch(var(--color-primary-900))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          50: "oklch(var(--color-error-50))",
          100: "oklch(var(--color-error-100))",
          500: "oklch(var(--color-error-500))",
          600: "oklch(var(--color-error-600))",
          700: "oklch(var(--color-error-700))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        focus: "oklch(var(--color-focus))",
        
        // Semantic color palette
        success: {
          50: "oklch(var(--color-success-50))",
          100: "oklch(var(--color-success-100))",
          500: "oklch(var(--color-success-500))",
          600: "oklch(var(--color-success-600))",
          700: "oklch(var(--color-success-700))",
        },
        warning: {
          50: "oklch(var(--color-warning-50))",
          100: "oklch(var(--color-warning-100))",
          500: "oklch(var(--color-warning-500))",
          600: "oklch(var(--color-warning-600))",
          700: "oklch(var(--color-warning-700))",
        },
        error: {
          50: "oklch(var(--color-error-50))",
          100: "oklch(var(--color-error-100))",
          500: "oklch(var(--color-error-500))",
          600: "oklch(var(--color-error-600))",
          700: "oklch(var(--color-error-700))",
        },
        info: {
          50: "oklch(var(--color-info-50))",
          100: "oklch(var(--color-info-100))",
          500: "oklch(var(--color-info-500))",
          600: "oklch(var(--color-info-600))",
          700: "oklch(var(--color-info-700))",
        },
        
        // Surface colors
        surface: {
          primary: "oklch(var(--color-bg-primary))",
          secondary: "oklch(var(--color-bg-secondary))",
          tertiary: "oklch(var(--color-bg-tertiary))",
          elevated: "oklch(var(--color-bg-elevated))",
          subtle: "oklch(var(--color-bg-subtle))",
          muted: "oklch(var(--color-bg-muted))",
        },
        
        // Text colors
        text: {
          primary: "oklch(var(--color-text-primary))",
          secondary: "oklch(var(--color-text-secondary))",
          tertiary: "oklch(var(--color-text-tertiary))",
          muted: "oklch(var(--color-text-muted))",
          disabled: "oklch(var(--color-text-disabled))",
          inverse: "oklch(var(--color-text-inverse))",
        },
        
        // Border colors
        border: {
          subtle: "oklch(var(--color-border-subtle))",
          default: "oklch(var(--color-border-default))",
          strong: "oklch(var(--color-border-strong))",
          focus: "oklch(var(--color-border-focus))",
        },
      },
      
      // Enhanced spacing scale
      spacing: {
        px: "var(--space-px)",
        0: "var(--space-0)",
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        7: "1.75rem",   /* 28px */
        8: "var(--space-8)",
        9: "2.25rem",   /* 36px */
        10: "var(--space-10)",
        11: "2.75rem",   /* 44px */
        12: "var(--space-12)",
        14: "3.5rem",    /* 56px */
        16: "var(--space-16)",
        20: "var(--space-20)",
        24: "var(--space-24)",
        28: "7rem",      /* 112px */
        32: "var(--space-32)",
        36: "9rem",      /* 144px */
        40: "10rem",     /* 160px */
        44: "11rem",     /* 176px */
        48: "12rem",     /* 192px */
        52: "13rem",     /* 208px */
        56: "14rem",     /* 224px */
        60: "15rem",     /* 240px */
        64: "16rem",     /* 256px */
        72: "18rem",     /* 288px */
        80: "20rem",     /* 320px */
        96: "24rem",     /* 384px */
      },
      
      // Enhanced typography scale
      fontSize: {
        xs: ["var(--font-size-xs)", { lineHeight: "var(--line-height-normal)", letterSpacing: "var(--letter-spacing-normal)" }],
        sm: ["var(--font-size-sm)", { lineHeight: "var(--line-height-normal)", letterSpacing: "var(--letter-spacing-normal)" }],
        base: ["var(--font-size-base)", { lineHeight: "var(--line-height-normal)", letterSpacing: "var(--letter-spacing-normal)" }],
        lg: ["var(--font-size-lg)", { lineHeight: "var(--line-height-normal)", letterSpacing: "var(--letter-spacing-normal)" }],
        xl: ["var(--font-size-xl)", { lineHeight: "var(--line-height-normal)", letterSpacing: "var(--letter-spacing-normal)" }],
        "2xl": ["var(--font-size-2xl)", { lineHeight: "var(--line-height-tight)", letterSpacing: "var(--letter-spacing-tight)" }],
        "3xl": ["var(--font-size-3xl)", { lineHeight: "var(--line-height-tight)", letterSpacing: "var(--letter-spacing-tight)" }],
        "4xl": ["var(--font-size-4xl)", { lineHeight: "var(--line-height-tight)", letterSpacing: "var(--letter-spacing-tight)" }],
        "5xl": ["var(--font-size-5xl)", { lineHeight: "var(--line-height-tight)", letterSpacing: "var(--letter-spacing-tight)" }],
        "6xl": ["3.75rem", { lineHeight: "1", letterSpacing: "var(--letter-spacing-tight)" }],
        "7xl": ["4.5rem", { lineHeight: "1", letterSpacing: "var(--letter-spacing-tight)" }],
        "8xl": ["6rem", { lineHeight: "1", letterSpacing: "var(--letter-spacing-tight)" }],
        "9xl": ["8rem", { lineHeight: "1", letterSpacing: "var(--letter-spacing-tight)" }],
      },
      
      // Enhanced line height
      lineHeight: {
        none: "1",
        tight: "var(--line-height-tight)",
        snug: "1.375",
        normal: "var(--line-height-normal)",
        relaxed: "var(--line-height-relaxed)",
        loose: "2",
      },
      
      // Enhanced letter spacing
      letterSpacing: {
        tighter: "-0.05em",
        tight: "var(--letter-spacing-tight)",
        normal: "var(--letter-spacing-normal)",
        wide: "var(--letter-spacing-wide)",
        wider: "0.05em",
        widest: "0.1em",
      },
      
      // Enhanced border radius
      borderRadius: {
        none: "var(--radius-none)",
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        full: "var(--radius-full)",
      },
      
      // Enhanced shadow system
      boxShadow: {
        none: "none",
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        "glass-elevated": "0 8px 32px 0 rgb(31 38 135 / 0.15)",
        "glass-subtle": "0 4px 16px 0 rgb(31 38 135 / 0.08)",
      },
      
      // Enhanced animation system
      animation: {
        none: "none",
        spin: "spin 1s linear infinite",
        ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 1s infinite",
        "fade-in": "fadeIn var(--transition-duration-300) var(--transition-timing-ease-out)",
        "slide-up": "slideUp var(--transition-duration-300) var(--transition-timing-ease-out)",
        "scale-in": "scaleIn var(--transition-duration-200) var(--transition-timing-ease-out)",
      },
      
      // Enhanced transition duration
      transitionDuration: {
        75: "var(--transition-duration-75)",
        100: "var(--transition-duration-100)",
        150: "var(--transition-duration-150)",
        200: "var(--transition-duration-200)",
        300: "var(--transition-duration-300)",
        500: "var(--transition-duration-500)",
        700: "var(--transition-duration-700)",
      },
      
      // Enhanced transition timing
      transitionTimingFunction: {
        linear: "var(--transition-timing-linear)",
        ease: "var(--transition-timing-ease)",
        "ease-in": "var(--transition-timing-ease-in)",
        "ease-out": "var(--transition-timing-ease-out)",
        "ease-in-out": "var(--transition-timing-ease-in-out)",
      },
      
      // Enhanced backdrop blur
      backdropBlur: {
        xs: "blur(2px)",
        sm: "blur(4px)",
        DEFAULT: "blur(8px)",
        md: "blur(12px)",
        lg: "blur(16px)",
        xl: "blur(24px)",
        "2xl": "blur(40px)",
        "3xl": "blur(64px)",
        glass: "var(--glass-blur)",
      },
      
      // Enhanced font families
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      
      // Enhanced aspect ratio
      aspectRatio: {
        square: "1 / 1",
        video: "16 / 9",
        "4/3": "4 / 3",
        "3/2": "3 / 2",
        "21/9": "21 / 9",
        "2/1": "2 / 1",
        "10/16": "10 / 16",
        "9/16": "9 / 16",
        "1/2": "1 / 2",
      },
      
      // Enhanced grid template columns
      gridTemplateColumns: {
        13: "repeat(13, minmax(0, 1fr))",
        14: "repeat(14, minmax(0, 1fr))",
        15: "repeat(15, minmax(0, 1fr))",
        16: "repeat(16, minmax(0, 1fr))",
      },
      
      // Enhanced z-index scale
      zIndex: {
        hide: -1,
        auto: "auto",
        0: "0",
        10: "10",
        20: "20",
        30: "30",
        40: "40",
        50: "50",
        modal: "1000",
        dropdown: "1050",
        sticky: "1100",
        fixed: "1200",
        "overlay-backdrop": "1300",
        tooltip: "1400",
        max: "9999",
      },
    },
  },
  plugins: [],
  // Enable dark mode support
  darkMode: "class",
};

export default config;