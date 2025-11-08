---
applyTo: "components/cms/**/*.tsx"
---

# CMS Component Instructions

## Component Architecture

These are the main UI components that form the CMS interface. When adding or modifying:

### CMSLayout.tsx

- Top-level container managing split panes (40% editor, 60% preview)
- Use react-resizable-panels for draggable divider
- Handle responsive layout: stack vertically on mobile (< 768px)
- Pass ContentContext down to children
- Manage layout state (pane widths) via URL query params if needed

### ContentEditor.tsx

- Left pane: renders EditorForm for the currently active section
- Gets active section from ContentContext
- Updates currentContent in context as user types
- Show unsaved indicator (orange dot) when hasUnsavedChanges = true
- Use React.memo() to prevent unnecessary re-renders

### EditorForm.tsx

- Dynamically renders form fields based on content schema
- Maps field types to input components:
  - string → Input component
  - string (long) → Textarea component
  - string (rich) → RichTextEditor component
  - array → Multiple input/textarea with add/remove buttons
- Validate required fields before allowing save
- Pass onChange handler up to ContentEditor
- Use ShadCN Label components for accessibility

### RichTextEditor.tsx

- TipTap editor instance for formatted text
- Configure with: bold, italic, link, heading levels
- Preserve content between renders
- Handle paste events (strip unwanted formatting)
- Output as HTML string to content JSON

### SectionNavigator.tsx

- Left sidebar accordion showing all sections from ContentContext
- Sections mapping: `context.currentContent.sections`
- Click section to set it as active in context
- Visual indicator: highlight active section with background color
- Show orange dot if section has unsaved changes (compare with originalContent)
- Use ShadCN Accordion component
- Sort sections by order in content.json (don't reorder)

### PreviewPane.tsx

- Right pane: iframe showing live HTML with injected content
- Updates on every currentContent change (debounced 300ms)
- Use injector.ts to merge currentContent into HTML
- Add visual overlay on editable regions (green border on hover)
- Implement device size toggles: Mobile (375px), Tablet (768px), Desktop (1024px)
- Handle iframe sandbox security

### ActionBar.tsx

- Sticky top bar with buttons:
  - "Save Draft" (secondary): Save to localStorage
  - "Publish" (primary): Save to server (phase 2)
  - "Revert Changes" (destructive): Discard to originalContent
  - Changes counter badge: "3 unsaved changes"
- Show loading spinner during save (isSaving = true)
- Disable buttons appropriately
- Show success/error toast via Sonner

## State Management Rules

- Never mutate state directly
- Always dispatch updates through ContentContext setters
- Use immutable patterns:

  ```typescript
  // ✓ Good
  const updated = { ...content, heading: newHeading };

  // ✓ Good for arrays
  const newParagraphs = [...section.content.paragraphs];
  newParagraphs[index] = newText;
  ```

## Styling Rules

- Use Tailwind CSS utility classes (never inline styles)
- ShadCN Button variants: primary, secondary, destructive, outline, ghost
- Consistent spacing: p-2, p-4, m-2, m-4, gap-2, gap-4
- Warm color palette: #f5f1e8 (bg-beige), #4a3f35 (text-brown), #c89b5f (accent-ochre)
- Focus states: `focus:outline-none focus:ring-2 ring-offset-2 ring-[#c89b5f]`
- Hover states: `hover:bg-opacity-80 transition-colors duration-200`
- Disabled states: `disabled:opacity-50 disabled:cursor-not-allowed`

## Component Props Pattern

```typescript
interface ComponentProps {
  // Required props first
  section: Section;

  // Optional props second
  showDetails?: boolean;

  // Event handlers last
  onChange?: (value: any) => void;
  onSave?: () => void;
}
```

## Performance Tips

- Use React.memo() for presentational components
- useMemo() for expensive computations (HTML parsing)
- useCallback() for event handlers passed to children
- Avoid re-renders: don't create new objects/functions in render
- Profile with React DevTools before optimizing

## Accessibility Requirements

- All inputs must have associated `<label>` elements
- Use semantic HTML (button, form, etc.)
- Keyboard navigation: Tab through form, Enter/Space to submit
- ARIA labels for screen readers
- Focus visible indicators on all interactive elements
- Color contrast: text must meet WCAG AA standards

## Testing Checklist

Before committing component changes:

- [ ] TypeScript compiles without errors
- [ ] ESLint passes (no warnings)
- [ ] Component renders without console errors
- [ ] State updates reflect in UI correctly
- [ ] No memory leaks (check DevTools Performance)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
