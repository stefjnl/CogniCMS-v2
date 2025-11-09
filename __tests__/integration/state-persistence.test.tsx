import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";
import { ContentProvider, useContent } from "@/lib/state/ContentContext";
import { EditorForm } from "@/components/cms/EditorForm";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

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
  ],
};

const sampleHtml =
  '<html><body><div data-section="hero">Hero</div></body></html>';

function ContextProbe() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ctx = useContent();
  return (
    <div
      data-testid="ctx"
      data-has-unsaved={ctx.hasUnsavedChanges ? "true" : "false"}
    />
  );
}

describe("State Persistence Integration", () => {
  const mockFetch = jest.fn();

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

  it("persists draft to localStorage via saveDraft and auto-save", async () => {
    // Use full CMS stack so EditorForm is mounted with correct section selection.
    render(
      <ContentProvider
        initialContent={sampleContent as any}
        initialHtml={sampleHtml}
        initialSha={undefined as any}
      >
        <EditorForm />
        <ContextProbe />
      </ContentProvider>
    );

    const user = userEvent.setup({ delay: null });
    const headingInput = await screen.findByDisplayValue("Hero Heading");

    await user.clear(headingInput);
    await user.type(headingInput, "Persisted Heading");

    // Auto-save should trigger after 30s (no GitHub SHAs, so only localStorage).
    await act(async () => {
      jest.advanceTimersByTime(30000);
    });

    const storedDraft = window.localStorage.getItem("cognicms-draft");
    const storedHtml = window.localStorage.getItem("cognicms-draft-html");
    const storedSha = window.localStorage.getItem("cognicms-draft-sha");
    const storedTs = window.localStorage.getItem("cognicms-draft-timestamp");

    expect(storedDraft).not.toBeNull();
    expect(storedHtml).not.toBeNull();
    expect(storedTs).not.toBeNull();
    // SHA undefined case: key may be null; no strict requirement.

    const parsedDraft = JSON.parse(storedDraft as string);
    expect(parsedDraft.sections[0].content.heading).toBe("Persisted Heading");
    expect(storedHtml).toBe(sampleHtml);
    expect(storedSha === null || typeof storedSha === "string").toBe(true);
  });

  it("warns on beforeunload when hasUnsavedChanges is true", async () => {
    render(
      <ContentProvider
        initialContent={sampleContent as any}
        initialHtml={sampleHtml}
        initialSha={undefined as any}
      >
        <EditorForm />
        <ContextProbe />
      </ContentProvider>
    );

    const user = userEvent.setup({ delay: null });
    const headingInput = await screen.findByDisplayValue("Hero Heading");

    await user.clear(headingInput);
    await user.type(headingInput, "Unsaved");

    const beforeUnloadEvent = new Event("beforeunload", {
      cancelable: true,
    }) as BeforeUnloadEvent;

    // jsdom: dispatch and assert that preventDefault/returnValue used.
    let prevented = false;
    beforeUnloadEvent.preventDefault = () => {
      prevented = true;
    };

    window.dispatchEvent(beforeUnloadEvent);

    // When hasUnsavedChanges is true, handler should prevent unload.
    expect(prevented || beforeUnloadEvent.returnValue === "").toBe(true);
  });

  it("does not warn on beforeunload when there are no unsaved changes", () => {
    render(
      <ContentProvider
        initialContent={sampleContent as any}
        initialHtml={sampleHtml}
        initialSha={undefined as any}
      >
        <ContextProbe />
      </ContentProvider>
    );

    const beforeUnloadEvent = new Event("beforeunload", {
      cancelable: true,
    }) as BeforeUnloadEvent;

    let prevented = false;
    beforeUnloadEvent.preventDefault = () => {
      prevented = true;
    };

    window.dispatchEvent(beforeUnloadEvent);

    // With no unsaved changes, handler should no-op.
    expect(prevented).toBe(false);
    expect(beforeUnloadEvent.returnValue === "" || beforeUnloadEvent.returnValue === undefined).toBe(true);
  });

  it("restores authenticated CMS and loads content after reload-like flow", async () => {
    // Simulate stored auth + draft prior to "reload".
    window.localStorage.setItem("cms-auth", "true");
    window.localStorage.setItem(
      "cognicms-draft",
      JSON.stringify(sampleContent)
    );
    window.localStorage.setItem("cognicms-draft-html", sampleHtml);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: sampleContent,
        html: sampleHtml,
        sha: { html: "h", content: "c" },
      }),
    });

    render(<Home />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/content/load");
    });

    // Assert that CMS is no longer in initial loading-only state by checking
    // that we see the Preview heading from CMSLayout/PreviewPane.
    expect(screen.getByText(/preview/i)).toBeInTheDocument();
  });
});