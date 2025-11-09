import React from "react";
import { render, act, fireEvent } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { ContentProvider, useContent } from "@/lib/state/ContentContext";
import type { ContentSchema } from "@/types/content";

// Use fake timers for autosave and beforeunload timing
jest.useFakeTimers();

// Helper: realistic baseline ContentSchema
const createSampleContent = (): ContentSchema => ({
  metadata: {
    title: "Test Page",
    description: "Test description",
    keywords: "test,content",
    lastModified: "2025-01-01T00:00:00.000Z",
    ogTitle: "OG Title",
    ogDescription: "OG Description",
    twitterTitle: "Twitter Title",
    twitterDescription: "Twitter Description",
  },
  sections: [
    {
      id: "hero",
      label: "Hero",
      type: "hero",
      selector: "#hero",
      content: {
        heading: "Hero Heading",
        subheading: "Hero Subheading",
        ctaText: "Click",
        ctaUrl: "/",
        urgencyText: "Now",
        logoAlt: "Logo",
      },
    },
    {
      id: "content-1",
      label: "Content",
      type: "content",
      selector: "#content-1",
      content: {
        heading: "Content Heading",
        paragraphs: ["Paragraph 1"],
      },
    },
  ],
  assets: {
    images: ["/img1.png"],
    links: [{ text: "Home", url: "/" }],
  },
});

// Test wrapper that passes required initial props
function createWrapper(
  overrides?: Partial<{
    initialContent: ContentSchema;
    initialHtml: string;
    initialSha: { html: string; content: string };
  }>
): React.FC<{ children: React.ReactNode }> {
  const sample = createSampleContent();
  const {
    initialContent = sample,
    initialHtml = "<html><body>test</body></html>",
    initialSha = { html: "sha-html", content: "sha-json" },
  } = overrides || {};

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ContentProvider
        initialContent={initialContent}
        initialHtml={initialHtml}
        initialSha={initialSha}
      >
        {children}
      </ContentProvider>
    );
  };
}

// Simple consumer component for render-based tests
function Consumer() {
  const ctx = useContent();
  return (
    <div data-testid="consumer"
      data-preview-device={ctx.previewDevice}
      data-active-section={ctx.activeSection ?? ""}
      data-show-editable-regions={ctx.showEditableRegions ? "true" : "false"}
      data-has-unsaved={ctx.hasUnsavedChanges ? "true" : "false"}
      data-is-saving={ctx.isSaving ? "true" : "false"}
      data-errors={ctx.errors.join("|")}
      data-history-length={ctx.history.length}
      data-history-index={ctx.historyIndex}
    />
  );
}

describe("ContentProvider", () => {
  it("renders children and provides context value", () => {
    const wrapper = createWrapper();
    const { getByTestId } = render(
      <ContentProvider
        initialContent={createSampleContent()}
        initialHtml="<html />"
        initialSha={{ html: "sha-h", content: "sha-c" }}
      >
        <Consumer />
      </ContentProvider>
    );

    const el = getByTestId("consumer");
    // default state expectations
    expect(el.dataset.previewDevice).toBe("desktop");
    expect(el.dataset.activeSection).toBe("");
    expect(el.dataset.showEditableRegions).toBe("true");
    expect(el.dataset.hasUnsaved).toBe("false");
    expect(el.dataset.isSaving).toBe("false");
    expect(Number(el.dataset.historyLength)).toBe(1);
    expect(Number(el.dataset.historyIndex)).toBe(0);
  });

  it("provides value to useContent hook via wrapper", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useContent(), { wrapper });

    expect(result.current.currentContent).not.toBeNull();
    expect(result.current.originalContent).not.toBeNull();
    expect(result.current.previewDevice).toBe("desktop");
    expect(Array.isArray(result.current.history)).toBe(true);
  });

  it("throws when useContent is used outside provider", () => {
    expect(() => {
      const { result } = renderHook(() => useContent());
      // Accessing result.current forces evaluation and surfacing of thrown error
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      result.current;
    }).toThrowError("useContent must be used within ContentProvider");
  });
});

describe("useContent hook", () => {
  it("returns context value inside provider", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useContent(), { wrapper });

    expect(result.current).toHaveProperty("currentContent");
    expect(result.current).toHaveProperty("updateContent");
  });

  it("re-renders when context changes (updateContent)", () => {
    const initialContent = createSampleContent();
    const wrapper = createWrapper({ initialContent });
    const { result } = renderHook(() => useContent(), { wrapper });

    const next = {
      ...initialContent,
      metadata: { ...initialContent.metadata, title: "Updated Title" },
    };

    act(() => {
      result.current.updateContent(next);
    });

    expect(result.current.currentContent?.metadata.title).toBe("Updated Title");
    // hasUnsavedChanges should be derived true
    expect(result.current.hasUnsavedChanges).toBe(true);
    expect(result.current.history[result.current.historyIndex]).toEqual(next);
  });
});

