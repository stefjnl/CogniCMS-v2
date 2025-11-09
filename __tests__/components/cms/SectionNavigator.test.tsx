import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SectionNavigator } from "@/components/cms/SectionNavigator";
import { useContent } from "@/lib/state/ContentContext";

// Mock ContentContext hook
jest.mock("@/lib/state/ContentContext", () => ({
  useContent: jest.fn(),
}));

// Mock accordion primitives used inside SectionNavigator to avoid Radix internals
jest.mock("@/components/ui/accordion", () => {
  const React = require("react");
  const Accordion = ({ children, ...props }: any) => (
    <div data-testid="accordion" {...props}>
      {children}
    </div>
  );
  const AccordionItem = ({ children, ...props }: any) => (
    <div data-testid="accordion-item" {...props}>
      {children}
    </div>
  );
  const AccordionTrigger = ({ children, ...props }: any) => (
    // Use button for accessibility and click handling
    <button data-testid="accordion-trigger" {...props}>
      {children}
    </button>
  );
  const AccordionContent = ({ children, ...props }: any) => (
    <div data-testid="accordion-content" {...props}>
      {children}
    </div>
  );
  return { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
});

const mockedUseContent = useContent as jest.MockedFunction<typeof useContent>;

function createSections() {
  return [
    {
      id: "hero",
      label: "Hero Section",
      type: "hero",
      content: {},
    },
    {
      id: "unknown-type",
      label: "Unknown Type",
      type: "custom",
      content: {},
    },
  ];
}

describe("[components/cms/SectionNavigator.tsx](components/cms/SectionNavigator.tsx:1)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns null when no currentContent", () => {
    mockedUseContent.mockReturnValue({
      currentContent: null,
      activeSection: null,
      setActiveSection: jest.fn(),
    } as any);

    const { container } = render(<SectionNavigator />);
    expect(container.firstChild).toBeNull();
  });

  test("renders sections from currentContent", () => {
    mockedUseContent.mockReturnValue({
      currentContent: {
        id: "page",
        title: "Test",
        sections: createSections(),
      },
      activeSection: null,
      setActiveSection: jest.fn(),
    } as any);

    render(<SectionNavigator />);

    expect(screen.getByText(/content sections/i)).toBeInTheDocument();
    expect(screen.getByText("Hero Section")).toBeInTheDocument();
    expect(screen.getByText("Unknown Type")).toBeInTheDocument();
  });

  test("highlights activeSection", () => {
    const sections = createSections();
    mockedUseContent.mockReturnValue({
      currentContent: {
        id: "page",
        title: "Test",
        sections,
      },
      activeSection: "hero",
      setActiveSection: jest.fn(),
    } as any);

    render(<SectionNavigator />);

    const heroTrigger = screen.getAllByTestId("accordion-trigger").find((el) =>
      el.textContent?.includes("Hero Section")
    );
    expect(heroTrigger).toBeTruthy();
    // The component adds bg-blue-50 text-blue-700 font-medium for active;
    // here we just assert that className contains bg-blue-50.
    expect(heroTrigger).toHaveClass("bg-blue-50");
  });

  test("clicking a section calls setActiveSection", () => {
    const setActiveSection = jest.fn();
    mockedUseContent.mockReturnValue({
      currentContent: {
        id: "page",
        title: "Test",
        sections: createSections(),
      },
      activeSection: null,
      setActiveSection,
    } as any);

    render(<SectionNavigator />);

    const heroTrigger = screen.getAllByTestId("accordion-trigger").find((el) =>
      el.textContent?.includes("Hero Section")
    );
    expect(heroTrigger).toBeTruthy();

    fireEvent.click(heroTrigger as HTMLElement);

    expect(setActiveSection).toHaveBeenCalledWith("hero");
  });

  test("uses fallback icon for unknown section types", () => {
    const sections = createSections();
    mockedUseContent.mockReturnValue({
      currentContent: {
        id: "page",
        title: "Test",
        sections,
      },
      activeSection: null,
      setActiveSection: jest.fn(),
    } as any);

    render(<SectionNavigator />);

    // For hero: icon 🎯, for unknown: 📄
    expect(screen.getByText("🎯")).toBeInTheDocument();
    expect(screen.getByText("📄")).toBeInTheDocument();
  });
});