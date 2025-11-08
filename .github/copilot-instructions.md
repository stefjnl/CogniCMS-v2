# CogniCMS v2 Repository Custom Instructions

## Project Overview

CogniCMS v2 is a modern Content Management System built with Next.js 16 for editing static HTML websites. The application provides a split-screen interface for editing website content alongside a live preview. It's designed specifically for managing the Zincafé Zweeloo philosophy café website.

**Key Purpose**: Enable non-technical users to edit structured HTML content through a visual interface without needing to touch code.

## Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript (strictly enforced - avoid any `any` types)
- **Styling**: Tailwind CSS 4.1 with ShadCN UI components
- **HTML Parsing**: Cheerio (server-side) and DOMParser (client-side)
- **Rich Text Editor**: TipTap
- **State Management**: React Context API
- **Notifications**: Sonner toast library
- **Resizable Layouts**: react-resizable-panels

## Repository Structure

```
root/
├── .github/
│   ├── copilot-instructions.md (this file)
│   └── workflows/              # CI/CD pipelines
├── app/                        # Next.js app directory
│   ├── page.tsx               # Main CMS interface entry point
│   ├── layout.tsx             # Root layout wrapper
│   └── globals.css            # Global tailwind styles
├── components/
│   ├── cms/                   # Core CMS components
│   │   ├── CMSLayout.tsx      # Split pane container (40% editor, 60% preview)
│   │   ├── ContentEditor.tsx  # Left pane content editor
│   │   ├── PreviewPane.tsx    # Right pane live preview iframe
│   │   ├── SectionNavigator.tsx # Accordion for section selection
│   │   ├── EditorForm.tsx     # Dynamic form field rendering
│   │   ├── RichTextEditor.tsx # TipTap rich text editor instance
│   │   └── ActionBar.tsx      # Save, Publish, Revert buttons
│   └── ui/                    # ShadCN UI components
│       ├── accordion.tsx
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── textarea.tsx
│       ├── toggle-group.tsx
│       └── toggle.tsx
├── lib/
│   ├── content/               # Content extraction & injection logic
│   │   ├── parser.ts          # HTML parsing utilities
│   │   ├── extractor.ts       # Extract content from HTML using selectors
│   │   ├── injector.ts        # Inject modified content back into HTML
│   │   ├── mappings.ts        # CSS selector to content.json field mappings
│   │   └── validator.ts       # Validate selectors and HTML structure
│   ├── state/
│   │   └── ContentContext.tsx # React Context for app state management
│   └── utils.ts               # General utility functions
├── types/
│   └── content.ts             # TypeScript interfaces for content schema
├── public/
│   └── sample/
│       ├── index.html         # Sample static website
│       └── content.json       # Content data structure
├── components.json            # ShadCN configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS config
├── postcss.config.mjs         # PostCSS config
├── eslint.config.mjs          # ESLint rules
├── next.config.ts             # Next.js configuration
└── README.md

```

## Key Architectural Patterns

### 1. Content Extraction & Injection Flow

- **ContentSchema** (TypeScript interface in `types/content.ts`): Single source of truth for content structure
- **ContentMappings** (in `lib/content/mappings.ts`): Maps JSON fields to HTML CSS selectors (e.g., `"sections[0].content.heading"` → `"section.hero h2"`)
- **Extractor** (`lib/content/extractor.ts`): Parses HTML and extracts content using selector mappings
- **Injector** (`lib/content/injector.ts`): Takes modified content and injects it back into HTML while preserving structure
- **Validator** (`lib/content/validator.ts`): Ensures selectors are valid and find matching elements

### 2. State Management (React Context)

The `ContentContext.tsx` manages:

- `originalContent`: Unmodified content from file (immutable)
- `currentContent`: Working copy being edited
- `hasUnsavedChanges`: Boolean flag for dirty state
- `activeSection`: Currently selected section ID
- `previewDevice`: Responsive preview breakpoint (mobile/tablet/desktop)
- `isSaving`: Async operation flag
- `errors`: Array of validation/runtime errors
- Change history for undo/redo

**Critical**: Never mutate state directly. Always use immutable updates (spread operator, Array.from(), etc.).

### 3. Component Composition

- **CMSLayout**: Container component managing split panes and responsive layout
- **ContentEditor**: Controlled by active section context, renders EditorForm for that section
- **EditorForm**: Maps over content fields and renders appropriate input components (text, textarea, rich editor, date picker)
- **SectionNavigator**: Accordion listing all sections with visual indicators (unsaved dot, active highlight)
- **PreviewPane**: iframe rendering live HTML with injected content updates
- **ActionBar**: Sticky controls for save/publish/undo operations

## Important Design Decisions

1. **CSS Selectors**: Used as the mapping mechanism (not JSON paths) because they directly connect to the HTML structure
2. **Immutable State**: Prevents bugs and enables undo/redo functionality
3. **Type Safety**: Strict TypeScript - all variables must have explicit types (no `any`)
4. **Debounced Preview**: Preview updates debounced to 300ms to prevent excessive re-renders
5. **localStorage Persistence**: Drafts auto-saved every 30 seconds to localStorage under key `cognicms_draft`
6. **Responsive Layout**: Stack vertically on mobile (< 768px), split horizontally on larger screens

## Build & Development Commands

