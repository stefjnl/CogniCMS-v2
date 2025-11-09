import React from "react";
import { render, screen } from "@testing-library/react";
import { ContentEditor } from "@/components/cms/ContentEditor";
import { useContent } from "@/lib/state/ContentContext";

// Mock ContentContext
jest.mock("@/lib/state/ContentContext", () => ({
  useContent: jest.fn(),
}));

// Mock child components to assert integration without depending on their internals
jest.mock("@/components/cms/SectionNavigator", () => ({
  SectionNavigator: () => (
    <div data-testid="section-navigator">SectionNavigator</div>
  ),
}));
jest.mock("@/components/cms/EditorForm", () => ({
  EditorForm: () => <div data-testid="editor-form">EditorForm</div>,
}));

const mockedUseContent = useContent as jest.MockedFunction<typeof useContent>;

describe("components/cms/ContentEditor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("always renders SectionNavigator in header", () => {
    mockedUseContent.mockReturnValue({
      activeSection: null,
    } as any);

    render(<ContentEditor />);

    expect(screen.getByTestId("section-navigator")).toBeInTheDocument();
  });

  test("renders empty state when no active section", () => {
    mockedUseContent.mockReturnValue({
      activeSection: null,
    } as any);

    render(<ContentEditor />);

    expect(
      screen.getByText(/no section selected/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/select a section from the list above to start editing/i)
    ).toBeInTheDocument();

    expect(screen.queryByTestId("editor-form")).not.toBeInTheDocument();
  });

  test("renders EditorForm when active section exists", () => {
    mockedUseContent.mockReturnValue({
      activeSection: "hero",
    } as any);

    render(<ContentEditor />);

    expect(screen.getByTestId("editor-form")).toBeInTheDocument();
    expect(screen.queryByText(/no section selected/i)).not.toBeInTheDocument();
  });

  test("layout structure: has container with expected classes", () => {
    mockedUseContent.mockReturnValue({
      activeSection: null,
    } as any);

    const { container } = render(<ContentEditor />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    const classes = root.className;
    expect(classes).toContain("flex");
    expect(classes).toContain("bg-white");
  });
});