import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActionBar } from "@/components/cms/ActionBar";
import { useContent } from "@/lib/state/ContentContext";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock lucide-react icons (simple functional components)
jest.mock("lucide-react", () => {
  const MockIcon = (props: any) => <svg data-testid={props["data-testid"] || "icon"} />;
  return {
    Save: (props: any) => <MockIcon {...props} />,
    RotateCcw: (props: any) => <MockIcon {...props} />,
    Upload: (props: any) => <MockIcon {...props} />,
    Clock: (props: any) => <MockIcon {...props} />,
    LogOut: (props: any) => <MockIcon {...props} />,
  };
});

// Mock ContentContext hook
jest.mock("@/lib/state/ContentContext", () => {
  return {
    useContent: jest.fn(),
  };
});

const mockedUseContent = useContent as jest.MockedFunction<typeof useContent>;

// NOTE: formatTimeSince is file-local in [components/cms/ActionBar.tsx](components/cms/ActionBar.tsx:99)
// We verify its behavior indirectly via rendered text.

function buildState(overrides: Partial<ReturnType<typeof createBaseState>> = {}) {
  return {
    ...createBaseState(),
    ...overrides,
  };
}

function createBaseState() {
  return {
    hasUnsavedChanges: false,
    isSaving: false,
    lastSaved: null as Date | null,
    saveDraft: jest.fn(),
    revertChanges: jest.fn(),
    historyIndex: 0,
    history: [{}],
  };
}

describe("components/cms/ActionBar", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-01T12:00:00Z"));
    mockedUseContent.mockReset();
    (window as any).localStorage?.clear?.();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders title and basic layout", () => {
    mockedUseContent.mockReturnValue(buildState());

    render(<ActionBar />);

    expect(
      screen.getByRole("heading", { name: /cognicms/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/undo/i)).toBeInTheDocument();
  });

  test("shows unsaved changes indicator when hasUnsavedChanges is true", () => {
    mockedUseContent.mockReturnValue(
      buildState({
        hasUnsavedChanges: true,
      })
    );

    render(<ActionBar />);

    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
  });

  test("shows last saved indicator when lastSaved exists and no unsaved changes", () => {
    const lastSaved = new Date("2024-01-01T11:59:45Z"); // 15s ago
    mockedUseContent.mockReturnValue(
      buildState({
        lastSaved,
      })
    );

    render(<ActionBar />);

    expect(screen.getByText(/saved just now/i)).toBeInTheDocument();
  });

  test("formatTimeSince: minutes ago rendering", () => {
    const lastSaved = new Date("2024-01-01T11:50:00Z"); // 10m ago
    mockedUseContent.mockReturnValue(
      buildState({
        lastSaved,
      })
    );

    render(<ActionBar />);

    expect(screen.getByText(/saved 10m ago/i)).toBeInTheDocument();
  });

  test("formatTimeSince: hours ago rendering", () => {
    const lastSaved = new Date("2024-01-01T09:00:00Z"); // 3h ago
    mockedUseContent.mockReturnValue(
      buildState({
        lastSaved,
      })
    );

    render(<ActionBar />);

    expect(screen.getByText(/saved 3h ago/i)).toBeInTheDocument();
  });

  test("formatTimeSince: days ago rendering", () => {
    const lastSaved = new Date("2023-12-30T12:00:00Z"); // 2d ago
    mockedUseContent.mockReturnValue(
      buildState({
        lastSaved,
      })
    );

    render(<ActionBar />);

    expect(screen.getByText(/saved 2d ago/i)).toBeInTheDocument();
  });

  test("publish button disabled when no unsaved changes", () => {
    mockedUseContent.mockReturnValue(
      buildState({
        hasUnsavedChanges: false,
      })
    );

    render(<ActionBar />);

    const publish = screen.getByRole("button", {
      name: /publish to github/i,
    });
    expect(publish).toBeDisabled();
  });

  test("publish button disabled while saving", () => {
    mockedUseContent.mockReturnValue(
      buildState({
        hasUnsavedChanges: true,
        isSaving: true,
      })
    );

    render(<ActionBar />);

    const publish = screen.getByRole("button", {
      name: /publishing/i,
    });
    expect(publish).toBeDisabled();
  });

  test("publish button enabled when unsaved changes and not saving", () => {
    const saveDraft = jest.fn();
    mockedUseContent.mockReturnValue(
      buildState({
        hasUnsavedChanges: true,
        isSaving: false,
        saveDraft,
      })
    );

    render(<ActionBar />);

    const publish = screen.getByRole("button", {
      name: /publish to github/i,
    });
    expect(publish).toBeEnabled();

    fireEvent.click(publish);
    expect(saveDraft).toHaveBeenCalled();
  });

  test("revert button disabled when no unsaved changes", () => {
    mockedUseContent.mockReturnValue(buildState());

    render(<ActionBar />);

    const revert = screen.getByRole("button", { name: /revert/i });
    expect(revert).toBeDisabled();
  });

  test("revert button calls revertChanges when enabled", () => {
    const revertChanges = jest.fn();
    mockedUseContent.mockReturnValue(
      buildState({
        hasUnsavedChanges: true,
        revertChanges,
      })
    );

    render(<ActionBar />);

    const revert = screen.getByRole("button", { name: /revert/i });
    expect(revert).toBeEnabled();

    fireEvent.click(revert);
    expect(revertChanges).toHaveBeenCalled();
  });

  test("logout button clears cms-auth from localStorage and navigates", () => {
    const push = jest.fn();
    // Override router mock for this test
    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue({
      push,
    });

    mockedUseContent.mockReturnValue(buildState());

    window.localStorage.setItem("cms-auth", "token");
    render(<ActionBar />);

    const logout = screen.getByRole("button", { name: "Logout" });
    expect(logout).toHaveAttribute("title", "Logout");

    fireEvent.click(logout);

    expect(window.localStorage.getItem("cms-auth")).toBeNull();
    expect(push).toHaveBeenCalledWith("/login");
  });

  test("undo/redo indicators reflect historyIndex and history length", () => {
    mockedUseContent.mockReturnValue(
      buildState({
        historyIndex: 1,
        history: [{}, {}, {}],
      })
    );

    render(<ActionBar />);

    // "✓" indicator for undo and some indicator for redo; we assert presence of symbols
    expect(screen.getByText("✓")).toBeInTheDocument();
  });
});