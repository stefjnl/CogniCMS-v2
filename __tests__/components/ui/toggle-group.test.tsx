import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

describe("[components/ui/toggle-group.tsx](components/ui/toggle-group.tsx:1)", () => {
  test("renders ToggleGroup container with base layout classes", () => {
    render(
      <ToggleGroup type="single" aria-label="devices">
        <ToggleGroupItem value="mobile">Mobile</ToggleGroupItem>
      </ToggleGroup>
    );

    const container = screen.getByLabelText("devices");
    const classes = container.getAttribute("class") || "";

    expect(classes).toContain("flex");
    expect(classes).toContain("items-center");
  });

  test("ToggleGroupItem inherits variant and size from context", () => {
    render(
      <ToggleGroup
        type="single"
        aria-label="group"
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="one">One</ToggleGroupItem>
      </ToggleGroup>
    );

    const item = screen.getByRole("button", { name: "One" });
    const classes = item.getAttribute("class") || "";

    // From toggleVariants: outline & sm should influence classes
    expect(classes).toContain("border-input");
    expect(classes).toContain("h-8");
  });

  test("item-level variant and size override context when provided", () => {
    render(
      <ToggleGroup
        type="single"
        aria-label="group"
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="one" variant="default" size="lg">
          One
        </ToggleGroupItem>
      </ToggleGroup>
    );

    const item = screen.getByRole("button", { name: "One" });
    const classes = item.getAttribute("class") || "";

    // Should reflect explicit lg (h-10) instead of sm (h-8)
    expect(classes).toContain("h-10");
  });

  test("supports single-select behavior wiring without runtime errors", () => {
    render(
      <ToggleGroup
        type="single"
        aria-label="letters"
        defaultValue="a"
      >
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );

    const a = screen.getByRole("button", { name: "A" });
    const b = screen.getByRole("button", { name: "B" });

    // Clicks should not throw; Radix manages pressed state internally
    fireEvent.click(b);
    fireEvent.click(a);

    expect(a).toBeInTheDocument();
    expect(b).toBeInTheDocument();
  });

  test("multi-select (type=multiple) wiring works without errors", () => {
    render(
      <ToggleGroup
        type="multiple"
        aria-label="multi"
        defaultValue={["a"]}
      >
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    );

    const a = screen.getByRole("button", { name: "A" });
    const b = screen.getByRole("button", { name: "B" });

    fireEvent.click(b);
    fireEvent.click(a);

    expect(a).toBeInTheDocument();
    expect(b).toBeInTheDocument();
  });
});