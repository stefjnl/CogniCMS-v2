# CogniCMS v2 - Testing Strategy and Practices

This document defines the testing philosophy, structure, tooling, and workflows for CogniCMS v2. It is the single source of truth for how we validate correctness, stability, and maintainability.

It complements the implementation docs (README, QUICK_START) and must remain aligned with the actual Jest configuration and test suites.

---

## 1. Testing Philosophy

CogniCMS is a content management UI backed by Next.js API routes and GitHub integration. Our testing strategy is:

- Risk-driven: Critical paths (auth, content loading/saving, preview, state persistence) get the strongest coverage.
- Lean and focused: Tests are specific, deterministic, and fast.
- Close to real usage: Integration and workflow tests reflect how editors actually use the CMS.
- Maintainable: Tests should be easy to read, adjust, and run locally and in CI.
- Enforced quality: High coverage thresholds and consistent patterns prevent regressions.

Key principles:

- Prefer small, focused tests that assert behavior, not implementation details.
- Test externally observable behavior (DOM, responses, side effects) over private internals.
- Use mocks strategically to isolate units, but use integration tests to validate real wiring.
- Treat failing tests as production defects.

---

## 2. Tooling Overview

CogniCMS uses:

- Next.js 16, React 19, TypeScript 5
- Jest 29 with `ts-jest`
- `jest-environment-jsdom` for React/component tests
- `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` for UI and interaction tests

Core configuration:

- [`jest.config.js`](jest.config.js:1) defines:
  - `testEnvironment: "jsdom"`
  - `setupFilesAfterEnv: ["<rootDir>/jest.setup.js"]`
  - `transform` via `ts-jest`
  - `moduleNameMapper` for:
    - `@/` to `<rootDir>/`
    - CSS and asset mocks
    - `react-resizable-panels` mock
  - `testMatch: ["<rootDir>/__tests__/**/*.(spec|test).(ts|tsx)"]`
  - Coverage collection from `app`, `components`, `lib` with 90% global thresholds

---

## 3. Test Types and Strategy

We use a multi-layer testing approach mapped to the codebase structure.

### 3.1 Unit Tests

Scope:

- Pure functions and small units without I/O:
  - `lib/content/*.ts` (e.g. parsing, extraction, validation)
  - Utility helpers

Goals:

- Validate all branches and edge cases.
- No external network, no filesystem, no real GitHub calls.

Guidelines:

- Each function’s behavior is covered with:
  - Happy path
  - Invalid inputs
  - Boundary conditions

Examples:

- File path: `__tests__/lib/*.test.ts`
- Tests:
  - `extractor.test.ts`
  - `injector.test.ts`
  - `parser.test.ts`
  - `validator.test.ts`

### 3.2 Component Tests (React)

Scope:

- Visual and interactive units:
  - `components/ui/*`
  - `components/cms/*`

Goals:

- Verify rendering, interaction, and accessibility-oriented behavior:
  - Required props
  - Calls to event handlers
  - Disabled states
  - Focus and keyboard handling where relevant

Guidelines:

- Use `@testing-library/react` and `@testing-library/user-event`.
- Assert on DOM and text, not internal implementation details.
- Minimal mocking: only for external modules or browser APIs not in jsdom.

Examples:

- File path: `__tests__/components/**/*.test.tsx`
- Representative components:
  - `ActionBar`, `CMSLayout`, `ContentEditor`, `PreviewPane`, `RichTextEditor`
  - `button`, `input`, `textarea`, `accordion`, etc.

### 3.3 API Route Tests

Scope:

- Next.js route handlers in `app/api/**/route.ts`:
  - `/api/auth`
  - `/api/content/load`
  - `/api/content/save`
  - `/api/preview`

Goals:

- Validate:
  - Correct HTTP status codes
  - Request validation and error handling
  - Auth checks and secret handling
  - Response shape used by the frontend
  - Integration with GitHub client abstraction (mocked)

Guidelines:

- Test route handlers as functions:
  - Import from the route file.
  - Use mocked `Request`, environment variables, and GitHub client.
- No real network or GitHub API calls.
- Assert failure modes:
  - Missing/invalid secrets
  - Unauthorized access
  - Unexpected exceptions mapped to safe error responses

Examples:

- File path: `__tests__/api/*.test.ts`
- Includes both success and failure scenarios for each route.

### 3.4 Integration / Workflow Tests

Scope:

- Cross-layer flows:
  - Login and auth token handling
  - Content load → edit → preview → save
  - Error propagation from backend to UI
  - State persistence across navigation or reload-like flows

Goals:

- Validate end-to-end behavior from the perspective of the UI:
  - Routes are called with correct payloads.
  - Local state and context behave correctly.
  - User-visible feedback (toasts, errors, loading indicators) is correct.

Guidelines:

