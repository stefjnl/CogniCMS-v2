import { ContentSchema } from "@/types/content";
import { parseHTML, getTextContent, getAttributeValue } from "./parser";

/**
 * Extract content from HTML using the provided ContentSchema as a template
 * This is a simplified version - in production, you'd use the selector mappings
 */
export function extractContentFromHTML(html: string, template: ContentSchema): ContentSchema {
  const $ = parseHTML(html);

  // For now, we'll just return the template as-is since we already have content.json
  // In a real implementation, you would parse the HTML and extract content using selectors
  // This function is more useful when you need to sync HTML changes back to JSON

  return template;
}

/**
 * Extract specific field value from HTML using selector
 */
export function extractField(
  html: string,
  selector: string,
  type: "text" | "html" | "attribute" = "text",
  attribute?: string
): string {
  const $ = parseHTML(html);

  if (type === "text") {
    return getTextContent($, selector);
  } else if (type === "html") {
    const element = $(selector);
    return element.html() || "";
  } else if (type === "attribute" && attribute) {
    return getAttributeValue($, selector, attribute);
  }

  return "";
}

/**
 * Detect changes between original HTML and current HTML
 * Returns list of selectors that have different content
 */
export function detectHTMLChanges(
  originalHTML: string,
  currentHTML: string,
  selectors: string[]
): string[] {
  const $original = parseHTML(originalHTML);
  const $current = parseHTML(currentHTML);
  const changedSelectors: string[] = [];

  for (const selector of selectors) {
    const originalContent = $original(selector).html();
    const currentContent = $current(selector).html();

    if (originalContent !== currentContent) {
      changedSelectors.push(selector);
    }
  }

  return changedSelectors;
}
