/**
 * Sanity check test to validate Jest + RTL + ts-jest configuration.
 *
 * This verifies:
 * - Jest can run TypeScript tests
 * - jsdom environment is active
 * - @testing-library/jest-dom is loaded
 * - Path aliases like "@/lib/utils" resolve correctly
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { cn } from "@/lib/utils";

function SampleComponent() {
  return React.createElement(
    "div",
    null,
    React.createElement("h1", { "data-testid": "title" }, "CogniCMS Test Harness"),
    React.createElement("p", { "data-testid": "className" }, cn("a", "b"))
  );
}

describe("Jest and RTL baseline configuration", () => {
  it("runs React + TS test with jsdom and path aliases", () => {
    render(React.createElement(SampleComponent));

    expect(screen.getByTestId("title")).toHaveTextContent("CogniCMS Test Harness");
    expect(screen.getByTestId("className").textContent).toBe("a b");
    expect(typeof window).toBe("object");
    expect(typeof document).toBe("object");
  });
});