import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("components/ui/input", () => {
  test("renders input element with base classes", () => {
    render(<Input aria-label="test-input" />);

    const input = screen.getByLabelText("test-input");
    expect(input.tagName.toLowerCase()).toBe("input");

    const classes = input.getAttribute("class") || "";
    expect(classes).toContain("rounded-md");
    expect(classes).toContain("border-input");
  });

  test("supports controlled usage", () => {
    const handleChange = jest.fn();
    render(
      <Input
        aria-label="controlled-input"
        value="value"
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText("controlled-input") as HTMLInputElement;
    expect(input.value).toBe("value");

    fireEvent.change(input, { target: { value: "next" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test("supports uncontrolled usage with defaultValue", () => {
    render(<Input aria-label="uncontrolled-input" defaultValue="default" />);

    const input = screen.getByLabelText(
      "uncontrolled-input"
    ) as HTMLInputElement;
    expect(input.value).toBe("default");

    fireEvent.change(input, { target: { value: "changed" } });
    expect(input.value).toBe("changed");
  });

  test("passes through type and disabled props", () => {
    render(<Input aria-label="email-input" type="email" disabled />);

    const input = screen.getByLabelText("email-input");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toBeDisabled();
  });

  test("applies custom className", () => {
    render(<Input aria-label="custom-class-input" className="custom-class" />);

    const input = screen.getByLabelText("custom-class-input");
    const classes = input.getAttribute("class") || "";
    expect(classes).toContain("custom-class");
  });
});
