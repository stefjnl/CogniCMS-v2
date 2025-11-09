import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";
import { ContentProvider, useContent } from "@/lib/state/ContentContext";
import { CMSLayout } from "@/components/cms/CMSLayout";
import { SectionNavigator } from "@/components/cms/SectionNavigator";
import { EditorForm } from "@/components/cms/EditorForm";
import { PreviewPane } from "@/components/cms/PreviewPane";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

/**
 * Helper content schema with two sections to drive integration flows.
 */
const sampleContent = {
  sections: [
    {
      id: "hero",
      title: "Hero",
      content: {
        heading: "Hero Heading",
        body: "Hero Body",
      },
    },
    {
      id: "features",
      title: "Features",
      content: {
        heading: "Features Heading",
        body: "Features Body",
      },
    },
  ],
};

const sampleHtml =
  '<html><body><div data-section="hero">Hero</div></body></html>';
const sampleSha = { html: "html-sha", content: "content-sha" };

/**
 * Test wrapper for CMSLayout composed with ContentProvider, mirroring real app/page.tsx usage.
 */
function CMSWithProvider() {
  return (
    <ContentProvider
      initialContent={sampleContent as any}
      initialHtml={sampleHtml}
      initialSha={sampleSha}
    >
      <CMSLayout />
    </ContentProvider>
  );
}

/**
 * Convenience to access context inside tests for assertions.
 */
function ContextInspector() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ctx = useContent();
  return (
    <div
      data-testid="context-state"
      data-active-section={ctx.activeSection || ""}
      data-has-unsaved={ctx.hasUnsavedChanges ? "true" : "false"}
      data-preview-device={ctx.previewDevice}
      data-show-editable={ctx.showEditableRegions ? "true" : "false"}
    />
  );
}

