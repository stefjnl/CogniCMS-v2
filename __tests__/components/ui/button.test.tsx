import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button, buttonVariants } from "@/components/ui/button";

describe("components/ui/button", () => {
  test("renders with default variant and size", () => {
    render(<Button>Click me</Button>);

    const btn = screen.getByRole("button", { name: "Click me" });
    expect(btn).toBeInTheDocument();

    const classes = btn.getAttribute("class") || "";
    expect(classes).toContain("bg-primary");
    expect(classes).toContain("h-9");
  });

  test("supports variant and size props", () => {
    render(
      <Button variant="outline" size="sm">
        Outline
      </Button>
    );

    const btn = screen.getByRole("button", { name: "Outline" });
    const classes = btn.getAttribute("class") || "";

    const expected = buttonVariants({ variant: "outline", size: "sm" });
    expected.split(" ").forEach((c) => {
      if (!c) return;
      expect(classes).toContain(c);
    });
  });

  test("forwards additional props (type, disabled, aria-label)", () => {
    render(
      <Button type="submit" disabled aria-label="submit-btn">
        Submit
      </Button>
    );

    const btn = screen.getByRole("button", { name: "Submit" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("type", "submit");
    expect(btn).toHaveAttribute("aria-label", "submit-btn");
  });

  test("calls onClick handler", () => {
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Click</Button>);

    const btn = screen.getByRole("button", { name: "Click" });
    fireEvent.click(btn);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("asChild renders Slot semantics (uncontrolled host)", () => {
    // We cannot assert Radix Slot internals directly, but we can ensure that asChild does not crash
    // and that children content is rendered.
    render(
      <Button asChild>
        <a href="/test">Link</a>
      </Button>
    );

    const link = screen.getByRole("link", { name: "Link" });
    expect(link).toBeInTheDocument();
    // Should have button styling applied
    const classes = link.getAttribute("class") || "";
    expect(classes).toContain("inline-flex");
  });
});
