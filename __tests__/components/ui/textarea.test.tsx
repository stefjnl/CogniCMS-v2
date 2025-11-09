import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Textarea } from "@/components/ui/textarea";

describe("[components/ui/textarea.tsx](components/ui/textarea.tsx:1)", () => {
  test("renders textarea element with base classes", () => {
    render(<Textarea aria-label="test-textarea" />);

    const textarea = screen.getByLabelText("test-textarea");
    expect(textarea.tagName.toLowerCase()).toBe("textarea");

    const classes = textarea.getAttribute("class") || "";
    expect(classes).toContain("rounded-md");
    expect(classes).toContain("border-input");
  });

  test("supports controlled usage", () => {
    const handleChange = jest.fn();
    render(
      <Textarea
        aria-label="controlled-textarea"
        value="value"
        onChange={handleChange}
      />
    );

    const textarea = screen.getByLabelText(
      "controlled-textarea"
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("value");

    fireEvent.change(textarea, { target: { value: "next" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test("supports uncontrolled usage with defaultValue", () => {
    render(
      <Textarea
        aria-label="uncontrolled-textarea"
        defaultValue="default"
      />
    );

    const textarea = screen.getByLabelText(
      "uncontrolled-textarea"
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("default");

    fireEvent.change(textarea, { target: { value: "changed" } });
    expect(textarea.value).toBe("changed");
  });

  test("passes through disabled and rows props", () => {
    render(
      <Textarea
        aria-label="disabled-textarea"
        disabled
        rows={5}
      />
    );

    const textarea = screen.getByLabelText("disabled-textarea");
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute("rows", "5");
  });

  test("applies custom className", () => {
    render(
      <Textarea
        aria-label="custom-class-textarea"
        className="custom-class"
      />
    );

    const textarea = screen.getByLabelText("custom-class-textarea");
    const classes = textarea.getAttribute("class") || "";
    expect(classes).toContain("custom-class");
  });
});