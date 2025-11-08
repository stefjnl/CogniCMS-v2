import { ContentSchema, Section, SelectorMapping } from "@/types/content";
import {
  parseHTML,
  setTextContent,
  setHTMLContent,
  setAttributeValue,
  serializeHTML,
} from "./parser";
import { contentMappings } from "./mappings";

/**
 * Inject content from ContentSchema into HTML template
 * Returns updated HTML string
 */
export function injectContentIntoHTML(
  htmlTemplate: string,
  content: ContentSchema
): string {
  const $ = parseHTML(htmlTemplate);

  // Inject metadata
  if (content.metadata) {
    setTextContent($, "title", content.metadata.title);
    setAttributeValue($, 'meta[name="description"]', "content", content.metadata.description);
  }

  // Inject each section's content
  for (const section of content.sections) {
    injectSection($, section);
  }

  return serializeHTML($);
}

/**
 * Inject a single section's content into the HTML
 */
function injectSection($: cheerio.CheerioAPI, section: Section) {
  const sectionId = section.id;
  const content = section.content;

  switch (section.type) {
    case "hero":
      injectHeroContent($, content as any);
      break;
    case "banner":
      injectBannerContent($, content as any);
      break;
    case "content":
      injectContentSection($, sectionId, content as any);
      break;
    case "team":
      injectTeamContent($, content as any);
      break;
    case "events":
      injectEventsContent($, content as any);
      break;
    case "form":
      injectFormContent($, content as any);
      break;
    case "info":
      injectInfoContent($, content as any);
      break;
    case "faq":
      injectFAQContent($, content as any);
      break;
    case "contact":
      injectContactContent($, content as any);
      break;
    case "footer":
      injectFooterContent($, content as any);
      break;
  }
}

// Type-specific injection functions
function injectHeroContent($: cheerio.CheerioAPI, content: any) {
  setTextContent($, "header h1", content.heading);
  setTextContent($, "header > p", content.subheading);
  setTextContent($, "header .btn-primary-large", content.ctaText);
  setAttributeValue($, "header .btn-primary-large", "href", content.ctaUrl);
  setTextContent($, "header .urgency-text", content.urgencyText);
  setAttributeValue($, "header .logo", "alt", content.logoAlt);
}

function injectBannerContent($: cheerio.CheerioAPI, content: any) {
  setTextContent($, ".next-event-banner strong", content.heading);
  setTextContent($, ".next-event-banner .countdown", content.subtitle);
}

function injectContentSection($: cheerio.CheerioAPI, sectionId: string, content: any) {
  const selector = `.${sectionId}`;
  setTextContent($, `${selector} h2`, content.heading);

  if (content.paragraphs && Array.isArray(content.paragraphs)) {
    content.paragraphs.forEach((para: string, index: number) => {
      setTextContent($, `${selector} p:nth-of-type(${index + 1})`, para);
    });
  }
}

function injectTeamContent($: cheerio.CheerioAPI, content: any) {
  setTextContent($, ".facilitators h2", content.heading);

  if (content.members && Array.isArray(content.members)) {
    content.members.forEach((member: any, index: number) => {
      const memberSelector = `.facilitator:nth-of-type(${index + 1})`;
      setTextContent($, `${memberSelector} h3`, member.name);
      setTextContent($, `${memberSelector} .facilitator-role`, member.role);
      setTextContent($, `${memberSelector} .facilitator-bio`, member.bio);
      setAttributeValue($, `${memberSelector} .facilitator-photo`, "alt", member.photoAlt);
    });
  }
}

function injectEventsContent($: cheerio.CheerioAPI, content: any) {
  setTextContent($, ".bijeenkomsten h2", content.heading);

  if (content.events && Array.isArray(content.events)) {
    content.events.forEach((event: any, index: number) => {
      const eventSelector = `.bijeenkomst-card:nth-of-type(${index + 1})`;
      setTextContent($, `${eventSelector} h3`, event.title);
      setTextContent($, `${eventSelector} .bijeenkomst-datum`, event.date);
      setTextContent($, `${eventSelector} .availability`, event.availability);
    });
  }
}

function injectFormContent($: cheerio.CheerioAPI, content: any) {
  setTextContent($, ".newsletter h2", content.heading);
  setTextContent($, ".newsletter > p", content.description);
  setTextContent($, ".newsletter-form button", content.buttonText);
  setTextContent($, ".newsletter .privacy-note", content.privacyNote);
}

function injectInfoContent($: cheerio.CheerioAPI, content: any) {
  setTextContent($, ".praktisch h2", content.heading);

  if (content.infoItems && Array.isArray(content.infoItems)) {
    content.infoItems.forEach((item: any, index: number) => {
      const itemSelector = `.praktisch-item:nth-of-type(${index + 1})`;
      setTextContent($, `${itemSelector} strong`, item.label);
      if (item.value.includes("\n")) {
        setHTMLContent($, `${itemSelector} p`, item.value.replace(/\n/g, "<br>"));
      } else {
        setTextContent($, `${itemSelector} p`, item.value);
      }
    });
  }

  setTextContent($, ".location-details h3", content.locationHeading);
  setTextContent($, ".directions strong", content.directionsLabel);
}

function injectFAQContent($: cheerio.CheerioAPI, content: any) {
  setTextContent($, ".faq h2", content.heading);

  if (content.items && Array.isArray(content.items)) {
    content.items.forEach((item: any, index: number) => {
      const itemSelector = `.faq-item:nth-of-type(${index + 1})`;
      setTextContent($, `${itemSelector} .faq-question`, item.question);
      setTextContent($, `${itemSelector} .faq-answer`, item.answer);
    });
  }
}

function injectContactContent($: cheerio.CheerioAPI, content: any) {
  setTextContent($, ".contact h2", content.heading);
  setTextContent($, ".contact > p", content.description);
}

function injectFooterContent($: cheerio.CheerioAPI, content: any) {
  setTextContent($, "footer p:first-child", content.text);
  setTextContent($, "footer p:last-child", content.email);
}

/**
 * Add visual indicators to modified elements
 * Adds a CSS class to elements that have been changed
 */
export function highlightChangedElements(
  html: string,
  changedSelectors: string[]
): string {
  const $ = parseHTML(html);

  for (const selector of changedSelectors) {
    $(selector).addClass("cognicms-changed");
  }

  return serializeHTML($);
}

/**
 * Remove visual indicators from all elements
 */
export function removeHighlights(html: string): string {
  const $ = parseHTML(html);
  $(".cognicms-changed").removeClass("cognicms-changed");
  return serializeHTML($);
}