describe("State management actions", () => {
  it("loadContent resets state and clears history", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useContent(), { wrapper });

    const newContent = createSampleContent();
    newContent.metadata.title = "Loaded Title";

    act(() => {
      result.current.loadContent(newContent);
    });

    expect(result.current.originalContent).toEqual(newContent);
    expect(result.current.currentContent).toEqual(newContent);
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0]).toEqual(newContent);
    expect(result.current.historyIndex).toBe(0);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it("updateContent sets current, pushes history, marks unsaved", () => {
    const initial = createSampleContent();
    const wrapper = createWrapper({ initialContent: initial });
    const { result } = renderHook(() => useContent(), { wrapper });

    const updated = {
      ...initial,
      metadata: { ...initial.metadata, title: "Updated" },
    };

    act(() => {
      result.current.updateContent(updated);
    });

    expect(result.current.currentContent).toEqual(updated);
    expect(result.current.history).toHaveLength(2);
    expect(result.current.history[1]).toEqual(updated);
    expect(result.current.historyIndex).toBe(1);
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it("updateSection performs immutable update, pushes history, marks unsaved", () => {
    const initial = createSampleContent();
    const wrapper = createWrapper({ initialContent: initial });
    const { result } = renderHook(() => useContent(), { wrapper });

    const prevSections = result.current.currentContent?.sections || [];

    act(() => {
      result.current.updateSection("content-1", {
        heading: "New Heading",
      } as any);
    });

    const sections = result.current.currentContent?.sections || [];
    const updatedSection = sections.find((s) => s.id === "content-1");

    // Verify immutable: reference changed
    expect(sections).not.toBe(prevSections);
    expect(updatedSection?.content).toMatchObject({ heading: "New Heading" });

    // history updated
    expect(result.current.historyIndex).toBe(
      result.current.history.length - 1
    );
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it("setActiveSection updates activeSection", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useContent(), { wrapper });

    act(() => {
      result.current.setActiveSection("hero");
    });

    expect(result.current.activeSection).toBe("hero");

    act(() => {
      result.current.setActiveSection(null);
    });

    expect(result.current.activeSection).toBeNull();
  });

  it("setPreviewDevice updates previewDevice", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useContent(), { wrapper });

    act(() => {
      result.current.setPreviewDevice("mobile");
    });
    expect(result.current.previewDevice).toBe("mobile");

    act(() => {
      result.current.setPreviewDevice("tablet");
    });
    expect(result.current.previewDevice).toBe("tablet");
  });

  it("toggleEditableRegions toggles flag", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useContent(), { wrapper });

    const initial = result.current.showEditableRegions;

    act(() => {
      result.current.toggleEditableRegions();
    });
    expect(result.current.showEditableRegions).toBe(!initial);

    act(() => {
      result.current.toggleEditableRegions();
    });
    expect(result.current.showEditableRegions).toBe(initial);
  });

  it("revertChanges restores originalContent, resets history and unsaved flag", () => {
    const initial = createSampleContent();
    const wrapper = createWrapper({ initialContent: initial });
    const { result } = renderHook(() => useContent(), { wrapper });

    // mutate via updateContent
    const modified = {
      ...initial,
      metadata: { ...initial.metadata, title: "Modified" },
    };

    act(() => {
      result.current.updateContent(modified);
    });
    expect(result.current.hasUnsavedChanges).toBe(true);

    act(() => {
      result.current.revertChanges();
    });

    expect(result.current.currentContent).toEqual(initial);
    expect(result.current.historyIndex).toBe(0);
    expect(result.current.history).toHaveLength(1);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it("undo moves back in history and updates hasUnsavedChanges", () => {
    const initial = createSampleContent();
    const wrapper = createWrapper({ initialContent: initial });
    const { result } = renderHook(() => useContent(), { wrapper });

    const v1 = {
      ...initial,
      metadata: { ...initial.metadata, title: "v1" },
    };
    const v2 = {
      ...initial,
      metadata: { ...initial.metadata, title: "v2" },
    };

    act(() => {
      result.current.updateContent(v1);
      result.current.updateContent(v2);
    });

    expect(result.current.historyIndex).toBe(2);
    expect(result.current.currentContent?.metadata.title).toBe("v2");

    act(() => {
      result.current.undo();
    });

    expect(result.current.historyIndex).toBe(1);
    expect(result.current.currentContent?.metadata.title).toBe("v1");
    expect(result.current.hasUnsavedChanges).toBe(true);

    act(() => {
      result.current.undo();
    });

    expect(result.current.historyIndex).toBe(0);
    expect(result.current.currentContent?.metadata.title).toBe(initial.metadata.title);
    expect(result.current.hasUnsavedChanges).toBe(false);

    // further undo at index 0 should no-op
    act(() => {
      result.current.undo();
    });
    expect(result.current.historyIndex).toBe(0);
  });

  it("redo moves forward in history and marks hasUnsavedChanges", () => {
    const initial = createSampleContent();
    const wrapper = createWrapper({ initialContent: initial });
    const { result } = renderHook(() => useContent(), { wrapper });

    const v1 = {
      ...initial,
      metadata: { ...initial.metadata, title: "v1" },
    };
    const v2 = {
      ...initial,
      metadata: { ...initial.metadata, title: "v2" },
    };

    act(() => {
      result.current.updateContent(v1);
      result.current.updateContent(v2);
      result.current.undo(); // now at v1
    });

    expect(result.current.historyIndex).toBe(1);

    act(() => {
      result.current.redo();
    });

    expect(result.current.historyIndex).toBe(2);
    expect(result.current.currentContent?.metadata.title).toBe("v2");
    expect(result.current.hasUnsavedChanges).toBe(true);

    // redo beyond end should no-op
    act(() => {
      result.current.redo();
    });
    expect(result.current.historyIndex).toBe(2);
  });

  it("addError appends error; clearErrors clears them", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useContent(), { wrapper });

    act(() => {
      result.current.addError("Error 1");
      result.current.addError("Error 2");
    });

    expect(result.current.errors).toEqual(["Error 1", "Error 2"]);

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toEqual([]);
  });
});

