jest.mock("cheerio", () => ({
  load: (html: string) => {
    const { load } = jest.requireActual("cheerio") as any;
    return load(html);
  },
}));

import {
  extractContentFromHTML,
  extractField,
  detectHTMLChanges,
} from "@/lib/content/extractor";

describe("extractor utilities", () => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sample</title>
        <meta name="description" content="Desc">
      </head>
      <body>
        <div id="root">
          <h1 class="title">Hello World</h1>
          <p class="lead">Lead text</p>
          <div class="rich">Some <strong>HTML</strong> content</div>
          <a class="link" href="/test" data-id="123">Click</a>
        </div>
      </body>
    </html>
  `;

  const template = {
    metadata: {
      title: "Template Title",
      description: "Template Description",
      keywords: "one,two",
      ogTitle: "OG Title",
      ogDescription: "OG Desc",
      twitterTitle: "Tw Title",
      twitterDescription: "Tw Desc",
    },
    sections: [],
  } as any;

  describe("extractContentFromHTML(html, template)", () => {
    test("returns template unchanged (current implementation contracts)", () => {
      const result = extractContentFromHTML(html, template);
      // Should be exactly the same reference/shape (no mutation of html)
      expect(result).toBe(template);
      expect(result).toEqual(template);
    });
  });

  describe("extractField(html, selector, type, attribute)", () => {
    test("extracts text when type is text", () => {
      const value = extractField(html, ".title", "text");
      expect(value).toBe("Hello World");
    });

    test("extracts HTML when type is html", () => {
      const value = extractField(html, ".rich", "html");
      expect(value).toBe('Some <strong>HTML</strong> content');
    });

    test("extracts attribute when type is attribute and attribute provided", () => {
      const href = extractField(html, ".link", "attribute", "href");
      const dataId = extractField(html, ".link", "attribute", "data-id");
      expect(href).toBe("/test");
      expect(dataId).toBe("123");
    });

    test("returns empty string for missing selector (text/html/attribute)", () => {
      expect(extractField(html, ".missing", "text")).toBe("");
      expect(extractField(html, ".missing", "html")).toBe("");
      expect(extractField(html, ".missing", "attribute", "href")).toBe("");
    });

    test("returns empty string when type is attribute but attribute is not provided", () => {
      const value = extractField(html, ".link", "attribute");
      expect(value).toBe("");
    });

    test("returns empty string for unsupported type", () => {
      const value = extractField(
        html,
        ".title",
        "text" as any /* simulate invalid type */
      );
      // Implementation only handles "text" | "html" | "attribute"
      // anything else should fall through to final `return ""`
      expect(value).toBe("");
    });

    test("handles invalid HTML input gracefully", () => {
      const invalid = "<div>Unclosed";
      expect(() =>
        extractField(invalid, "div", "text")
      ).not.toThrow();
      // Cheerio will still produce a node; ensure we get something string-like
      const value = extractField(invalid, "div", "text");
      expect(typeof value).toBe("string");
    });
  });

  describe("detectHTMLChanges(originalHTML, currentHTML, selectors)", () => {
    const selectors = [".title", ".lead", ".link"];

    test("returns empty array when no selectors change", () => {
      const result = detectHTMLChanges(html, html, selectors);
      expect(result).toEqual([]);
    });

    test("detects changed text content for selector", () => {
      const updated = html.replace(
        '<h1 class="title">Hello World</h1>',
        '<h1 class="title">Updated</h1>'
      );
      const result = detectHTMLChanges(html, updated, selectors);
      expect(result).toContain(".title");
      expect(result).not.toContain(".lead");
      expect(result).not.toContain(".link");
    });

    test("detects changed attribute for selector", () => {
      const updated = html.replace(
        '<a class="link" href="/test" data-id="123">Click</a>',
        '<a class="link" href="/updated" data-id="123">Click</a>'
      );
      const result = detectHTMLChanges(html, updated, selectors);
      expect(result).toContain(".link");
      expect(result).not.toContain(".title");
      expect(result).not.toContain(".lead");
    });

    test("treats missing selector as change when HTML differs", () => {
      // Remove .lead in current HTML
      const updated = html.replace(
        '<p class="lead">Lead text</p>',
        ""
      );
      const result = detectHTMLChanges(html, updated, selectors);
      expect(result).toContain(".lead");
    });

    test("handles empty selectors list", () => {
      const result = detectHTMLChanges(html, html, []);
      expect(result).toEqual([]);
    });

    test("handles invalid HTML inputs without throwing", () => {
      const originalInvalid = "<div>One";
      const currentInvalid = "<div>Two";
      const result = detectHTMLChanges(originalInvalid, currentInvalid, ["div"]);
      // Cheerio will parse; different content should be detected
      expect(result).toEqual(["div"]);
    });
  });
});