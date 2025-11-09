import React from "react";
import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("[components/ui/label.tsx](components/ui/label.tsx:1)", () => {
  test("renders label element with base classes", () => {
    render(<Label htmlFor="field">Name</Label>);

    const label = screen.getByText("Name");
    expect(label.tagName.toLowerCase()).toBe("label");

    const classes = label.getAttribute("class") || "";
    expect(classes).toContain("text-sm");
    expect(classes).toContain("font-medium");
  });

  test("associates with input via htmlFor for accessibility", () => {
    render(
      <div>
        <Label htmlFor="email">Email</Label>
        <input id="email" aria-label="email" />
      </div>
    );

    const label = screen.getByText("Email");
    const input = screen.getByLabelText("email");

    expect(label).toHaveAttribute("for", "email");
    // Radix Label ensures clicking the label focuses associated control (jsdom limitation),
    // here we assert the attribute wiring which is what the component controls.
    expect(input.id).toBe("email");
  });

  test("applies custom className", () => {
    render(
      <Label htmlFor="x" className="custom-class">
        Label
      </Label>
    );

    const label = screen.getByText("Label");
    const classes = label.getAttribute("class") || "";
    expect(classes).toContain("custom-class");
  });
});