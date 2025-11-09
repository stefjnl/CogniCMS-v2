/**
 * Shared Jest mocks for Next.js API route testing.
 *
 * Responsibilities:
 * - Provide a lightweight NextResponse.json implementation compatible with tests.
 * - Provide a stable mock for injectContentIntoHTML to avoid pulling in cheerio ESM.
 * - This file is imported at the top of each API test file.
 */

import type { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// NextResponse.json mock
// ---------------------------------------------------------------------------

function createJsonResponse(body: unknown, init?: { status?: number }): NextResponse {
  const status = init?.status ?? 200;

  const responseLike = {
    status,
    async json() {
      return body;
    },
  };

  return responseLike as unknown as NextResponse;
}

jest.mock("next/server", () => {
  // We do not rely on the real NextResponse.json in Jest; provide a focused mock.
  return {
    NextResponse: {
      json: createJsonResponse,
    },
  };
});

// ---------------------------------------------------------------------------
// injector mock
// ---------------------------------------------------------------------------

/**
 * For API tests we only need deterministic behavior from injectContentIntoHTML.
 * Expose it as a jest.fn() so individual tests can override via mockImplementation.
 */
const injectContentIntoHTMLMock = jest.fn(
  (html: string, content: unknown) =>
    `${html}<!-- mocked-injector:${JSON.stringify(!!content)} -->`
);

jest.mock("@/lib/content/injector", () => ({
  injectContentIntoHTML: injectContentIntoHTMLMock,
}));

// Re-export for tests that want direct access to the mock function.
export { injectContentIntoHTMLMock };