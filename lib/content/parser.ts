import * as cheerio from "cheerio";
import { ContentSchema } from "@/types/content";
import { contentMappings } from "./mappings";

/**
 * Parse HTML string into a Cheerio object for manipulation
 */
export function parseHTML(html: string): cheerio.CheerioAPI {
  return cheerio.load(html, {
    decodeEntities: false, // Preserve HTML entities
    _useHtmlParser2: true, // Use html-parser2 for better HTML5 support
  });
}

/**
 * Get text content from an element using a CSS selector
 */
export function getTextContent($: cheerio.CheerioAPI, selector: string): string {
  const element = $(selector);
  if (element.length === 0) {
    console.warn(`Selector not found: ${selector}`);
    return "";
  }
  return element.text().trim();
}

/**
 * Get HTML content from an element using a CSS selector
 */
export function getHTMLContent($: cheerio.CheerioAPI, selector: string): string {
  const element = $(selector);
  if (element.length === 0) {
    console.warn(`Selector not found: ${selector}`);
    return "";
  }
  return element.html() || "";
}

/**
 * Get attribute value from an element using a CSS selector
 */
export function getAttributeValue(
  $: cheerio.CheerioAPI,
  selector: string,
  attribute: string
): string {
  const element = $(selector);
  if (element.length === 0) {
    console.warn(`Selector not found: ${selector}`);
    return "";
  }
  return element.attr(attribute) || "";
}

/**
 * Set text content for an element using a CSS selector
 */
export function setTextContent(
  $: cheerio.CheerioAPI,
  selector: string,
  content: string
): boolean {
  const element = $(selector);
  if (element.length === 0) {
    console.warn(`Selector not found: ${selector}`);
    return false;
  }
  element.text(content);
  return true;
}

/**
 * Set HTML content for an element using a CSS selector
 */
export function setHTMLContent(
  $: cheerio.CheerioAPI,
  selector: string,
  content: string
): boolean {
  const element = $(selector);
  if (element.length === 0) {
    console.warn(`Selector not found: ${selector}`);
    return false;
  }
  element.html(content);
  return true;
}

/**
 * Set attribute value for an element using a CSS selector
 */
export function setAttributeValue(
  $: cheerio.CheerioAPI,
  selector: string,
  attribute: string,
  value: string
): boolean {
  const element = $(selector);
  if (element.length === 0) {
    console.warn(`Selector not found: ${selector}`);
    return false;
  }
  element.attr(attribute, value);
  return true;
}

/**
 * Convert Cheerio object back to HTML string
 */
export function serializeHTML($: cheerio.CheerioAPI): string {
  return $.html();
}

/**
 * Validate that a selector exists in the HTML
 */
export function selectorExists($: cheerio.CheerioAPI, selector: string): boolean {
  return $(selector).length > 0;
}

/**
 * Count how many elements match a selector
 */
export function countElements($: cheerio.CheerioAPI, selector: string): number {
  return $(selector).length;
}
