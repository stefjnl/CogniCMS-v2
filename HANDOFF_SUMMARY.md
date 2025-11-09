document.querySelector('header') // Should find hero
document.querySelector('.next-event-banner') // Should find banner
document.querySelector('.intro') // Should find intro section

# CogniCMS v2 – Work Log & Current Status

**Date:** November 8, 2025  
**Focus:** Achieve byte‑for‑byte parity between injected preview HTML and the upstream `index.html` from `stefjnl/zincafe-zweeloo`.

---

## Overall Goal

Ensure the CMS preview pipeline reads `contents/content.json`, injects values into the Zincafé template without altering layout or metadata, and emits HTML that matches the canonical GitHub version exactly. Once parity is guaranteed, the preview pane stays layout-stable and any saved HTML can be committed back to the site repo with confidence.

---

## Approach & Philosophy

- Treat the GitHub copy of `index.html` as the source of truth.
- Round-trip the remote HTML and JSON through the injector and diff the output against the original (see `scripts/roundtrip-check.ts`).
- Iterate on the injector so that it only mutates nodes when content actually changes, avoids clobbering existing attributes/metadata, and never introduces highlight scaffolding unless a section truly differs.
- Keep server (`lib/content/injector.ts`) and client (`lib/content/injector.client.ts`) behaviour aligned to prevent preview/save mismatches.

---

## Work Completed So Far

1. **Diagnostics tooling**

   - Extended `scripts/roundtrip-check.ts` to pull fresh HTML/JSON from GitHub, compare lengths, highlight the first diff, count highlight markers, and print snippets/selector summaries for any divergence.

2. **Metadata safety net**

   - Updated both injectors to respect existing OpenGraph/Twitter meta when overrides are absent, preventing accidental title/description degradation.

3. **Highlight management**

   - Added server-side helpers to only append the highlight `<style>` block when elements actually receive the `cognicms-changed` class, and to strip the block when no highlights remain.

4. **Section-specific tightening**

   - Hero, banner, team, events, info, FAQ, contact, and footer handlers now favour idempotent updates: cloning templates without highlight residue, preserving emoji prefixes where already present on existing nodes, and avoiding unnecessary structural churn.

5. **Whitespace/format helpers**

   - Introduced `collapseWhitespace` plus selector-aware helpers to reduce false positives caused by spacing differences, especially inside the practical-info directions block.

6. **Safety checks**
   - Repeated `npx tsc --noEmit` after each adjustment to ensure the TypeScript build stays green.

---

## Steps Attempted This Session

1. Pulled fresh GitHub HTML/JSON and ran the round-trip script — confirmed the injected output diverged (extra highlight style block and class noise).
2. Focused on `events`, `info`, and `contact` handlers which were emitting unnecessary diffs:
   - Preserved leading emoji symbols when an existing date already contains them.
   - Normalised the practical directions text without rewriting the surrounding markup when unchanged.
   - Tightened contact button selection logic so non-anchor buttons (e.g., the clipboard action) remain untouched.
3. Re-ran the round-trip script after each change; narrowed remaining differences down to the contact section and highlight style injection.
4. Removed the blanket mailto normalisation that was stripping query parameters (`?subject=` etc.), since that alone forced diffs every time.
5. Verified TypeScript still compiles after backing out experiment-only code paths.

---

## Current Issue (Work in Progress)

- The server injector still adds `data-cognicms-highlight` styling because at least one element (currently the contact section) accumulates `cognicms-changed`. That in turn causes a `<style>` block to be appended during serialization, which is the first mismatch detected by the round-trip script.
- `scripts/roundtrip-check.ts` now reports: `Injected HTML matches original: false`, `Original highlight count: 2`, `Injected highlight count: 5`. The contact section ends up highlighted even when no real content change occurs, so parity has not yet been achieved.

---

## Desired End Result

1. **Perfect parity:** `injectContentIntoHTML(originalHtml, originalContent)` returns a byte-identical string (after newline normalisation) to `originalHtml`.
2. **Preview fidelity:** the iframe renders the exact layout from GitHub when nothing changes, and only shows highlights for actual edits.
3. **Safe publishing:** when users edit fields, only the intentional nodes change — no collateral alterations to metadata, structural wrappers, or anchor query parameters.

---

## Next Steps (Not yet completed)

1. Investigate why the contact buttons still register as changed despite preserving text/links — likely due to subtle whitespace or attribute ordering differences.
2. Ensure the highlight removal logic runs after section injections so the style tag disappears when `cognicms-changed` is absent.
3. Once parity holds locally, re-run `scripts/roundtrip-check.ts` and document the green result; then validate the preview pane in the running app.
4. Only after parity is proven, resume work on publishing/deployment tasks (Render.com pipeline, GitHub commits).

---

## Reference Commands

```powershell
# Compare injected vs original HTML
npx tsx scripts/roundtrip-check.ts

# Type-check
npx tsc --noEmit

# Start dev server
npm run dev
```

---

## Key Files Touched

- `lib/content/injector.ts` – refined metadata handling, highlight management, idempotent section updates.
- `lib/content/injector.client.ts` – kept in sync with server logic for live preview parity.
- `scripts/roundtrip-check.ts` – expanded diagnostics for parity debugging.

No deployment/authentication code paths were modified during this pass. All work stayed focused on injection parity and supporting instrumentation.

---

**Summary:** We are mid-way through a parity hardening effort. Tooling now exposes exactly where the injector deviates, several noisy diffs have been eliminated, but the highlight/style artefact tied to the contact section remains unresolved. The target outcome is a diff-free round-trip so the preview pane mirrors GitHub output when untouched.
