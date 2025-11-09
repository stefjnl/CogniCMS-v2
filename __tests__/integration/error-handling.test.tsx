import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";
import Login from "@/app/login/page";
import { ContentProvider } from "@/lib/state/ContentContext";
import { PreviewPane } from "@/components/cms/PreviewPane";

// Ensure consistent environment for async React updates in these integration tests.
jest.setTimeout(20000);

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const baseContent = {
  sections: [
    {
      id: "hero",
      title: "Hero",
      content: {
        heading: "Hero",
        body: "Body",
      },
    },
  ],
};

const baseHtml =
  '<html><body><div data-section="hero">Hero</div></body></html>';

describe("Error Handling Integration", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (global.fetch as any) = mockFetch;
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("shows error UI when content load network request fails", async () => {
    window.localStorage.setItem("cms-auth", "true");

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to load content from GitHub" }),
    });

    render(<Home />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/content/load");
    });

    // Wait for error view to render, not just the initial loading skeleton.
    await waitFor(() => {
      // ErrorBoundary should show a user-friendly error message from the thrown error.
      expect(
        screen.getByText(/failed to load content from github/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /retry/i })
    ).toBeInTheDocument();
  });

  it("displays authentication error for failed /api/auth response", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid password" }),
    });

    render(<Login />);

    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth", expect.any(Object));
    });

    await waitFor(() => {
      expect(screen.getByText(/invalid password/i)).toBeInTheDocument();
    });
  }, 15000);

  it("displays generic error when /api/auth throws network error", async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<Login />);

    await user.type(screen.getByLabelText(/password/i), "any");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth", expect.any(Object));
    });

    await waitFor(() => {
      expect(
        screen.getByText(/authentication failed\. please try again\./i)
      ).toBeInTheDocument();
    });
  }, 15000);

  it("handles GitHub API error during saveDraft gracefully", async () => {
    // Provide SHA to force GitHub branch of saveDraft.
    (global.fetch as any) = mockFetch;

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ContentProvider
        initialContent={baseContent as any}
        initialHtml={baseHtml}
        initialSha={{ html: "html-sha", content: "content-sha" }}
      >
        {/* PreviewPane registers keyboard shortcuts via ContentContext provider */}
        <PreviewPane />
      </ContentProvider>
    );

    // Mark content as changed to enable saveDraft.
    // Simulate via localStorage or by directly using keyboard shortcut; the
    // keyboard listener calls saveDraft which will hit the save API.
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "GitHub save failed" }),
    });

    await act(async () => {
      const evt = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
      });
      window.dispatchEvent(evt);
      jest.runAllTimers();
    });

    consoleErrorSpy.mockRestore();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/content/save",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    // After failure, state should not crash; error is tracked via toast and context.
    const iframe = screen.getByTitle(/preview/i);
    expect(iframe).toBeInTheDocument();
  });

  it("handles preview API error and keeps UI stable", async () => {
    (global.fetch as any) = mockFetch;

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <ContentProvider
        initialContent={baseContent as any}
        initialHtml={baseHtml}
        initialSha={{ html: "html-sha", content: "content-sha" }}
      >
        <PreviewPane />
      </ContentProvider>
    );

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Preview failed" }),
    });

    const user = userEvent.setup();
    const refreshButton = screen.getByRole("button", {
      name: /refresh/i,
    });

    await act(async () => {
      await user.click(refreshButton);
      jest.runAllTimers();
    });

    consoleErrorSpy.mockRestore();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/preview",
        expect.objectContaining({ method: "POST" })
      );
    });

    // Component should stay mounted; smoke-check with presence of Preview heading or shell.
    expect(screen.getByText(/preview/i)).toBeInTheDocument();
  }, 15000);
});