- Implemented as React integration tests using jsdom, mocking network/route layers:
  - Use `@testing-library/react` with realistic component trees.
  - Mock fetch or route handlers to return deterministic responses.
- Focus on:
  - Happy-path workflows
  - Unauthorized/expired scenarios
  - Network and validation failures

Examples:

- Directory: `__tests__/integration/`
- Files:
  - `auth-flow.test.tsx`
  - `content-workflow.test.tsx`
  - `preview-workflow.test.tsx`
  - `state-persistence.test.tsx`
  - `error-handling.test.tsx`

### 3.5 State Management Tests

Scope:

- Contexts and hooks under `lib/state/`, especially `ContentContext`.

Goals:

- Verify:
  - Initial state
  - Actions (load, update, reset, save indicators)
  - Side effects: localStorage usage, dirty-state handling

Guidelines:

- Use dedicated tests:
  - Render test harness components that consume context.
  - Trigger updates and assert resulting state and DOM.
- Mock browser APIs (e.g., `localStorage`) where necessary.

Examples:

- Directory: `__tests__/state/`
- File: `ContentContext.test.tsx`

---

## 4. Test Organization and Directory Structure

All tests live under `__tests__/` to keep a clean separation.

Structure:

- `__tests__/api/`
  - API route tests (e.g., `auth.test.ts`, `content-load.test.ts`, `content-save.test.ts`, `preview.test.ts`)
- `__tests__/lib/`
  - Unit tests for utilities and core logic
- `__tests__/components/`
  - Component tests
  - `__tests__/components/ui/` for UI primitives
  - `__tests__/components/cms/` for CMS-specific components
- `__tests__/state/`
  - Context and hook tests
- `__tests__/integration/`
  - Cross-cutting end-to-end-style workflow tests
- `__mocks__/`
  - Shared Jest mocks (CSS/asset mocks, `react-resizable-panels`, etc.)

Naming conventions:

- Files end with `.test.ts` or `.test.tsx`.
- Co-locate tests in the matching category directory:
  - API route → `__tests__/api`
  - CMS UI component → `__tests__/components/cms`
  - State/context → `__tests__/state`
  - Cross-flow behavior → `__tests__/integration`

---

## 5. Running Tests

All commands are defined in [`package.json`](package.json:9).

From the project root:

- Run all tests (single run):
  - `npm test`
  - Alias for: `jest --config jest.config.js --passWithNoTests`
- Watch mode (during development):
  - `npm run test:watch`
  - Uses Jest watch mode for fast feedback.
- Coverage run:
  - `npm run test:coverage`
  - Generates text, HTML, and lcov reports in `coverage/`.

Targeted runs:

- Single test file:
  - `npx jest __tests__/api/auth.test.ts`
- By pattern:
  - `npx jest auth`
  - `npx jest components/cms/ContentEditor.test.tsx`

Notes:

- Jest uses `jsdom` by default for compatibility with component tests.
- All transforms and module mappings are preconfigured in `jest.config.js`; no additional flags required.

---

## 6. Coverage Standards

Coverage is enforced centrally via Jest configuration.

Global thresholds (see [`jest.config.js`](jest.config.js:56)):

- Branches: 90%
- Functions: 90%
- Lines: 90%
- Statements: 90%

Coverage collection:

- Included:
  - `app/**/*.{ts,tsx}`
  - `components/**/*.{ts,tsx}`
  - `lib/**/*.{ts,tsx}`
- Excluded:
  - Type declarations (`**/*.d.ts`)
  - Types directory (`**/types/**`)
  - Build output (`**/.next/**`)
  - Node modules

Expectations:

- Core flows (auth, content load/save, preview, ContentContext) should meet or exceed thresholds.
- New features:
  - Must include tests sufficient to keep global coverage at or above thresholds.
- If coverage drops:
  - Treat as a failing build (locally and in CI).
  - Add or adjust tests rather than weakening thresholds.

Coverage analysis:

- After `npm run test:coverage`:
  - Inspect:
    - Terminal summary for quick signal.
    - `coverage/lcov-report/index.html` in a browser for detailed visualization.
- Focus on:
  - Uncovered branches in error handling.
  - Complex conditionals.
  - High-risk modules (auth, GitHub integration, state persistence).

---

## 7. Mocking Strategy and Patterns

Mocking is essential but must be deliberate.

General rules:

- Mock only what is:
  - Non-deterministic (time, random, network).
  - External (GitHub API, environment-dependent behavior).
  - Incompatible with Jest/jsdom (e.g., certain browser APIs, ESM-only libraries).

Patterns:

1. Module mapping:
   - Configured in [`jest.config.js`](jest.config.js:34):
     - CSS and asset imports → `__mocks__/styleMock.js`, `__mocks__/fileMock.js`
     - `react-resizable-panels` → `__mocks__/react-resizable-panels.js`

