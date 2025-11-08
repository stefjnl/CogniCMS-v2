---
applyTo: "lib/content/**/*.ts,types/content.ts"
---

# Content Processing Pipeline Instructions

## Core Functions

These files handle the critical content extraction and injection logic. When modifying:

### extractor.ts
- Extracts content from HTML using CSS selector mappings
- Must maintain immutability of input HTML
- Return type must match ContentSchema interface exactly
- Test with sample HTML in `public/sample/index.html`
- Handle missing elements gracefully (return null or empty string, not errors)

### injector.ts
- Injects modified content back into HTML while preserving structure
- Never add extra wrapper divs or classes
- Update text nodes only, preserve all attributes
- Handle arrays properly (multiple paragraphs, multiple links)
- Preserve existing styling and event handlers

### mappings.ts
- Maps JSON paths to CSS selectors
- Use valid CSS selector syntax (test in browser inspector)
- Document each selector with the content it targets
- Run through validator before committing
- Keep selectors simple and specific (avoid overly broad selectors)

### validator.ts
- Validates that selectors exist in HTML
- Checks for ambiguous selectors (should find exactly one element)
- Provides helpful error messages for broken mappings
- Used by extractor before processing
- Call validateSelectors(html, mappings) before extraction

### parser.ts
- Utility functions for HTML parsing
- Use cheerio for consistency
- Handle malformed HTML gracefully
- Cache parsed DOM for performance

### Selector Testing Workflow

1. Open browser DevTools on `http://localhost:3000`
2. Go to Preview pane and inspect the HTML
3. Try selector in console: `document.querySelector('your-selector')`
4. Should return exactly one element
5. Add to mappings.ts with clear comments

### Type Safety Rules

- All functions must have explicit parameter and return types
- ContentSchema interface is the single source of truth
- No `any` types - use `unknown` if absolutely necessary and cast properly
- All object properties must be documented in interface

### Common Patterns

```typescript
// ✓ Good: Extract with fallback
const text = element?.textContent?.trim() ?? '';

// ✓ Good: Create new objects (immutable)
const updated = { ...original, field: newValue };

// ✗ Bad: Direct mutation
content.sections[0].heading = newValue;

// ✓ Good: Handle missing selectors
const element = doc.querySelector(selector);
if (!element) return null; // or empty value

// ✗ Bad: Throw on missing selector
if (!element) throw new Error('Selector not found');
```

## Testing Content Pipeline

When making changes to content processing:

1. Load sample data: `node lib/content/extractor.ts`
2. Verify extraction: Check console output matches content.json structure
3. Inject changes: Run through injector and verify HTML structure
4. Round-trip test: Extract → Modify → Inject → Extract (should match)
5. Check selector validation: `validateSelectors()` should pass all checks

## Performance Notes

- Extraction/injection happens on every content change
- Debounce preview updates to 300ms minimum
- Use useMemo() in React components that process HTML
- Cache parsed DOM where possible
- Minimize DOM queries in loops
