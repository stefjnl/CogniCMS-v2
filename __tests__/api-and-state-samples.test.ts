/**
 * Sample tests to demonstrate API route, utility, and state management testing setup.
 *
 * These are intentionally lightweight and focus on:
 * - Importing Next.js API route handlers from app/api
 * - Mocking @octokit/rest via global jest.setup.js mock
 * - Testing pure utils from lib/utils
 * - Testing React Context from lib/state/ContentContext
 */

import React from "react";
import { renderHook, act } from "@testing-library/react";
import { cn } from "@/lib/utils";
import { POST as AuthPost } from "@/app/api/auth/route";
import { GET as LoadGet } from "@/app/api/content/load/route";
import { ContentProvider, useContent } from "@/lib/state/ContentContext";

// ---------------------------------------------------------------------------
// Utility function test (lib/utils.ts)
// ---------------------------------------------------------------------------

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("a", "b")).toBe("a b");
    expect(cn("a", false && "b", null, undefined, "c")).toBe("a c");
  });
});

// ---------------------------------------------------------------------------
// API route tests (app/api/*/route.ts)
// ---------------------------------------------------------------------------

describe("API Routes", () => {
  it("auth route rejects invalid password", async () => {
    const body = JSON.stringify({ password: "wrong" });
    const req = {
      json: async () => JSON.parse(body),
    } as any;

    const res = await AuthPost(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toHaveProperty("error");
  });

  it("content load route responds (GitHub mocked)", async () => {
    // Route GET in app/api/content/load/route.ts expects no args in Next 13+ convention.
    const res = await (LoadGet as any)();
    const json = await res.json();

    expect(res.status).toBeLessThan(500);
    expect(json).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// State management / Context tests (lib/state/ContentContext.tsx)
// ---------------------------------------------------------------------------

describe("ContentContext", () => {
  it("provides default context and allows updates", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ContentProvider, null, children);

    const { result } = renderHook(() => useContent(), { wrapper });

    // Basic shape assertions to confirm provider wiring.
    // Adapt to the actual shape from ContentContext.tsx.
    expect(result.current).toHaveProperty("state");
    expect(result.current).toHaveProperty("setState");

    act(() => {
      (result.current as any).setState((prev: any) => ({
        ...prev,
        testFlag: true,
      }));
    });

    expect((result.current as any).state.testFlag).toBe(true);
  });
});