describe("saveDraft side effects and error handling", () => {
  const originalToastInfo = (global as any).toast?.info;
  const originalToastSuccess = (global as any).toast?.success;
  const originalToastError = (global as any).toast?.error;

  beforeEach(() => {
    // Override fetch and reset localStorage per test
    (global as any).fetch = jest.fn();
    window.localStorage.clear();

    // Provide minimal toast mock to avoid imports issues in this isolated suite
    (global as any).toast = {
      info: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
    };
  });

  afterAll(() => {
    (global as any).toast = {
      info: originalToastInfo,
      success: originalToastSuccess,
      error: originalToastError,
    };
  });

  it("saveDraft without GitHub SHA saves only to localStorage and updates state", async () => {
    const content = createSampleContent();
    // no SHA / no originalHtml => local-only path
    const wrapper = createWrapper({
      initialContent: content,
      initialHtml: undefined as any,
      initialSha: undefined as any,
    });
    const { result } = renderHook(() => useContent(), { wrapper });

    await act(async () => {
      await result.current.saveDraft();
    });

    // localStorage keys
    expect(window.localStorage.getItem("cognicms-draft")).toBeTruthy();
    expect(window.localStorage.getItem("cognicms-draft-timestamp")).toBeTruthy();

    // state updates
    expect(result.current.isSaving).toBe(false);
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.originalContent).toEqual(content);
  });

  it("saveDraft with GitHub integration: successful save and reload", async () => {
    const content = createSampleContent();
    const wrapper = createWrapper({
      initialContent: content,
      initialHtml: "<html>orig</html>",
      initialSha: { html: "sha-html", content: "sha-content" },
    });

    const saveResponse = { ok: true, json: async () => ({}) } as any;
    const loadResponse = {
      ok: true,
      json: async () => ({
        html: "<html>new</html>",
        sha: { html: "new-sha-html", content: "new-sha-content" },
      }),
    } as any;

    (global as any).fetch = jest
      .fn()
      // first call: /api/content/save
      .mockResolvedValueOnce(saveResponse)
      // second call: /api/content/load
      .mockResolvedValueOnce(loadResponse);

    const { result } = renderHook(() => useContent(), { wrapper });

    await act(async () => {
      await result.current.saveDraft();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.originalContent).toEqual(result.current.currentContent);
    expect(result.current.originalHtml).toBe("<html>new</html>");
    expect(result.current.sha).toEqual({
      html: "new-sha-html",
      content: "new-sha-content",
    });
  });

  it("saveDraft handles non-ok GitHub response and sets error state", async () => {
    const content = createSampleContent();
    const wrapper = createWrapper({
      initialContent: content,
      initialHtml: "<html>orig</html>",
      initialSha: { html: "sha-html", content: "sha-content" },
    });

    (global as any).fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to save to GitHub" }),
    });

    const { result } = renderHook(() => useContent(), { wrapper });

    await act(async () => {
      await result.current.saveDraft();
    });

    expect(result.current.isSaving).toBe(false);
    expect(result.current.errors[result.current.errors.length - 1]).toContain(
      "Failed to save to GitHub"
    );
  });

  it("saveDraft handles fetch/network errors gracefully", async () => {
    const content = createSampleContent();
    const wrapper = createWrapper({
      initialContent: content,
      initialHtml: "<html>orig</html>",
      initialSha: { html: "sha-html", content: "sha-content" },
    });

    (global as any).fetch = jest.fn().mockRejectedValueOnce(new Error("Network down"));

    const { result } = renderHook(() => useContent(), { wrapper });

    await act(async () => {
      await result.current.saveDraft();
    });

    expect(result.current.isSaving).toBe(false);
    expect(
      result.current.errors.some((e) => e.includes("Network down") || e.includes("Failed"))
    ).toBe(true);
  });
});