describe("Content Editing and Saving Workflow Integration", () => {
  const originalError = console.error;
  const mockFetch = jest.fn();

  beforeAll(() => {
    // Silence potential React act warnings if any appear due to timers.
    console.error = (...args: unknown[]) => {
      const msg = String(args[0] || "");
      if (msg.includes("act(")) {
        return;
      }
      // eslint-disable-next-line no-console
      originalError.apply(console, args as any);
    };
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    window.localStorage.clear();
    (global.fetch as any) = mockFetch;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("performs complete content workflow: auth -> load -> edit -> preview -> save", async () => {
    // Arrange: authenticated user for Home.
    window.localStorage.setItem("cms-auth", "true");

    // First call: /api/content/load on Home mount.
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: sampleContent,
        html: sampleHtml,
        sha: sampleSha,
      }),
    });

    render(
      <>
        <Home />
        <ContextInspector />
      </>
    );

    // Assert load call and that loading resolves into CMS view.
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/content/load");
    });

    // At this point ContentProvider/CMSLayout are rendered.
    const contextNode = await screen.findByTestId("context-state");
    expect(contextNode.getAttribute("data-has-unsaved")).toBe("false");

    // Now exercise integrated CMSLayout pieces at a slightly lower level:
    // Section selection - form edits - preview interactions - save.

    render(
      <ContentProvider
        initialContent={sampleContent as any}
        initialHtml={sampleHtml}
        initialSha={sampleSha}
      >
        <SectionNavigator />
        <EditorForm />
        <PreviewPane />
        <ContextInspector />
      </ContentProvider>
    );

    const user = userEvent.setup({ delay: null });

    // SectionNavigator should render sections and first one become active by default via CMS logic.
    expect(screen.getByText("Hero")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();

    // Select second section and ensure EditorForm updates accordingly.
    await user.click(screen.getByText("Features"));

    // EditorForm should now show the selected section content.
    expect(
      screen.getByDisplayValue("Features Heading")
    ).toBeInTheDocument();

    // Edit the heading field and assert ContentContext hasUnsavedChanges.
    const headingInput = screen.getByDisplayValue("Features Heading");
    await user.clear(headingInput);
    await user.type(headingInput, "Updated Features Heading");

    const stateNodeAfterEdit = screen.getByTestId("context-state");
    expect(stateNodeAfterEdit.getAttribute("data-has-unsaved")).toBe("true");

    // PreviewPane: verify iframe exists and device switching toggles dimensions (indirectly).
    const iframe = screen.getByTitle(/preview/i);
    expect(iframe).toBeInTheDocument();

    const desktopToggle = screen.getByRole("button", { name: /desktop/i });
    const mobileToggle = screen.getByRole("button", { name: /mobile/i });

    await user.click(mobileToggle);
    expect(
      screen.getByTestId("context-state").getAttribute("data-preview-device")
    ).toBe("mobile");

    await user.click(desktopToggle);
    expect(
      screen.getByTestId("context-state").getAttribute("data-preview-device")
    ).toBe("desktop");

    // Toggle editable regions.
    const editableToggle = screen.getByRole("button", {
      name: /editable regions/i,
    });
    await user.click(editableToggle);
    expect(
      screen.getByTestId("context-state").getAttribute("data-show-editable")
    ).toBe("false");

    // Trigger debounced preview refresh via PreviewPane (assumes button exists).
    const refreshButton = screen.getByRole("button", { name: /refresh preview/i });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        html: "<html><body>Preview</body></html>",
      }),
    });

    await user.click(refreshButton);

    // Run timers to flush debounce.
    await act(async () => {
      jest.runAllTimers();
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/preview", expect.any(Object));

    // Now exercise saveDraft through keyboard shortcut or by locating Save button.
    // Assume CMSLayout binds Ctrl/Cmd+S to saveDraft via ContentContext listener.
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: sampleContent,
        html: sampleHtml,
        sha: sampleSha,
      }),
    });

    await act(async () => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
      });
      window.dispatchEvent(event);
      jest.runAllTimers();
    });

    // First: /api/content/save, then /api/content/load to refresh SHA.
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/content/save",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("context-state").getAttribute("data-has-unsaved")
      ).toBe("false");
    });
  });

  it("supports undo/redo across state changes in ContentContext", async () => {
    render(
      <ContentProvider
        initialContent={sampleContent as any}
        initialHtml={sampleHtml}
        initialSha={sampleSha}
      >
        <EditorForm />
        <ContextInspector />
      </ContentProvider>
    );

    const user = userEvent.setup({ delay: null });

    // Initial active section is null until navigator selects, but EditorForm should default.
    const headingInput = await screen.findByDisplayValue("Hero Heading");

    // Change heading text.
    await user.clear(headingInput);
    await user.type(headingInput, "Changed");

    const eventUndo = new KeyboardEvent("keydown", {
      key: "z",
      ctrlKey: true,
    });
    const eventRedo = new KeyboardEvent("keydown", {
      key: "z",
      ctrlKey: true,
      shiftKey: true,
    });

    // Undo should restore previous value.
    await act(async () => {
      window.dispatchEvent(eventUndo);
    });
    expect(screen.getByDisplayValue("Hero Heading")).toBeInTheDocument();

    // Redo should apply changed value again.
    await act(async () => {
      window.dispatchEvent(eventRedo);
    });
    expect(screen.getByDisplayValue("Changed")).toBeInTheDocument();
  });

  it("auto-saves when hasUnsavedChanges is true and persists draft to localStorage", async () => {
    (global.fetch as any) = mockFetch;

    render(
      <ContentProvider
        initialContent={sampleContent as any}
        initialHtml={sampleHtml}
        initialSha={undefined as any}
      >
        <EditorForm />
        <ContextInspector />
      </ContentProvider>
    );

    const user = userEvent.setup({ delay: null });

    const headingInput = await screen.findByDisplayValue("Hero Heading");
    await user.clear(headingInput);
    await user.type(headingInput, "AutoSave Test");

    // Auto-save timer is 30s. Fast-forward.
    await act(async () => {
      jest.advanceTimersByTime(30000);
    });

    // Since no SHA provided, saveDraft only persists to localStorage (no API call).
    expect(mockFetch).not.toHaveBeenCalled();
    const storedDraft = window.localStorage.getItem("cognicms-draft");
    expect(storedDraft).not.toBeNull();

    const parsedDraft = JSON.parse(storedDraft as string);
    expect(parsedDraft.sections[0].content.heading).toBe("AutoSave Test");
  });
});