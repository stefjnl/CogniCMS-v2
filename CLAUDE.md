# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CogniCMS is a Content Management System for editing static HTML websites. It uses a selector-based approach to map content.json fields to HTML elements via CSS selectors, enabling bidirectional sync between structured JSON data and rendered HTML.

**Target Use Case**: Edit the Zincafé Zweeloo static website (philosophy café) through an intuitive split-screen interface.

## Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Architecture

### Core Concept: Selector-Based Content Mapping

The system works by maintaining a **bidirectional mapping** between:
- `content.json` (single source of truth) ↔ `index.html` (presentation)

Content is extracted from HTML using CSS selectors defined in `lib/content/mappings.ts`:

```typescript
// Example mapping
{ path: "sections[hero].content.heading", selector: "header h1", type: "text" }
```

### Data Flow

1. **Load**: `content.json` → React Context state
2. **Edit**: User modifies content via forms → State updates
3. **Preview**: State → HTML injection via Cheerio → iframe display
4. **Persist**: State → localStorage (auto-save every 30s)

### Key Components Architecture

**State Management (`lib/state/ContentContext.tsx`)**
- React Context API manages all CMS state
- Maintains undo/redo history stack
- Handles auto-save, change detection, keyboard shortcuts
- Deep comparison between original/current content

**Content Processing (`lib/content/`)**
- `parser.ts`: Cheerio-based HTML parsing utilities
- `extractor.ts`: Extract content from HTML using selectors
- `injector.ts`: Inject ContentSchema back into HTML template
- `mappings.ts`: CSS selector mappings for all content fields
- `validator.ts`: Validate selectors exist in HTML

**UI Components (`components/cms/`)**
- `CMSLayout.tsx`: Resizable split-pane layout (react-resizable-panels)
- `ContentEditor.tsx`: Left pane container
- `SectionNavigator.tsx`: Accordion-based section list
- `EditorForm.tsx`: Dynamic forms for 10+ section types
- `PreviewPane.tsx`: iframe preview with device toggles
- `ActionBar.tsx`: Top bar with Save/Publish/Revert

### TypeScript Types (`types/content.ts`)

All content structures are strictly typed:
- `ContentSchema`: Root content structure
- `Section`: Generic section with type-specific content
- `HeroContent`, `EventsContent`, `FAQContent`, etc.: Section-specific types
- `AppState`: Complete CMS state
- `SelectorMapping`: Mapping configuration

## Important Implementation Details

### Adding New Section Types

1. Add interface to `types/content.ts` (e.g., `GalleryContent`)
2. Add section type to `Section["type"]` union
3. Create mapping in `lib/content/mappings.ts`
4. Add injection logic in `lib/content/injector.ts`
5. Create form component in `EditorForm.tsx`

### HTML Injection Strategy

**Preserve HTML structure** - Only update text/attributes, never modify tags:
```typescript
// DO: setTextContent($, "header h1", content.heading)
// DON'T: Replace entire <header> element
```

### State Updates

Always use the Context API methods, never mutate state directly:
```typescript
// Correct
updateSection(sectionId, { heading: "New Title" })

// Incorrect - will break undo/redo
currentContent.sections[0].content.heading = "New Title"
```

### Sample Files Location

- `public/sample/index.html`: Zincafé website HTML template
- `public/sample/content.json`: Extracted structured content

These are loaded at runtime - the HTML is parsed and content is injected dynamically.

## Keyboard Shortcuts

- `Cmd/Ctrl + Z`: Undo
- `Cmd/Ctrl + Shift + Z`: Redo
- `Cmd/Ctrl + S`: Save draft

## localStorage Keys

- `cognicms-draft`: Saved content (ContentSchema JSON)
- `cognicms-draft-timestamp`: Last save timestamp

## Known Limitations

- No GitHub integration yet (Phase 2)
- Image uploads not implemented
- Single user only (no collaboration)
- Preview uses iframe sandbox - some JS may not run

## Future Enhancements (Not Yet Implemented)

Per `prompt.md`, planned features include:
- GitHub push/pull integration
- Multi-user collaboration
- Image asset management
- Click-to-edit in preview pane
- Visual indicators for editable regions in preview
