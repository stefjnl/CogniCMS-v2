jest.mock("cheerio", () => ({
  load: (html: string) => {
    const { load } = jest.requireActual("cheerio") as any;
    return load(html);
  },
}));

import {
  validateSelectors,
  suggestSelectorFixes,
  validateHTMLStructure,
} from "@/lib/content/validator";

jest.mock("@/lib/content/mappings", () => ({
  contentMappings: [
    {
      path: "metadata.title",
      selector: "title",
    },
    {
      path: "hero.heading",
      selector: "#hero h1",
    },
    {
      path: "missing.example",
      selector: ".missing-required",
    },
  ],
}));

describe("validator utilities", () => {
  const validHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Page Title</title>
        <meta name="description" content="Description">
      </head>
      <body>
        <section id="hero">
          <h1>Hero</h1>
        </section>
        <div class="exists"></div>
      </body>
    </html>
  `;

  const invalidStructureHtml = `
    <div>No html/head/body tags at root level</div>
  `;

  describe("validateSelectors(html)", () => {
    test("returns valid=true when all mapping selectors exist", () => {
      // All mocked mappings except .missing-required are present in this HTML.
      const html = `
        <html>
          <head><title>Ok</title></head>
          <body>
            <section id="hero"><h1>Hero</h1></section>
            <div class="missing-required"></div>
          </body>
        </html>
      `;

      const result = validateSelectors(html);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    test("returns errors for selectors that do not exist", () => {
      const result = validateSelectors(validHtml);

      expect(result.valid).toBe(false);
      // Only ".missing-required" should fail based on our mock mappings
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toMatchObject({
        path: "missing.example",
        selector: ".missing-required",
      });
      expect(result.errors[0].message).toContain(
        'Selector ".missing-required" not found in HTML'
      );
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe("suggestSelectorFixes(html, brokenSelector)", () => {
    const html = `
      <html>
        <body>
          <div class="wrapper">
            <span class="target"></span>
            <div class="item"></div>
            <div class="item"></div>
          </div>
        </body>
      </html>
    `;

    test("returns last part of selector when it exists in DOM", () => {
      const broken = ".wrapper .target";
      const suggestions = suggestSelectorFixes(html, broken);
      expect(suggestions).toContain(".target");
    });

    test("suggests selector without :nth-of-type when such variant exists", () => {
      const broken = ".wrapper .item:nth-of-type(2)";
      const suggestions = suggestSelectorFixes(html, broken);
      expect(suggestions).toContain(".wrapper .item");
    });

    test("returns empty array when no suggestions applicable", () => {
      const broken = ".does-not-exist";
      const suggestions = suggestSelectorFixes(html, broken);
      expect(suggestions).toEqual([]);
    });

    test("handles single-part selectors gracefully (no split-based suggestions)", () => {
      const broken = ".wrapper";
      const suggestions = suggestSelectorFixes(html, broken);
      expect(suggestions).toEqual([]);
    });
  });

  describe("validateHTMLStructure(html)", () => {
    test("returns true for structurally valid HTML", () => {
      const result = validateHTMLStructure(validHtml);
      expect(result).toBe(true);
    });

    test("returns false when required structural tags are missing", () => {
      const result = validateHTMLStructure(invalidStructureHtml);
      expect(result).toBe(false);
    });

    test("returns false when parseHTML throws (very malformed input)", () => {
      // validateHTMLStructure wraps parseHTML in try/catch and returns false on error.
      // To simulate parse error, temporarily mock parseHTML to throw.
      jest.resetModules();
      jest.doMock("@/lib/content/parser", () => ({
        parseHTML: () => {
          throw new Error("Parse error");
        },
      }));
      // Re-require validator with mocked parser
      const { validateHTMLStructure: mockedValidate } = require("@/lib/content/validator");

      expect(mockedValidate("<html>")).toBe(false);

      // Restore real modules for remaining tests
      jest.dontMock("@/lib/content/parser");
      jest.resetModules();
    });
  });
});