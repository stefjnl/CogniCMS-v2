import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorForm } from "@/components/cms/EditorForm";
import { useContent } from "@/lib/state/ContentContext";

// Mock ContentContext
jest.mock("@/lib/state/ContentContext", () => ({
  useContent: jest.fn(),
}));

// Mock RichTextEditor (not directly used now but keep pattern consistent)
jest.mock("@/components/cms/RichTextEditor", () => ({
  RichTextEditor: ({ value, onChange }: any) => (
    <textarea
      data-testid="rich-text-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const mockedUseContent = useContent as jest.MockedFunction<typeof useContent>;

const baseHeroSection = {
  id: "hero",
  label: "Hero",
  type: "hero",
  content: {
    heading: "Hero heading",
    subheading: "Hero sub",
    ctaText: "Click me",
    urgencyText: "Now",
  },
};

const baseBannerSection = {
  id: "banner",
  label: "Banner",
  type: "banner",
  content: {
    heading: "Banner heading",
    subtitle: "Banner subtitle",
  },
};

const baseContentSection = {
  id: "content",
  label: "Content",
  type: "content",
  content: {
    heading: "Content heading",
    paragraphs: ["P1", "P2"],
  },
};

const baseTeamSection = {
  id: "team",
  label: "Team",
  type: "team",
  content: {
    heading: "Our team",
    members: [
      { name: "Alice", role: "Lead", bio: "Bio 1" },
      { name: "Bob", role: "Dev", bio: "Bio 2" },
    ],
  },
};

const baseEventsSection = {
  id: "events",
  label: "Events",
  type: "events",
  content: {
    heading: "Events",
    events: [
      { id: "e1", title: "Event 1", date: "2024-01-01", availability: "Open" },
    ],
  },
};

const baseFormSection = {
  id: "form",
  label: "Form",
  type: "form",
  content: {
    heading: "Sign up",
    description: "Fill in form",
    privacyNote: "We respect privacy",
  },
};

const baseInfoSection = {
  id: "info",
  label: "Info",
  type: "info",
  content: {
    heading: "Info",
    infoItems: [{ label: "Location", value: "Earth" }],
  },
};

const baseFaqSection = {
  id: "faq",
  label: "FAQ",
  type: "faq",
  content: {
    heading: "FAQ",
    items: [{ question: "Q1", answer: "A1" }],
  },
};

const baseContactSection = {
  id: "contact",
  label: "Contact",
  type: "contact",
  content: {
    heading: "Contact us",
    description: "Reach out",
    email: "x@example.com",
  },
};

const baseFooterSection = {
  id: "footer",
  label: "Footer",
  type: "footer",
  content: {
    text: "Footer text",
    email: "footer@example.com",
  },
};

function mockContext(
  section: any,
  overrides?: Partial<ReturnType<typeof createContextValue>>
) {
  const value = createContextValue(section, overrides);
  mockedUseContent.mockReturnValue(value as any);
  return value;
}

function createContextValue(
  section: any,
  overrides?: Partial<{
    updateSection: jest.Mock;
  }>
) {
  const updateSection = overrides?.updateSection ?? jest.fn();
  return {
    currentContent: {
      id: "page",
      title: "Test",
      sections: [section],
    },
    activeSection: section.id,
    updateSection,
  };
}

describe("components/cms/EditorForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns null when no currentContent", () => {
    mockedUseContent.mockReturnValue({
      currentContent: null,
      activeSection: null,
      updateSection: jest.fn(),
    } as any);

    const { container } = render(<EditorForm />);
    expect(container.firstChild).toBeNull();
  });

  test("returns null when no activeSection", () => {
    mockedUseContent.mockReturnValue({
      currentContent: {
        id: "page",
        title: "Test",
        sections: [baseHeroSection],
      },
      activeSection: null,
      updateSection: jest.fn(),
    } as any);

    const { container } = render(<EditorForm />);
    expect(container.firstChild).toBeNull();
  });

  test("returns null when active section not found", () => {
    mockedUseContent.mockReturnValue({
      currentContent: { id: "page", title: "Test", sections: [] },
      activeSection: "missing",
      updateSection: jest.fn(),
    } as any);

    const { container } = render(<EditorForm />);
    expect(container.firstChild).toBeNull();
  });

  test("renders hero editor and calls updateSection on field change", () => {
    const ctx = mockContext(baseHeroSection);
    render(<EditorForm />);

    expect(screen.getByText("Hero")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Hero heading")).toBeInTheDocument();

    const headingInput = screen.getByLabelText("Heading") as HTMLInputElement;
    fireEvent.change(headingInput, { target: { value: "Updated hero" } });

    expect(ctx.updateSection).toHaveBeenCalledWith("hero", {
      heading: "Updated hero",
    });
  });

  test("renders banner editor", () => {
    mockContext(baseBannerSection);
    render(<EditorForm />);

    expect(screen.getByText("Banner")).toBeInTheDocument();
    expect(screen.getByLabelText("Heading")).toBeInTheDocument();
    expect(screen.getByLabelText("Subtitle")).toBeInTheDocument();
  });

  test("renders content editor with paragraphs and updates array on change", () => {
    const ctx = mockContext(baseContentSection);
    render(<EditorForm />);

    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByLabelText("Heading")).toBeInTheDocument();

    const para1 = screen.getByLabelText("Paragraph 1") as HTMLTextAreaElement;
    fireEvent.change(para1, { target: { value: "NP1" } });

    expect(ctx.updateSection).toHaveBeenCalledWith("content", {
      paragraphs: ["NP1", "P2"],
    });
  });

  test("handles nested Team members via handleNestedChange", () => {
    const ctx = mockContext(baseTeamSection);
    render(<EditorForm />);

    expect(screen.getByText("Our team")).toBeInTheDocument();
    const nameInput = screen.getByLabelText("Name") as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: "Alice Updated" } });

    expect(ctx.updateSection).toHaveBeenCalledWith("team", {
      members: [
        { name: "Alice Updated", role: "Lead", bio: "Bio 1" },
        { name: "Bob", role: "Dev", bio: "Bio 2" },
      ],
    });
  });

  test("handles nested Events via handleNestedChange", () => {
    const ctx = mockContext(baseEventsSection);
    render(<EditorForm />);

    expect(screen.getByText("Events")).toBeInTheDocument();
    const titleInput = screen.getByLabelText("Title") as HTMLInputElement;

    fireEvent.change(titleInput, { target: { value: "Updated Event" } });

    expect(ctx.updateSection).toHaveBeenCalledWith("events", {
      events: [
        {
          id: "e1",
          title: "Updated Event",
          date: "2024-01-01",
          availability: "Open",
        },
      ],
    });
  });

  test("renders form editor and propagates changes", () => {
    const ctx = mockContext(baseFormSection);
    render(<EditorForm />);

    expect(screen.getByText("Form")).toBeInTheDocument();
    const heading = screen.getByLabelText("Heading") as HTMLInputElement;

    fireEvent.change(heading, { target: { value: "New Form" } });

    expect(ctx.updateSection).toHaveBeenCalledWith("form", {
      heading: "New Form",
    });
  });

  test("handles nested Info items via handleNestedChange", () => {
    const ctx = mockContext(baseInfoSection);
    render(<EditorForm />);

    expect(screen.getByText("Info")).toBeInTheDocument();
    const labelInput = screen.getByLabelText("Label") as HTMLInputElement;

    fireEvent.change(labelInput, { target: { value: "New Label" } });

    expect(ctx.updateSection).toHaveBeenCalledWith("info", {
      infoItems: [{ label: "New Label", value: "Earth" }],
    });
  });

  test("handles nested FAQ items via handleNestedChange", () => {
    const ctx = mockContext(baseFaqSection);
    render(<EditorForm />);

    expect(screen.getByText("FAQ")).toBeInTheDocument();
    const questionInput = screen.getByLabelText("Question") as HTMLInputElement;

    fireEvent.change(questionInput, { target: { value: "New Q" } });

    expect(ctx.updateSection).toHaveBeenCalledWith("faq", {
      items: [{ question: "New Q", answer: "A1" }],
    });
  });

  test("renders contact editor and updates email", () => {
    const ctx = mockContext(baseContactSection);
    render(<EditorForm />);

    expect(screen.getByText("Contact")).toBeInTheDocument();
    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "new@example.com" } });

    expect(ctx.updateSection).toHaveBeenCalledWith("contact", {
      email: "new@example.com",
    });
  });

  test("renders footer editor and updates fields", () => {
    const ctx = mockContext(baseFooterSection);
    render(<EditorForm />);

    expect(screen.getByText("Footer")).toBeInTheDocument();
    const textInput = screen.getByLabelText("Footer Text") as HTMLInputElement;

    fireEvent.change(textInput, { target: { value: "New footer" } });

    expect(ctx.updateSection).toHaveBeenCalledWith("footer", {
      text: "New footer",
    });
  });
});
