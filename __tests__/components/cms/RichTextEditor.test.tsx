import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { RichTextEditor } from "@/components/cms/RichTextEditor";

// Mocks for Tiptap editor behavior
const mockSetContent = jest.fn();
const mockGetHTML = jest.fn();
const mockChain = jest.fn(() => ({
  focus: () => ({
    toggleBold: () => ({ run: jest.fn() }),
    toggleItalic: () => ({ run: jest.fn() }),
    toggleHeading: () => ({ run: jest.fn() }),
    toggleBulletList: () => ({ run: jest.fn() }),
  }),
}));
const mockIsActive = jest.fn();
const mockCommands = { setContent: mockSetContent };

jest.mock("@tiptap/react", () => {
  const React = require("react");
  return {
    useEditor: jest.fn((options: any) => {
      // Simulate initialized editor instance
      const editor = {
        getHTML: mockGetHTML,
        commands: mockCommands,
        chain: mockChain,
        isActive: mockIsActive,
      };

      // Provide default HTML for tests unless overridden
      if (!mockGetHTML.mock.results.length) {
        mockGetHTML.mockReturnValue("<p>initial</p>");
      }

      // Simulate an update callback once on mount
      if (options?.onUpdate) {
        options.onUpdate({ editor });
      }

      return editor;
    }),
    EditorContent: ({ editor }: any) => (
      <div data-testid="editor-content">{editor ? "editor" : "no-editor"}</div>
    ),
  };
});

// StarterKit is only used as an extension; a lightweight mock is sufficient
jest.mock("@tiptap/starter-kit", () => ({}));

describe("[components/cms/RichTextEditor.tsx](components/cms/RichTextEditor.tsx:1)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHTML.mockReturnValue("<p>initial</p>");
  });

  test("initializes editor and renders EditorContent", () => {
    render(
      <RichTextEditor
        value="<p>initial</p>"
        onChange={jest.fn()}
      />
    );

    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  test("onUpdate propagates editor HTML via onChange", () => {
    mockGetHTML.mockReturnValue("<p>from-editor</p>");

    const onChange = jest.fn();

    render(<RichTextEditor value="<p>initial</p>" onChange={onChange} />);

    // onUpdate called during mocked useEditor initialization
    expect(onChange).toHaveBeenCalledWith("<p>from-editor</p>");
  });

  test("syncs external value changes using setContent when value differs", () => {
    const onChange = jest.fn();

    const { rerender } = render(
      <RichTextEditor value="<p>initial</p>" onChange={onChange} />
    );

    // When effect runs, editor.getHTML() returns current internal value;
    // change it so the hook detects difference
    mockGetHTML.mockReturnValue("<p>old</p>");

    rerender(
      <RichTextEditor value="<p>updated</p>" onChange={onChange} />
    );

    expect(mockSetContent).toHaveBeenCalledWith("<p>updated</p>");
  });

  test("returns null when editor is not yet initialized", () => {
    const tiptap = require("@tiptap/react");
    (tiptap.useEditor as jest.Mock).mockReturnValueOnce(null);

    const { container } = render(
      <RichTextEditor value="<p>initial</p>" onChange={jest.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  test("toolbar buttons call editor.chain() APIs", () => {
    render(
      <RichTextEditor
        value="<p>initial</p>"
        onChange={jest.fn()}
      />
    );

    const boldButton = screen.getByText("B");
    const italicButton = screen.getByText("I");
    const h2Button = screen.getByText("H2");
    const bulletButton = screen.getByText("•");

    act(() => {
      fireEvent.click(boldButton);
      fireEvent.click(italicButton);
      fireEvent.click(h2Button);
      fireEvent.click(bulletButton);
    });

    expect(mockChain).toHaveBeenCalled();
  });
});