2. API and network:
   - For API route tests:
     - Mock GitHub client or wrapper functions.
     - Mock environment variables per test to control secrets.
   - For integration tests:
     - Use `global.fetch = jest.fn()` or similar to stub API responses.

3. Browser APIs:
   - Mock `localStorage`, `sessionStorage`, `matchMedia`, or timers if necessary.
   - Prefer using Jest fake timers for debounced or delayed behavior.

4. React components:
   - Avoid mocking core CMS components; test real behavior.
   - Mock only when:
     - Isolating a unit from a heavy child component, or
     - Working around environment limitations.

Anti-patterns to avoid:

- Over-mocking that hides regressions.
- Asserting mocks instead of user-visible output when testing UI.
- Hardcoding implementation details in tests that make refactoring difficult.

---

## 8. Best Practices

### 8.1 Naming Conventions

- Test file names:
  - `<Unit>.test.ts` or `<Unit>.test.tsx`
- Test blocks:
  - `describe("ComponentName", ...)`
  - `it("does something meaningful", ...)` or `test("does something meaningful", ...)`
- Names should describe behavior, not implementation:
  - Good: `it("shows an error when password is invalid")`
  - Bad: `it("calls handleSubmit once")` (unless truly the behavior under test)

### 8.2 Error Handling and Edge Cases

For each critical function or endpoint:

- Include tests for:
  - Missing/invalid input
  - Unauthorized access
  - Upstream failures (e.g., GitHub error)
  - Timeouts or unexpected exceptions mapped to safe responses

Ensure:

- Errors are logged (where applicable) and surfaced via user-friendly messages.
- Sensitive information is never asserted in responses or logs.

### 8.3 Performance Considerations

- Keep Jest tests fast:
  - Avoid real network and slow timers.
  - Use Jest fake timers for debounced updates (e.g., preview updates).
  - Avoid unnecessarily rendering full app trees if a smaller scope suffices.
- Integration tests should still be efficient and parallelizable.

---

## 9. Development Workflow and TDD Guidance

### 9.1 Recommended Local Workflow

For day-to-day development:

1. Start watch mode:
   - `npm run test:watch`
2. Implement or update feature.
3. Add/adjust tests in the appropriate directory:
   - Unit → `__tests__/lib`
   - Component → `__tests__/components`
   - State → `__tests__/state`
   - API → `__tests__/api`
   - Workflow → `__tests__/integration`
4. Ensure:
   - Jest tests pass
   - `npm run lint` passes
   - `npm run build` passes (no TS errors, no warnings treated as acceptable)

Before opening a PR:

- Run:
  - `npm test`
  - `npm run test:coverage`
  - `npm run lint`
  - `npm run build`

### 9.2 Test-Driven Development (TDD) Suggestions

When practical:

- Write or update tests alongside the change:
  - Define expected behavior.
  - Run tests (they should fail).
  - Implement minimal code to pass.
  - Refactor while keeping tests green.

Focus TDD on:

- Critical domain logic (content parsing, validation).
- New API endpoints.
- Complex UI behavior (e.g., autosave, previews, navigation).

### 9.3 Pre-Commit and CI Expectations

Pre-commit (recommended):

- Configure your local workflow (or Git hooks) to run at minimum:
  - `npm test` (or a targeted subset for large changes)
  - `npm run lint`
- Do not commit with failing tests or ESLint/TypeScript errors.

CI (recommended configuration):

- Install dependencies:
  - `npm ci`
- Run static checks:
  - `npm run lint`
  - `npm run build`
- Run tests:
  - `npm run test`
  - `npm run test:coverage`
- Enforce:
  - Coverage thresholds (via `coverageThreshold` in `jest.config.js`)
  - No warnings treated as ignorable; warnings should be fixed.

The pipeline should fail when:

- Any test fails.
- Coverage drops below thresholds.
- TypeScript compilation or ESLint fails.

---

## 10. Existing Pre-Deployment and Production Checklist (Legacy)

A detailed deployment validation checklist (manual verification steps, monitoring, rollback) exists in this file from the previous iteration of documentation. It remains valid as operational guidance, but the automated testing strategy above is the canonical reference for how to structure and run Jest tests for CogniCMS v2.

Use the automated suite to cover:
- Build integrity
- Auth flows
- Content load/save
- Preview behavior
- Error scenarios

Then use the manual checklist sections as a final verification layer for staging/production deployments.

---

## 11. Adding New Tests

When adding new functionality:

1. Identify the layer(s):
   - Utility logic → unit tests in `__tests__/lib`
   - New component → component tests in `__tests__/components/...`
   - New route → API tests in `__tests__/api`
   - Complex flow → integration test in `__tests__/integration`
2. Follow naming and structure conventions from this document.
3. Ensure:
   - Tests are deterministic and isolated.
   - All critical paths and edge cases are covered.
   - Global coverage thresholds remain satisfied.

Any new code merged into `main` must adhere to these testing standards and not weaken coverage, reliability, or clarity.