```bash
# Install dependencies (always run first)
npm install

# Development server with hot reload
npm run dev
# Opens at http://localhost:3000

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# TypeScript type checking
npx tsc --noEmit
```

**Important**: Always run `npm install` before building if any dependencies have changed. The project uses strict TypeScript checking, so all type errors must be resolved before committing.

## Content Schema Structure

Reference `types/content.ts` for the complete TypeScript interface. Key structure:

```typescript
interface ContentSchema {
  metadata: {
    title: string;
    description: string;
    lastModified: string;
  };
  sections: Section[];
  assets: {
    images: string[];
    links: Link[];
  };
}

interface Section {
  id: string; // Unique section identifier
  label: string; // Display name in UI
  type: string; // "hero" | "contact" | etc.
  content: {
    heading?: string;
    paragraphs?: string[];
    links?: Link[];
  };
  selector: string; // CSS selector pointing to this section in HTML
}
```

## Content Mapping Reference

The `mappings.ts` file contains selector mappings. For example:

```typescript
const contentMappings = {
  "metadata.title": "title",
  "metadata.description": 'meta[name="description"]',
  "sections[0].content.heading": "section.hero h2",
  "sections[0].content.paragraphs[0]": "section.hero p:nth-of-type(1)",
};
```

When adding new content sections:

1. Add the section to `content.json`
2. Add corresponding CSS selectors to `mappings.ts`
3. Run validator to ensure selectors find elements: `validateSelectors(html, mappings)`
4. Test extraction: verify extracted content matches HTML

## Common Development Tasks

### Adding a new editable section

1. Update `content.json` with new section structure
2. Add selectors to `lib/content/mappings.ts`
3. Update `SectionNavigator.tsx` to include new section if needed
4. Component automatically renders in editor thanks to dynamic form generation

### Modifying content fields

1. Update the TypeScript interface in `types/content.ts`
2. Update `mappings.ts` with new selector mappings
3. Update validator to handle new field types
4. EditorForm automatically adapts to new fields

### Debugging content extraction

1. Use browser DevTools console to inspect parsed content
2. Check `validateSelectors()` output for broken selector paths
3. Verify CSS selectors in inspector match mapping configuration
4. Log extracted content in `extractor.ts` to debug parsing

### Testing preview injection

1. Make content change in editor
2. Check that preview updates within 300ms (debounce delay)
3. Verify HTML structure preserved (no extra tags added)
4. Confirm styling unchanged

## UI Component Best Practices

- **Always use ShadCN components**: Don't create custom components for standard inputs/buttons
- **Color scheme**: Warm tones (#f5f1e8 beige, #4a3f35 brown, #c89b5f ochre) as defined in the sample site
- **Spacing**: Use Tailwind's 8px grid (`p-2`, `m-4`, etc.)
- **Focus states**: Add `focus:outline-none focus:ring-2 ring-offset-2 ring-[#c89b5f]` for accessibility
- **Loading states**: Show spinners for async operations, disable inputs during save
- **Transitions**: Use `transition-colors duration-200` for hover effects

## Error Handling

- **Missing selectors**: Display user-friendly error suggesting HTML structure check
- **Malformed content**: Show validation errors with recovery suggestions
- **Network errors**: Use Sonner toast for error notifications
- **Type mismatches**: Catch at compile time with TypeScript (no runtime type checking needed)

## Performance Considerations

- **Debounce preview updates**: 300ms delay to prevent excessive iframe re-renders
- **Memoize expensive computations**: Use `useMemo()` for HTML parsing operations
- **Virtualize long lists**: If sections exceed 100, implement windowing in SectionNavigator
- **Lazy load components**: Code-split heavy components if needed
- **Avoid re-renders**: Use `React.memo()` for pure presentational components

## Validation & Testing Checklist

Before submitting changes, verify:

- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] ESLint passes: `npm run lint` (fix auto-fixable issues first)
- [ ] All new types have explicit TypeScript annotations
- [ ] Content extraction roundtrips correctly (extract → modify → inject → extract matches)
- [ ] UI is responsive on mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- [ ] No console errors in browser DevTools
- [ ] Form validation prevents invalid data entry
- [ ] Unsaved changes indicator works correctly
- [ ] localStorage persistence tested after page reload
- [ ] Undo/redo functionality works for content changes

## Deployment Notes

- Build artifacts generated to `.next/`
- Environment variables loaded from `.env` files (not committed)
- Static assets in `public/` folder served directly
- No server-side API routes required for Phase 1 (all processing client-side)
- Ready for Vercel deployment without additional configuration

## When You Get Stuck

1. **Check TypeScript errors first**: `npx tsc --noEmit` catches most issues
2. **Verify CSS selectors**: Use browser inspector to confirm selector syntax matches HTML
3. **Trace state flow**: Add `console.log()` statements to ContentContext to verify state changes
4. **Test extraction separately**: Create minimal test case in `extractor.ts` for debugging
5. **Review the prompt.md file**: Contains complete project context and requirements

## File References for Context

- **prompt.md**: Complete project requirements and implementation phases
- **README.md**: Getting started guide and general project info
- **types/content.ts**: All TypeScript interfaces
- **lib/content/mappings.ts**: Content-to-selector configuration
- **components.json**: ShadCN component configuration

Trust these instructions. Only perform additional searches if this information is found to be incomplete or in error.
