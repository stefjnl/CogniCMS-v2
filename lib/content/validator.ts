import { ValidationResult, ValidationError, ValidationWarning } from "@/types/content";
import { parseHTML, selectorExists } from "./parser";
import { contentMappings } from "./mappings";

/**
 * Validate that all selectors in the mappings exist in the HTML
 */
export function validateSelectors(html: string): ValidationResult {
  const $ = parseHTML(html);
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  for (const mapping of contentMappings) {
    const exists = selectorExists($, mapping.selector);

    if (!exists) {
      errors.push({
        path: mapping.path,
        selector: mapping.selector,
        message: `Selector "${mapping.selector}" not found in HTML`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Suggest fixes for broken selectors
 */
export function suggestSelectorFixes(
  html: string,
  brokenSelector: string
): string[] {
  const $ = parseHTML(html);
  const suggestions: string[] = [];

  // Try variations of the selector
  const parts = brokenSelector.split(" ");
  if (parts.length > 1) {
    // Try last part only
    const lastPart = parts[parts.length - 1];
    if (selectorExists($, lastPart)) {
      suggestions.push(lastPart);
    }

    // Try removing nth-of-type
    const withoutNth = brokenSelector.replace(/:nth-of-type\(\d+\)/, "");
    if (withoutNth !== brokenSelector && selectorExists($, withoutNth)) {
      suggestions.push(withoutNth);
    }
  }

  return suggestions;
}

/**
 * Check if HTML structure is valid
 */
export function validateHTMLStructure(html: string): boolean {
  try {
    const $ = parseHTML(html);
    // Basic validation: check for html, head, and body tags
    return (
      $("html").length > 0 &&
      $("head").length > 0 &&
      $("body").length > 0
    );
  } catch (error) {
    return false;
  }
}
