jest.mock("cheerio", () => ({
  load: (html: string) => {
    const { load } = jest.requireActual("cheerio") as any;
    return load(html);
  },
}));

import {
  parseHTML,
  getTextContent,
  getHTMLContent,
  getAttributeValue,
  setTextContent,
  setHTMLContent,
  setAttributeValue,
  serializeHTML,
  selectorExists,
  countElements,
} from "@/lib/content/parser";

describe("parser utilities", () => {
  const sampleHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test Page</title>
        <meta name="description" content="Desc">
      </head>
      <body>
        <div id="root">
          <h1 class="title">Hello World</h1>
          <p class="lead">Lead text</p>
          <a class="link" href="/test" data-id="123">Click</a>
          <div class="nested">
            <span>Inner</span>
          </div>
        </div>
      </body>
    </html>
  `;

  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  test("parseHTML(html) returns a cheerio instance", () => {
    const $ = parseHTML(sampleHtml);
    expect(typeof $).toBe("function");
    expect($.root().length).toBeGreaterThan(0);
  });

  test("getTextContent($, selector) extracts trimmed text when selector exists", () => {
    const $ = parseHTML(sampleHtml);
    const text = getTextContent($, ".title");
    expect(text).toBe("Hello World");
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  test("getTextContent($, selector) returns empty string and warns when selector missing", () => {
    const $ = parseHTML(sampleHtml);
    const text = getTextContent($, ".missing-selector");
    expect(text).toBe("");
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Selector not found: .missing-selector'
    );
  });

  test("getHTMLContent($, selector) extracts inner HTML when selector exists", () => {
    const $ = parseHTML(sampleHtml);
    const html = getHTMLContent($, ".nested");
    expect(html).toContain("<span>Inner</span>");
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  test("getHTMLContent($, selector) returns empty string and warns when selector missing", () => {
    const $ = parseHTML(sampleHtml);
    const html = getHTMLContent($, ".nope");
    expect(html).toBe("");
    expect(consoleWarnSpy).toHaveBeenCalledWith("Selector not found: .nope");
  });

  test("getAttributeValue($, selector, attribute) returns attribute when present", () => {
    const $ = parseHTML(sampleHtml);
    const href = getAttributeValue($, ".link", "href");
    const dataId = getAttributeValue($, ".link", "data-id");

    expect(href).toBe("/test");
    expect(dataId).toBe("123");
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  test("getAttributeValue($, selector, attribute) returns empty string and warns when selector missing", () => {
    const $ = parseHTML(sampleHtml);
    const value = getAttributeValue($, ".missing", "href");
    expect(value).toBe("");
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Selector not found: .missing"
    );
  });

  test("getAttributeValue($, selector, attribute) returns empty string for missing attribute", () => {
    const $ = parseHTML(sampleHtml);
    const value = getAttributeValue($, ".link", "missing-attr");
    expect(value).toBe("");
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  test("setTextContent($, selector, content) updates text and returns true", () => {
    const $ = parseHTML(sampleHtml);
    const result = setTextContent($, ".title", "Updated");
    expect(result).toBe(true);
    expect(getTextContent($, ".title")).toBe("Updated");
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  test("setTextContent($, selector, content) returns false and warns when selector missing", () => {
    const $ = parseHTML(sampleHtml);
    const result = setTextContent($, ".missing", "Updated");
    expect(result).toBe(false);
    expect(consoleWarnSpy).toHaveBeenCalledWith("Selector not found: .missing");
  });

  test("setHTMLContent($, selector, content) updates HTML and returns true", () => {
    const $ = parseHTML(sampleHtml);
    const result = setHTMLContent($, ".nested", "<em>New</em>");
    expect(result).toBe(true);
    const html = getHTMLContent($, ".nested");
    expect(html).toContain("<em>New</em>");
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  test("setHTMLContent($, selector, content) returns false and warns when selector missing", () => {
    const $ = parseHTML(sampleHtml);
    const result = setHTMLContent($, ".missing", "x");
    expect(result).toBe(false);
    expect(consoleWarnSpy).toHaveBeenCalledWith("Selector not found: .missing");
  });

  test("setAttributeValue($, selector, attribute, value) sets attribute and returns true", () => {
    const $ = parseHTML(sampleHtml);
    const result = setAttributeValue($, ".link", "target", "_blank");
    expect(result).toBe(true);
    expect(getAttributeValue($, ".link", "target")).toBe("_blank");
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  test("setAttributeValue($, selector, attribute, value) returns false and warns when selector missing", () => {
    const $ = parseHTML(sampleHtml);
    const result = setAttributeValue($, ".missing", "target", "_blank");
    expect(result).toBe(false);
    expect(consoleWarnSpy).toHaveBeenCalledWith("Selector not found: .missing");
  });

  test("serializeHTML($) returns serialized HTML string", () => {
    const $ = parseHTML(sampleHtml);
    setTextContent($, ".title", "Serialized");
    const output = serializeHTML($);
    expect(typeof output).toBe("string");
    expect(output).toContain("Serialized");
  });

  test("selectorExists($, selector) returns true/false correctly", () => {
    const $ = parseHTML(sampleHtml);
    expect(selectorExists($, ".title")).toBe(true);
    expect(selectorExists($, ".does-not-exist")).toBe(false);
  });

  test("countElements($, selector) counts matching elements", () => {
    const html = `
      <div class="item">1</div>
      <div class="item">2</div>
      <div class="other">3</div>
    `;
    const $ = parseHTML(html);
    expect(countElements($, ".item")).toBe(2);
    expect(countElements($, ".missing")).toBe(0);
  });

  test("functions handle invalid HTML input gracefully", () => {
    const invalidHtml = "<div>Unclosed";
    const $ = parseHTML(invalidHtml);

    // Cheerio should still parse; our helpers should not throw
    expect(() => getTextContent($, "div")).not.toThrow();
    expect(() => getHTMLContent($, "div")).not.toThrow();
    expect(() => getAttributeValue($, "div", "x")).not.toThrow();
    expect(() => setTextContent($, "div", "x")).not.toThrow();
    expect(() => setHTMLContent($, "div", "<span>x</span>")).not.toThrow();
    expect(() => setAttributeValue($, "div", "x", "y")).not.toThrow();
    expect(() => serializeHTML($)).not.toThrow();
  });
});