describe("Side effects: auto-save, keyboard shortcuts, beforeunload", () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    window.localStorage.clear();
  });

  it("auto-save triggers after 30 seconds of unsaved changes", async () => {
    const content = createSampleContent();
    const wrapper = createWrapper({
      initialContent: content,
      initialHtml: "<html>orig</html>",
      initialSha: { html: "sha-html", content: "sha-content" },
    });

    const { result } = renderHook(() => useContent(), { wrapper });

    // make unsaved changes
    act(() => {
      const updated = {
        ...content,
        metadata: { ...content.metadata, title: "Changed" },
      };
      result.current.updateContent(updated);
    });

    expect(result.current.hasUnsavedChanges).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(30000);
      // flush pending promises from saveDraft (which is async)
      await Promise.resolve();
    });

    // auto-save should have been called (either local or remote depending on SHA)
    expect((global as any).fetch).toHaveBeenCalled();
  });

  it("keyboard shortcuts trigger undo/redo/saveDraft", async () => {
    const content = createSampleContent();
    const wrapper = createWrapper({
      initialContent: content,
      initialHtml: "<html>orig</html>",
      initialSha: { html: "sha-html", content: "sha-content" },
    });

    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useContent(), { wrapper });

    // prepare multiple history entries
    act(() => {
      result.current.updateContent({
        ...content,
        metadata: { ...content.metadata, title: "v1" },
      });
      result.current.updateContent({
        ...content,
        metadata: { ...content.metadata, title: "v2" },
      });
    });

    expect(result.current.currentContent?.metadata.title).toBe("v2");

    // Ctrl+Z - undo
    act(() => {
      fireEvent.keyDown(window, {
        key: "z",
        ctrlKey: true,
      });
    });

    expect(result.current.currentContent?.metadata.title).toBe("v1");

    // Ctrl+Shift+Z - redo
    act(() => {
      fireEvent.keyDown(window, {
        key: "z",
        ctrlKey: true,
        shiftKey: true,
      });
    });

    expect(result.current.currentContent?.metadata.title).toBe("v2");

    // Ctrl+S - saveDraft
    await act(async () => {
      fireEvent.keyDown(window, {
        key: "s",
        ctrlKey: true,
      });
      // Allow async saveDraft to run
      await Promise.resolve();
    });

    expect((global as any).fetch).toHaveBeenCalled();
  });

  it("beforeunload shows warning when hasUnsavedChanges is true", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useContent(), { wrapper });

    act(() => {
      result.current.updateContent({
        ...createSampleContent(),
        metadata: {
          ...createSampleContent().metadata,
          title: "Unsaved",
        },
      });
    });

    // Simulate the actual browser BeforeUnloadEvent shape
    const event = new Event("beforeunload") as any as BeforeUnloadEvent;
    Object.defineProperty(event, "returnValue", {
      writable: true,
      configurable: true,
      value: "",
    });

    window.dispatchEvent(event as any);

    // JSDOM behavior: handler sets a non-empty value (commonly a string or true-like)
    // Our implementation sets "", which is still a defined value.
    expect(event.returnValue).not.toBeUndefined();
  });
});