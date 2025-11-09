/**
 * Jest configuration for CogniCMS v2 (Next.js 16, React 19, TypeScript).
 *
 * Key points:
 * - Uses CommonJS config file (no ESM) for maximum Jest compatibility.
 * - jsdom test environment for React/component tests.
 * - ts-jest transforms TypeScript.
 * - Maps "@/..." to project root.
 * - Excludes .next output (including embedded package.json) to avoid haste-map collisions.
 */

/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
        diagnostics: {
          warnOnly: false,
        },
      },
    ],
  },

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
    "\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$": "<rootDir>/__mocks__/fileMock.js",
    // Mock react-resizable-panels (ESM-only) for Jest's CJS environment
    "^react-resizable-panels$": "<rootDir>/__mocks__/react-resizable-panels.js",
  },

  testMatch: ["<rootDir>/__tests__/**/*.(spec|test).(ts|tsx)"],

  collectCoverage: true,
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/types/**",
    "!**/node_modules/**",
    "!**/.next/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  // Ignore Next.js build output (contains its own package.json etc.)
  roots: ["<rootDir>"],
  modulePathIgnorePatterns: ["<rootDir>/.next/"],

  testEnvironmentOptions: {
    customExportConditions: ["browser", "module", "default"],
  },

  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};