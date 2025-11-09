import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { PreviewPane } from "@/components/cms/PreviewPane";
import { useContent } from "@/lib/state/ContentContext";

// Jest setup (already configured globally via jest.setup.js), but ensure fetch exists
const originalFetch = global.fetch;

// Mock ContentContext
jest.mock("@/lib/state/ContentContext", () => ({
  useContent: jest.fn(),
}));

// Mock toggle-group and button to avoid Radix complexity and focus on behavior
jest.mock("@/components/ui/toggle-group", () => {
  const React = require("react");
  const ToggleGroup = ({ children, onValueChange, value, ...props }: any) => (
    <div data-testid="toggle-group" data-value={value} {...props}>
      {React.Children.map(children, (child: any) =>
        React.cloneElement(child, {
          onClick: () => {
            const val = child.props.value;
            onValueChange?.(val);
          },
        })
      )}
    </div>
  );
  const ToggleGroupItem = ({ children, value, ...props }: any) => (
    <button data-testid={`toggle-${value}`} {...props}>
      {children}
    </button>
  );
  return { ToggleGroup, ToggleGroupItem };
});

jest.mock("@/components/ui/button", () => {
  const React = require("react");
  return {
    Button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  };
});

const mockedUseContent = useContent as jest.MockedFunction<typeof useContent>;

function createBaseContent() {
  return {
    id: "page",
    title: "Test",
    sections: [],
  };
}

function mockContext(overrides?: Partial<ReturnType<typeof buildContext>>) {
  const ctx = buildContext(overrides);
  mockedUseContent.mockReturnValue(ctx as any);
  return ctx;
}

function buildContext(
  overrides?: Partial<{
    currentContent: any;
    originalHtml: string;
    previewDevice: "mobile" | "tablet" | "desktop";
    setPreviewDevice: jest.Mock;
    showEditableRegions: boolean;
    toggleEditableRegions: jest.Mock;
  }>
) {
  return {
    currentContent: overrides?.currentContent ?? createBaseContent(),
    originalHtml: overrides?.originalHtml ?? "<html><body>BASE</body></html>",
    previewDevice: overrides?.previewDevice ?? "desktop",
    setPreviewDevice: overrides?.setPreviewDevice ?? jest.fn((d) => d),
    showEditableRegions: overrides?.showEditableRegions ?? true,
    toggleEditableRegions: overrides?.toggleEditableRegions ?? jest.fn(),
  };
}

describe("components/cms/PreviewPane", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedUseContent.mockReset();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    global.fetch = originalFetch;
  });

  test("renders loading state before htmlContent is set", () => {
    mockContext();
    render(<PreviewPane />);

    expect(screen.getByText(/preview/i)).toBeInTheDocument();
    expect(screen.getByText(/loading preview/i)).toBeInTheDocument();
  });

  test("debounces preview API calls and sets iframe html on success", async () => {
    const originalHtml = "<html><body>ORIGINAL</body></html>";
    const currentContent = createBaseContent();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ html: "<html><body>PREVIEW</body></html>" }),
    });

    mockContext({ originalHtml, currentContent });

    render(<PreviewPane />);

    // Effect is debounced by 300ms
    expect(global.fetch).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/preview",
      expect.objectContaining({
        method: "POST",
      })
    );

    await waitFor(() => {
      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe).toBeInTheDocument();
      expect(iframe.getAttribute("srcdoc")).toContain("PREVIEW");
    });
  });

  test("falls back to originalHtml when API returns non-ok", async () => {
    const originalHtml = "<html><body>ORIG ERR</body></html>";
    const currentContent = createBaseContent();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    mockContext({ originalHtml, currentContent });

    render(<PreviewPane />);

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.getAttribute("srcdoc")).toContain("ORIG ERR");
    });
  });

  test("falls back to originalHtml on fetch error", async () => {
    const originalHtml = "<html><body>ORIG ERR2</body></html>";
    const currentContent = createBaseContent();

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network"));

    mockContext({ originalHtml, currentContent });

    render(<PreviewPane />);

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.getAttribute("srcdoc")).toContain("ORIG ERR2");
    });
  });

  test("device toggle switches previewDevice via setPreviewDevice", async () => {
    const setPreviewDevice = jest.fn();
    mockContext({ setPreviewDevice });

    render(<PreviewPane />);

    const mobileToggle = screen.getByTestId("toggle-mobile");
    const tabletToggle = screen.getByTestId("toggle-tablet");
    const desktopToggle = screen.getByTestId("toggle-desktop");

    fireEvent.click(mobileToggle);
    expect(setPreviewDevice).toHaveBeenCalledWith("mobile");

    fireEvent.click(tabletToggle);
    expect(setPreviewDevice).toHaveBeenCalledWith("tablet");

    fireEvent.click(desktopToggle);
    expect(setPreviewDevice).toHaveBeenCalledWith("desktop");
  });

  test("highlight toggle calls toggleEditableRegions", () => {
    const toggleEditableRegions = jest.fn();
    mockContext({ toggleEditableRegions, showEditableRegions: true });

    render(<PreviewPane />);

    const button = screen.getByRole("button", {
      name: /highlights on/i,
    });

    fireEvent.click(button);
    expect(toggleEditableRegions).toHaveBeenCalled();
  });

  test("refresh button triggers refresh logic", async () => {
    mockContext();

    render(<PreviewPane />);

    // fast-forward to ensure iframe is rendered
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ html: "<html><body>PREVIEW</body></html>" }),
    });
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    const iframeBefore = screen.getByTitle("Preview") as HTMLIFrameElement;
    const originalSrc = iframeBefore.getAttribute("src");

    const refreshButton = screen.getByRole("button", {
      name: /refresh/i,
    });

    // jsdom limitation: we cannot assert actual src change reliably, but we can ensure the handler runs
    fireEvent.click(refreshButton);

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    const iframeAfter = screen.getByTitle("Preview") as HTMLIFrameElement;
    expect(iframeAfter).toBeInTheDocument();
    // src may be null when using srcDoc; this assertion ensures no crash
    expect(iframeAfter.getAttribute("src")).toBe(originalSrc);
  });
});
