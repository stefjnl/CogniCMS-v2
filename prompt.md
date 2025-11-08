I need you to build a Content Management System (CMS) for editing static HTML websites. I'm starting with a fresh Next.js 16 application and need you to implement this step-by-step.

## Project Context

I have a static website (index.html: example-html\index.html) for "Zincafé Zweeloo" - a philosophy café. The site has structured content stored in content.json and rendered in index.html. I need a modern CMS to edit this content easily and push changes back to GitHub.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Node.js
- Tailwind CSS 4.1
- ShadCN UI components
- TypeScript (strongly preferred)

## Core Requirements

### 1. Application Architecture

Build a split-screen CMS interface:

- **Left pane (40%)**: Content editor with section navigation
- **Right pane (60%)**: Live preview of the HTML page
- Responsive design: stack vertically on mobile

### 2. Content Management Strategy

**CRITICAL**: Use a selector-based content mapping approach:

1. Parse the index.html file
2. Extract content using CSS selectors mapped to content.json structure
3. Create a bidirectional sync: JSON ↔ HTML
4. Use content.json as the single source of truth

**Content Schema Structure** (from attached content.json):

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
  id: string;
  label: string;
  type: "hero" | "contact" | string;
  content: {
    heading?: string;
    paragraphs?: string[];
    links?: Link[];
  };
  selector: string; // CSS selector for this section in HTML
}
```

### 3. Content Extraction & Mapping

Create a mapping configuration that connects content.json fields to HTML elements:

```typescript
const contentMappings = {
  "metadata.title": "title",
  "metadata.description": 'meta[name="description"]',
  "sections[0].content.heading": "section.intro h2",
  "sections[0].content.paragraphs[0]": "section.intro p:nth-of-type(1)",
  // ... etc
};
```

**Requirements:**

- Parse HTML and extract content based on selectors
- Handle arrays (multiple events, FAQ items)
- Preserve HTML structure and styling
- Validate selector paths work before rendering editor

### 4. User Interface Components

**Left Pane - Content Editor:**

1. **Section Navigator** (collapsible accordion)

   - Use ShadCN Accordion component
   - List all sections from content.json
   - Show unsaved changes indicator (orange dot)
   - Highlight currently active section

2. **Content Editor Forms** (context-sensitive)

   - Text inputs for headings (ShadCN Input)
   - Textarea for paragraphs (ShadCN Textarea)
   - Rich text editor for formatted content (consider TipTap or similar)
   - Date picker for event dates (ShadCN Calendar/DatePicker)
   - Link editor with URL validation
   - Image uploader with preview

3. **Action Bar** (sticky top)
   - "Save Draft" button (ShadCN Button - secondary)
   - "Publish" button (ShadCN Button - primary)
   - "Revert Changes" button (ShadCN Button - destructive)
   - Changes counter badge
   - Auto-save status indicator

**Right Pane - Preview:**

1. **Preview Controls Bar** (sticky top)

   - Device size toggles: Mobile / Tablet / Desktop (ShadCN Toggle Group)
   - Refresh preview button
   - "Highlight Editable Regions" toggle
   - Scroll sync toggle

2. **Live Preview Frame**
   - Use iframe or sandboxed rendering
   - Inject updated HTML in real-time
   - Add visual indicators for editable regions (green outline on hover)
   - Click-to-edit functionality (clicking preview focuses editor on that section)
   - Handle responsive breakpoints

### 5. State Management

Implement state management for:

```typescript
interface AppState {
  // Content
  originalContent: ContentSchema;
  currentContent: ContentSchema;
  hasUnsavedChanges: boolean;

  // UI
  activeSection: string | null;
  previewDevice: "mobile" | "tablet" | "desktop";
  showEditableRegions: boolean;

