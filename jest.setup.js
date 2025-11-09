/**
 * Global Jest setup for CogniCMS v2
 *
 * Responsibilities:
 * - Configure @testing-library/jest-dom
 * - Provide stable fetch implementation (whatwg-fetch)
 * - Define test-safe environment variables
 * - Mock localStorage/sessionStorage for jsdom
 * - Provide helpers for mocking Next.js router and runtime
 * - Provide default mocks for GitHub API (@octokit/rest)
 * - Provide utilities for mocking React Context providers
 */

require("@testing-library/jest-dom");
require("whatwg-fetch");

// ---------------------------------------------------------------------------
// Environment Variables
// ---------------------------------------------------------------------------

/**
 * Provide default fallbacks for environment variables used in the app.
 * Individual tests can override as needed.
 */
process.env.NEXT_PUBLIC_CMS_PASSWORD = process.env.NEXT_PUBLIC_CMS_PASSWORD || "test-password";
process.env.GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || "test-owner";
process.env.GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || "test-repo";
process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || "test-token";

// ---------------------------------------------------------------------------
// Storage Mocks (localStorage / sessionStorage)
// ---------------------------------------------------------------------------

function createStorageMock() {
  /** @type {Map<string, string>} */
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) || null : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    get length() {
      return store.size;
    },
  };
}

// jsdom provides window, but ensure storages exist and are stable.
if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    value: createStorageMock(),
    writable: true,
  });

  Object.defineProperty(window, "sessionStorage", {
    value: createStorageMock(),
    writable: true,
  });
}

// ---------------------------------------------------------------------------
// Fetch Mock Utility (optional override)
// ---------------------------------------------------------------------------

/**
 * Tests can use `global.fetch = jest.fn()` to override.
 * By default we leave fetch from whatwg-fetch, which behaves like browser fetch.
 */

// ---------------------------------------------------------------------------
// Next.js / Router Mocks
// ---------------------------------------------------------------------------

/**
 * For components using next/navigation hooks we provide a lightweight mock.
 * Tests can override specific methods as needed.
 */
jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () =>
      new URLSearchParams(),
  };
});

// ---------------------------------------------------------------------------
// GitHub API Mock (@octokit/rest)
// ---------------------------------------------------------------------------

/**
 * Global default mock for @octokit/rest to avoid real network calls.
 * Individual tests can override methods per scenario.
 */
jest.mock("@octokit/rest", () => {
  const createMockClient = () => ({
    repos: {
      getContent: jest.fn().mockResolvedValue({
        data: {
          type: "file",
          content: Buffer.from("{}").toString("base64"),
          encoding: "base64",
        },
      }),
      createOrUpdateFileContents: jest.fn().mockResolvedValue({
        status: 201,
        data: { commit: { message: "test-commit" } },
      }),
    },
  });

  return {
    Octokit: jest.fn().mockImplementation(createMockClient),
  };
});

// ---------------------------------------------------------------------------
// React Testing Library Defaults
// ---------------------------------------------------------------------------

/**
 * Configure RTL defaults:
 * - Cleanup is automatic in RTL v14+ via jest-environment-jsdom.
 * Add any custom matchers / helpers here if needed.
 */

// ---------------------------------------------------------------------------
// Context / Hook Testing Utilities (re-export pattern)
// ---------------------------------------------------------------------------

/**
 * Utility for composing providers in tests.
 * Usage in tests:
 *
 * import { renderWithProviders } from "@/test-utils/renderWithProviders";
 *
 * const { getByText } = renderWithProviders(<MyComponent />);
 */

// Placeholder helper that tests can import; actual implementation lives in
// a dedicated test utils module to keep this file focused on globals.