  // Sync
  isSaving: boolean;
  lastSaved: Date | null;
  errors: string[];
}
```

Use React Context API or Zustand (simpler). Implement:

- Undo/redo functionality (maintain history stack)
- Auto-save to localStorage every 30 seconds
- Change detection (deep comparison of original vs current)

### 6. HTML Processing

Create utilities for:

**Content Extraction:**

```typescript
function extractContentFromHTML(
  html: string,
  mappings: ContentMappings
): ContentSchema {
  // Parse HTML using cheerio or jsdom
  // Apply selectors to extract content
  // Build ContentSchema object
  // Return structured data
}
```

**HTML Generation:**

```typescript
function injectContentIntoHTML(
  html: string,
  content: ContentSchema,
  mappings: ContentMappings
): string {
  // Parse HTML
  // For each content field, find matching selector
  // Replace content while preserving HTML structure
  // Return updated HTML string
}
```

**Validation:**

```typescript
function validateSelectors(
  html: string,
  mappings: ContentMappings
): ValidationResult {
  // Check all selectors find matching elements
  // Report missing or ambiguous selectors
  // Suggest fixes for broken selectors
}
```

### 7. Visual Design Requirements

**Design System:**

- Color scheme: Warm, professional (adapt from the Zincafé colors: beige #f5f1e8, brown #4a3f35, ochre #c89b5f)
- Modern, clean interface with generous whitespace
- Consistent 8px spacing grid
- Smooth transitions and hover states
- Loading skeletons for async operations

**Component Styling:**

- Use ShadCN default theme as base
- Customize with Tailwind CSS 4.1
- Consistent border radius (md: 6px)
- Subtle shadows for depth
- Status indicators (success: green, warning: amber, error: red)

**Specific UI Elements:**

- Section cards with hover effects
- Form inputs with focus states and validation feedback
- Toast notifications for actions (ShadCN Toast/Sonner)
- Loading states with spinners/skeletons
- Empty states with helpful messages

### 8. Core Features - Phase 1 (Build This First)

**Priority 1:**

1. App layout with split panes (resizable splitter using react-resizable-panels or similar)
2. Load hardcoded index.html and content.json (from public folder or embedded)
3. Parse and extract content using selector mappings
4. Display section navigator in left pane
5. Render basic text inputs for editing headings and paragraphs
6. Live preview in right pane showing HTML with injected changes
7. Visual indicators for edited content (green outline, "Modified" badge)

**Priority 2:** 8. Validation for required fields 9. Change detection and unsaved changes warning 10. Save draft to localStorage 11. Undo/redo functionality (Cmd/Ctrl+Z)

**Priority 3:** 12. Device preview toggles 13. Responsive editor layout 14. Accessibility (keyboard navigation, ARIA labels)

### 9. File Structure

Organize the project as:
src/
├── app/
│ ├── page.tsx # Main CMS interface
│ ├── layout.tsx # Root layout
│ └── globals.css # Global styles
├── components/
│ ├── cms/
│ │ ├── CMSLayout.tsx # Split pane layout
│ │ ├── ContentEditor.tsx # Left pane
│ │ ├── PreviewPane.tsx # Right pane
│ │ ├── SectionNavigator.tsx # Section list
│ │ ├── EditorForm.tsx # Form fields
│ │ └── ActionBar.tsx # Save/publish controls
│ └── ui/ # ShadCN components
├── lib/
│ ├── content/
│ │ ├── parser.ts # HTML parsing
│ │ ├── extractor.ts # Content extraction
│ │ ├── injector.ts # HTML generation
│ │ └── mappings.ts # Selector mappings
│ ├── state/
│ │ └── contentStore.ts # State management
│ └── utils.ts # Utilities
├── types/
│ └── content.ts # TypeScript interfaces
└── public/
├── sample/
│ ├── index.html # Sample website
│ └── content.json # Sample content
└── assets/ # Images, etc.

### 10. Implementation Steps

**Step 1: Project Setup**

- Initialize Next.js 16 app with TypeScript
- Install dependencies: ShadCN, Tailwind CSS 4.1, cheerio (HTML parsing), react-resizable-panels
- Configure Tailwind with custom theme
- Set up ShadCN components (Button, Input, Textarea, Accordion, etc.)

**Step 2: Data Layer**

- Create TypeScript interfaces for ContentSchema
- Build content mapping configuration
- Implement HTML parser with cheerio
- Create content extraction function
- Test extraction with sample HTML

**Step 3: UI Layout**

- Build CMSLayout with resizable split panes
- Create basic ActionBar with mock buttons
- Implement responsive layout (stack on mobile)
- Add loading states

**Step 4: Content Editor**

- Build SectionNavigator with accordion
- Create EditorForm with dynamic field rendering
- Implement form validation
- Add change indicators
- Connect to state management

**Step 5: Preview Pane**

- Implement iframe-based preview
- Add preview controls (device toggles)
- Inject content changes in real-time
- Add editable region highlighting
- Implement click-to-edit

**Step 6: State & Persistence**

- Set up state management (Context/Zustand)
- Implement change detection
- Add undo/redo stack
- Auto-save to localStorage
- Add unsaved changes warning

**Step 7: Polish**

- Add animations and transitions
- Improve error handling
- Add toast notifications
- Test accessibility
- Optimize performance

### 11. Sample Content Files

I'll provide you with:

- `index.html` - The complete static website
- `content.json` - Structured content data

These are attached to this conversation. Use them as the basis for building the content mappings.

### 12. Key Technical Considerations

**HTML Parsing:**

- Use cheerio for server-side parsing (in API routes if needed)
- Use DOMParser for client-side parsing
- Handle malformed HTML gracefully

**Content Injection:**

- Preserve existing HTML structure
- Update text content without changing tags/classes
- Maintain event handlers and scripts

**Performance:**

- Debounce preview updates (300ms)
- Virtualize long lists (if many sections)
- Lazy load heavy components
- Memoize expensive computations

**Error Handling:**

- Validate HTML structure before parsing
- Handle missing selectors gracefully
- Show user-friendly error messages
- Provide recovery suggestions

### 13. Design Patterns to Follow

- **Component composition**: Small, focused components
- **Separation of concerns**: Logic separate from UI
- **Immutable state**: Never mutate state directly
- **Type safety**: Strict TypeScript, avoid `any`
- **Error boundaries**: Catch and handle React errors
- **Accessibility**: WCAG 2.1 AA compliance

### 14. Expected User Flows

**Primary flow:**

1. App loads with sample content
2. User browses sections in navigator
3. User clicks a section to edit
4. Editor shows relevant fields
5. User types changes
6. Preview updates in real-time with visual feedback
7. User sees unsaved changes indicator
8. User clicks "Save Draft"
9. Changes saved to localStorage
10. Success toast notification

**Edge cases to handle:**

- No content.json file
- Invalid HTML structure
- Broken selector mappings
- Browser back button with unsaved changes
- Network errors (future GitHub integration)

### 15. Deliverables

Please build:

1. Fully functional CMS interface matching the requirements above
2. Clean, well-documented code with TypeScript
3. Responsive design (mobile, tablet, desktop)
4. Sample content loaded and editable
5. Real-time preview with change indicators
6. State persistence to localStorage
7. Basic validation and error handling

**Visual quality expectations:**

- Modern, professional appearance
- Smooth animations (200-300ms transitions)
- Consistent spacing and typography
- Intuitive UX (minimal learning curve)
- Polished details (hover states, focus rings, etc.)

### 16. Important Notes

- Focus on Phase 1 core features first (no GitHub integration yet)
- Use sample data from provided files
- Prioritize functionality over complex features
- Keep code modular and maintainable
- Add helpful comments for complex logic
- Use meaningful variable names

**Styling preferences:**

- Tailwind utility classes over custom CSS
- ShadCN components over custom builds
- Consistent color palette (warm, professional)
- Generous whitespace
- Clear visual hierarchy

### 17. Testing Checklist

Before considering it complete, verify:

- [ ] All sections from content.json appear in navigator
- [ ] Clicking a section loads its content in editor
- [ ] Editing text updates preview in real-time
- [ ] Changes are highlighted visually (green outline)
- [ ] Save Draft persists to localStorage
- [ ] Unsaved changes indicator works
- [ ] Page reload restores draft from localStorage
- [ ] Undo/redo works correctly
- [ ] Responsive layout works on mobile
- [ ] No console errors
- [ ] Smooth performance (no lag on typing)

## Files to Reference

I'm attaching:

1. `index.html` - Full static website HTML
2. `content.json` - Structured content data
3. `Overview` - Project context document

Please analyze these files first to understand the content structure, then build the selector mappings accordingly.

## Getting Started

1. First, show me the project structure you'll create
2. Then, build the content mapping configuration based on the HTML structure
3. Next, implement the core parsing and extraction logic
4. Finally, build the UI components layer by layer

Start with: "I'll build this CMS in phases. First, let me analyze the HTML structure to create the content mappings..."
