import type {
  BannerContent,
  ContactContent,
  ContentSchema,
  ContentSectionContent,
  EventsContent,
  FAQContent,
  FooterContent,
  FormContent,
  HeroContent,
  InfoContent,
  TeamContent,
} from "@/types/content";
import { parseHTML } from "./parser";
import type { Cheerio, CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";

const HIGHLIGHT_STYLE_MARKER = "data-cognicms-highlight";
const HIGHLIGHT_CLASS = "cognicms-changed";

/**
 * NOTE: Highlighting and "modified" markers are development-only.
 * For preview and persisted HTML we must NOT render any highlight classes or styles.
 * The injector now strips all cognicms-changed classes and highlight styles
 * before returning HTML, while markChanged/ensureHighlightStyle remain available
 * for local/debug tooling.
 */

export function injectContentIntoHTML(
  html: string,
  content: ContentSchema
): string {
  const newline = detectNewline(html);
  const { doctype, markup } = extractDoctype(html);
  const $ = parseHTML(markup);

  try {
    updateMetadata($, content);

    content.sections.forEach((section) => {
      const $section = $(section.selector).first();

      if ($section.length === 0) {
        console.warn(
          `Selector not found: ${section.selector} for section ${section.id}`
        );
        return;
      }

      try {
        switch (section.type) {
          case "hero":
            injectHero($, $section, section.content as HeroContent);
            break;
          case "banner":
            injectBanner($section, section.content as BannerContent);
            break;
          case "content":
            injectContentSection(
              $,
              $section,
              section.content as ContentSectionContent
            );
            break;
          case "team":
            injectTeam($, $section, section.content as TeamContent);
            break;
          case "events":
            injectEvents($, $section, section.content as EventsContent);
            break;
          case "form":
            injectForm($section, section.content as FormContent);
            break;
          case "info":
            injectInfo($, $section, section.content as InfoContent);
            break;
          case "faq":
            injectFAQ($, $section, section.content as FAQContent);
            break;
          case "contact":
            injectContact($, $section, section.content as ContactContent);
            break;
          case "footer":
            injectFooter($section, section.content as FooterContent);
            break;
          default:
            console.warn(`Unknown section type: ${section.type}`);
        }
      } catch (error) {
        console.error(`Error injecting section ${section.id}:`, error);
      }
    });

    // Strip all highlight classes and styles so preview/save HTML is clean.
    removeHighlightingArtifacts($);

    const serializedHtml = $.html();
    const normalizedHtml = normalizeLineEndings(serializedHtml, newline);
    return `${doctype}${normalizedHtml}`;
  } catch (error) {
    console.error("Error injecting content into HTML:", error);
    throw error;
  }
}

function updateMetadata($: CheerioAPI, content: ContentSchema): void {
  const $title = $("title").first();
  setTextContent($title, content.metadata.title);

  const $description = $('meta[name="description"]').first();
  setMetaContent($description, content.metadata.description);

  if (content.metadata.keywords) {
    setMetaContent(
      $('meta[name="keywords"]').first(),
      content.metadata.keywords
    );
  }

  const $ogTitle = $('meta[property="og:title"]').first();
  const ogTitleValue =
    content.metadata.ogTitle ??
    $ogTitle.attr("content") ??
    content.metadata.title;
  setMetaContent($ogTitle, ogTitleValue);

  const $ogDescription = $('meta[property="og:description"]').first();
  const ogDescriptionValue =
    content.metadata.ogDescription ??
    $ogDescription.attr("content") ??
    content.metadata.description;
  setMetaContent($ogDescription, ogDescriptionValue);

  const $twitterTitle = $('meta[name="twitter:title"]').first();
  const twitterTitleValue =
    content.metadata.twitterTitle ??
    $twitterTitle.attr("content") ??
    content.metadata.title;
  setMetaContent($twitterTitle, twitterTitleValue);

  const $twitterDescription = $('meta[name="twitter:description"]').first();
  const twitterDescriptionValue =
    content.metadata.twitterDescription ??
    $twitterDescription.attr("content") ??
    content.metadata.description;
  setMetaContent($twitterDescription, twitterDescriptionValue);
}

/**
 * Development-only: injects highlight styles when called.
 * Not used in preview/save flows; kept for potential debug tooling.
 */
function ensureHighlightStyle($: CheerioAPI): void {
  if ($(`style[${HIGHLIGHT_STYLE_MARKER}]`).length > 0) {
    return;
  }

  const styleContent = `
        .${HIGHLIGHT_CLASS} {
          outline: 3px solid #16a34a !important;
          outline-offset: 2px;
          background-color: rgba(34, 197, 94, 0.1) !important;
          position: relative;
          animation: cognicms-pulse 2s ease-in-out 3;
        }
        @keyframes cognicms-pulse {
          0%, 100% {
            outline-color: #16a34a;
            background-color: rgba(34, 197, 94, 0.1);
          }
          50% {
            outline-color: #22c55e;
            background-color: rgba(34, 197, 94, 0.2);
          }
        }
        .${HIGHLIGHT_CLASS}::after {
          content: "✏️ Modified";
          position: absolute;
          top: -24px;
          left: 0;
          background-color: #16a34a;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          font-family: system-ui, -apple-system, sans-serif;
          white-space: nowrap;
          z-index: 1000;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `;

  const styleTag = `<style ${HIGHLIGHT_STYLE_MARKER}="true">${styleContent}</style>`;
  $("head").append(styleTag);
}

/**
 * Removes all highlighting artifacts from the DOM to ensure clean HTML output.
 */
function removeHighlightingArtifacts($: CheerioAPI): void {
  // Remove highlight marker styles
  $(`style[${HIGHLIGHT_STYLE_MARKER}]`).remove();
  // Remove highlight classes from all elements
  $(`.${HIGHLIGHT_CLASS}`).each((_idx, el) => {
    const $el = $(el);
    $el.removeClass(HIGHLIGHT_CLASS);
    // Clean up empty class attributes
    if ($el.attr("class") === "") {
      $el.removeAttr("class");
    }
  });
}

function injectHero(
  $: CheerioAPI,
  $section: Cheerio<AnyNode>,
  content: HeroContent
): void {
  let changed = false;
  changed =
    setTextContent($section.find("h1").first(), content.heading) || changed;

  const $subtitle = $section
    .find("p")
    .filter((_index: number, el: AnyNode) => !$(el).hasClass("urgency-text"))
    .first();
  changed = setTextContent($subtitle, content.subheading) || changed;

  const $ctaButton = $section.find(".btn-primary-large, .hero-cta a").first();
  changed = setTextContent($ctaButton, content.ctaText) || changed;
  changed = setAttribute($ctaButton, "href", content.ctaUrl) || changed;

  const $urgency = $section.find(".urgency-text").first();
  changed = setTextContent($urgency, content.urgencyText) || changed;

  const $logo = $section.find("img.logo").first().length
    ? $section.find("img.logo").first()
    : $section.find(".logo").first();
  changed = setAttribute($logo, "alt", content.logoAlt) || changed;

  if (changed) {
    markChanged($section);
  }
}

function injectBanner(
  $section: Cheerio<AnyNode>,
  content: BannerContent
): void {
  let changed = false;
  changed =
    setTextContent($section.find("strong, h2, h3").first(), content.heading) ||
    changed;

  const $subtitle =
    $section.find(".countdown").first().length > 0
      ? $section.find(".countdown").first()
      : $section.find("p").first();
  changed = setTextContent($subtitle, content.subtitle) || changed;

  if (changed) {
    markChanged($section);
  }
}

function injectContentSection(
  $: CheerioAPI,
  $section: Cheerio<AnyNode>,
  content: ContentSectionContent
): void {
  let sectionChanged = false;
  sectionChanged =
    setTextContent($section.find("h2, h3").first(), content.heading) ||
    sectionChanged;

  const existingParagraphs = $section.find("p");
  const targetCount = content.paragraphs.length;

  if (existingParagraphs.length > targetCount) {
    existingParagraphs.slice(targetCount).remove();
    sectionChanged = true;
  }

  if (existingParagraphs.length < targetCount) {
    const template = existingParagraphs.last();
    for (let i = existingParagraphs.length; i < targetCount; i += 1) {
      if (template.length) {
        const clone = template.clone();
        clone.text("");
        clone.removeClass(HIGHLIGHT_CLASS);
        template.after(clone);
      } else {
        $section.append("<p></p>");
      }
    }
    sectionChanged = true;
  }

  $section.find("p").each((index: number, element: AnyNode) => {
    if (index >= targetCount) {
      return;
    }
    const paragraphChanged = setTextContent(
      $(element),
      content.paragraphs[index]
    );
    if (paragraphChanged) {
      markChanged($(element));
      sectionChanged = true;
    }
  });

  if (sectionChanged) {
    markChanged($section);
  }
}

function injectTeam(
  $: CheerioAPI,
  $section: Cheerio<AnyNode>,
  content: TeamContent
): void {
  let sectionChanged = false;
  sectionChanged =
    setTextContent($section.find("h2").first(), content.heading) ||
    sectionChanged;

  const $grid = $section.find(".facilitator-grid").first();
  const container = $grid.length > 0 ? $grid : $section;
  let facilitators = container.children(".facilitator");

  const desiredCount = content.members.length;

  if (facilitators.length > desiredCount) {
    facilitators.slice(desiredCount).remove();
    sectionChanged = true;
  }

  if (facilitators.length < desiredCount) {
    const template = facilitators.last();
    for (let index = facilitators.length; index < desiredCount; index += 1) {
      if (template.length) {
        const clone = template.clone();
        clone.removeClass(HIGHLIGHT_CLASS);
        clone.find(`.${HIGHLIGHT_CLASS}`).removeClass(HIGHLIGHT_CLASS);
        container.append(clone);
      } else {
        const fallback = $(`
            <div class="facilitator">
              <div class="facilitator-photo"></div>
              <h3></h3>
              <div class="facilitator-role"></div>
              <p class="facilitator-bio"></p>
            </div>
          `);
        container.append(fallback);
      }
    }
    sectionChanged = true;
  }

  facilitators = container.children(".facilitator");
  content.members.forEach((member, index) => {
    const $item = facilitators.eq(index);
    if ($item.length === 0) {
      return;
    }

    let changed = false;
    const $photo = $item.find(".facilitator-photo").first();
    changed = setAttribute($photo, "src", member.photo) || changed;
    changed = setAttribute($photo, "alt", member.photoAlt) || changed;
    changed = setTextContent($item.find("h3").first(), member.name) || changed;
    changed =
      setTextContent($item.find(".facilitator-role").first(), member.role) ||
      changed;
    changed =
      setTextContent($item.find(".facilitator-bio").first(), member.bio) ||
      changed;

    if (changed) {
      markChanged($item);
      sectionChanged = true;
    }
  });

  if (sectionChanged) {
    markChanged(container);
    markChanged($section);
  }
}

function injectEvents(
  $: CheerioAPI,
  $section: Cheerio<AnyNode>,
  content: EventsContent
): void {
  let sectionChanged = false;
  sectionChanged =
    setTextContent($section.find("h2").first(), content.heading) ||
    sectionChanged;

  const container = $section;
  let cards = container.children(".bijeenkomst-card");
  const desiredCount = content.events.length;

  if (cards.length > desiredCount) {
    cards.slice(desiredCount).remove();
    sectionChanged = true;
  }

  if (cards.length < desiredCount) {
    const template = cards.last();
    for (let index = cards.length; index < desiredCount; index += 1) {
      if (template.length) {
        const clone = template.clone();
        clone.removeClass(HIGHLIGHT_CLASS);
        clone.find(`.${HIGHLIGHT_CLASS}`).removeClass(HIGHLIGHT_CLASS);
        container.append(clone);
      } else {
        const fallback = $(`
            <div class="bijeenkomst-card">
              <h3></h3>
              <div class="bijeenkomst-datum"></div>
              <div class="availability"></div>
            </div>
          `);
        container.append(fallback);
      }
    }
    sectionChanged = true;
  }

  cards = container.children(".bijeenkomst-card");
  content.events.forEach((event, index) => {
    const $card = cards.eq(index);
    if ($card.length === 0) {
      return;
    }

    let changed = false;
    changed = setTextContent($card.find("h3").first(), event.title) || changed;
    const $date = $card.find(".bijeenkomst-datum").first();
    if ($date.length > 0) {
      const desiredDate = preserveLeadingSymbols($date.text(), event.date);
      changed = setTextContent($date, desiredDate) || changed;
    }
    changed =
      setTextContent($card.find(".availability").first(), event.availability) ||
      changed;

    const $reserveButton = $card.find(".btn-reserve").first();
    if (event.reserveLink) {
      const buttonExists = $reserveButton.length > 0;
      const $button = buttonExists ? $reserveButton : $("<a></a>");
      let buttonChanged = false;
      buttonChanged =
        setAttribute($button, "href", event.reserveLink) || buttonChanged;
      if (!$button.hasClass("btn-reserve")) {
        $button.addClass("btn-reserve");
        buttonChanged = true;
      }

      const existingText = $button.text();
      const fallbackText = "Reserveer je plek \u2192";
      const buttonText = buttonExists ? existingText : fallbackText;
      buttonChanged = setTextContent($button, buttonText) || buttonChanged;

      if (!buttonExists) {
        $card.append($button);
        buttonChanged = true;
      }

      changed = buttonChanged || changed;
    } else if ($reserveButton.length > 0) {
      $reserveButton.remove();
      changed = true;
    }

    if (event.featured) {
      if (!$card.hasClass("featured")) {
        $card.addClass("featured");
        changed = true;
      }
      if ($card.find(".featured-badge").length === 0) {
        $card.prepend('<span class="featured-badge">Eerstvolgende</span>');
        changed = true;
      }
    } else {
      if ($card.hasClass("featured")) {
        $card.removeClass("featured");
        changed = true;
      }
      if ($card.find(".featured-badge").length > 0) {
        $card.find(".featured-badge").remove();
        changed = true;
      }
    }

    if (changed) {
      markChanged($card);
      sectionChanged = true;
    }
  });

  if (sectionChanged) {
    markChanged($section);
  }
}

function injectForm($section: Cheerio<AnyNode>, content: FormContent): void {
  let changed = false;
  changed =
    setTextContent($section.find("h2").first(), content.heading) || changed;

  const $description = $section.find("p").first();
  changed = setTextContent($description, content.description) || changed;

  const $button = $section.find("button, .newsletter-form button").first();
  changed = setTextContent($button, content.buttonText) || changed;

  const $privacy = $section.find(".privacy-note").first();
  changed = setTextContent($privacy, content.privacyNote) || changed;

  if (changed) {
    markChanged($section);
  }
}

function injectInfo(
  $: CheerioAPI,
  $section: Cheerio<AnyNode>,
  content: InfoContent
): void {
  let sectionChanged = false;
  sectionChanged =
    setTextContent($section.find("h2").first(), content.heading) ||
    sectionChanged;

  const container = $section.find(".praktisch-grid, .info-list").first();
  const itemsContainer = container.length > 0 ? container : $section;
  let items = itemsContainer.children(".praktisch-item, .info-item");
  const desiredCount = content.infoItems.length;

  if (items.length > desiredCount) {
    items.slice(desiredCount).remove();
    sectionChanged = true;
  }

  if (items.length < desiredCount) {
    const template = items.last();
    for (let index = items.length; index < desiredCount; index += 1) {
      if (template.length) {
        const clone = template.clone();
        clone.removeClass(HIGHLIGHT_CLASS);
        clone.find(`.${HIGHLIGHT_CLASS}`).removeClass(HIGHLIGHT_CLASS);
        itemsContainer.append(clone);
      } else {
        const fallback = $(`
            <div class="praktisch-item">
              <strong></strong>
              <p></p>
            </div>
          `);
        itemsContainer.append(fallback);
      }
    }
    sectionChanged = true;
  }

  items = itemsContainer.children(".praktisch-item, .info-item");
  content.infoItems.forEach((item, index) => {
    const $item = items.eq(index);
    if ($item.length === 0) {
      return;
    }

    let changed = false;
    const labelText = `${item.icon} ${item.label}`.trim();
    const $label = $item.find("strong").first();
    changed = setTextContent($label, labelText) || changed;

    const $value = $item.find("p").first();
    changed = setMultilineText($, $value, item.value) || changed;

    if (changed) {
      markChanged($item);
      sectionChanged = true;
    }
  });

  const $locationHeading = $section.find(".location-details h3").first();
  if ($locationHeading.length > 0) {
    const changed = setTextContent($locationHeading, content.locationHeading);
    if (changed) {
      markChanged($locationHeading);
      sectionChanged = true;
    }
  }

  const $map = $section.find(".map-container iframe").first();
  if ($map.length > 0) {
    const changed = setAttribute($map, "src", content.mapEmbedUrl);
    if (changed) {
      sectionChanged = true;
    }
  }

  const $directions = $section.find(".directions").first();
  if ($directions.length > 0) {
    const existingCombined = collapseWhitespace($directions.text());
    const incomingCombined = collapseWhitespace(
      `${content.directionsLabel} ${content.directionsText}`
    );
    if (existingCombined !== incomingCombined) {
      const html = `<strong>${escapeHTML(
        content.directionsLabel
      )}</strong> ${escapeHTML(content.directionsText)}`;
      if ($directions.html() !== html) {
        $directions.html(html);
      }
      markChanged($directions);
      sectionChanged = true;
    }
  }

  if (sectionChanged) {
    markChanged($section);
  }
}

function injectFAQ(
  $: CheerioAPI,
  $section: Cheerio<AnyNode>,
  content: FAQContent
): void {
  let sectionChanged = false;
  sectionChanged =
    setTextContent($section.find("h2").first(), content.heading) ||
    sectionChanged;

  let items = $section.children(".faq-item");
  const desiredCount = content.items.length;

  if (items.length > desiredCount) {
    items.slice(desiredCount).remove();
    sectionChanged = true;
  }

  if (items.length < desiredCount) {
    const template = items.last();
    for (let index = items.length; index < desiredCount; index += 1) {
      if (template.length) {
        const clone = template.clone();
        clone.removeClass(HIGHLIGHT_CLASS);
        clone.find(`.${HIGHLIGHT_CLASS}`).removeClass(HIGHLIGHT_CLASS);
        $section.append(clone);
      } else {
        const fallback = $(`
            <div class="faq-item">
              <div class="faq-question"></div>
              <div class="faq-answer"></div>
            </div>
          `);
        $section.append(fallback);
      }
    }
    sectionChanged = true;
  }

  items = $section.children(".faq-item");
  content.items.forEach((item, index) => {
    const $item = items.eq(index);
    if ($item.length === 0) {
      return;
    }

    let changed = false;
    changed =
      setTextContent($item.find(".faq-question").first(), item.question) ||
      changed;
    changed =
      setTextContent($item.find(".faq-answer").first(), item.answer) || changed;

    if (changed) {
      markChanged($item);
      sectionChanged = true;
    }
  });

  if (sectionChanged) {
    markChanged($section);
  }
}

function injectContact(
  $: CheerioAPI,
  $section: Cheerio<AnyNode>,
  content: ContactContent
): void {
  let sectionChanged = false;

  // Only consider heading/description "changed" when content differs.
  if (
    setTextContent($section.find("h2").first(), content.heading) ||
    setTextContent($section.find("p").first(), content.description)
  ) {
    sectionChanged = true;
  }

  const container = $section.find(".contact-buttons").first();
  const buttonsContainer = container.length > 0 ? container : $section;
  const buttons = buttonsContainer.find("a.btn-contact, a.btn");
  const desiredCount = content.buttons.length;

  // Clamp to existing number of buttons to preserve original structure/labels.
  // The Zincafé template has three buttons (two links + one copy button).
  // We must not remove or create nodes when mapping JSON, otherwise we diverge.
  const maxAdjustable = Math.min(buttons.length, desiredCount);

  // Only update existing buttons up to maxAdjustable, without structural edits.
  for (let index = 0; index < maxAdjustable; index += 1) {
    const $button = buttons.eq(index);
    const config = content.buttons[index];
    if (!$button || $button.length === 0 || !config) {
      continue;
    }

    let changed = false;

    // Preserve any leading icon/emoji and aria-label; only align main text if different.
    const existingText = $button.text();
    const normalizedExisting = collapseWhitespace(existingText.replace(/^[^\w\d]*\s*/u, ""));
    const normalizedIncoming = collapseWhitespace(config.text.replace(/^[^\w\d]*\s*/u, ""));
    if (normalizedExisting !== normalizedIncoming) {
      changed = setTextContent($button, config.text) || changed;
    }

    // Only touch href when it actually differs.
    changed = setAttribute($button, "href", config.link) || changed;

    if (changed) {
      markChanged($button);
      sectionChanged = true;
    }
  }

  if (sectionChanged) {
    markChanged($section);
  }
}

function injectFooter(
  $section: Cheerio<AnyNode>,
  content: FooterContent
): void {
  let changed = false;
  const paragraphs = $section.find("p");
  if (paragraphs.length > 0) {
    changed = setTextContent(paragraphs.eq(0), content.text) || changed;
  }
  if (paragraphs.length > 1) {
    changed = setTextContent(paragraphs.eq(1), content.email) || changed;
  }

  if (changed) {
    markChanged($section);
  }
}

export function extractContentFromHTML(
  _html: string,
  template: ContentSchema
): ContentSchema {
  return template;
}

function setTextContent(target: MaybeSelection, value?: string): boolean {
  if (!target || target.length === 0 || value == null) {
    return false;
  }

  if (target.text() === value) {
    return false;
  }

  target.text(value);
  return true;
}

function setAttribute(
  target: MaybeSelection,
  attribute: string,
  value?: string | null
): boolean {
  if (!target || target.length === 0) {
    return false;
  }

  if (value == null) {
    if (target.attr(attribute) === undefined) {
      return false;
    }
    target.removeAttr(attribute);
    return true;
  }

  if (target.attr(attribute) === value) {
    return false;
  }

  target.attr(attribute, value);
  return true;
}

function setMetaContent(target: MaybeSelection, value?: string): boolean {
  return setAttribute(target, "content", value ?? null);
}

function setMultilineText(
  $: CheerioAPI,
  target: MaybeSelection,
  value?: string
): boolean {
  if (!target || target.length === 0 || value == null) {
    return false;
  }

  const escapedLines = value
    .split("\n")
    .map((line) => escapeHTML(line))
    .join("<br>");

  if (target.html() === escapedLines) {
    return false;
  }

  target.html(escapedLines);
  return true;
}

function markChanged(target: MaybeSelection): void {
  if (!target || target.length === 0) {
    return;
  }
  target.addClass(HIGHLIGHT_CLASS);
}

function preserveLeadingSymbols(
  existingText: string,
  nextValue: string
): string {
  const prefix = extractLeadingSymbols(existingText);
  if (prefix.trim().length === 0) {
    return nextValue;
  }

  const normalizedNext = nextValue.trimStart();
  if (normalizedNext.startsWith(prefix.trim())) {
    return nextValue;
  }

  return `${prefix}${normalizedNext}`;
}

function extractLeadingSymbols(value: string): string {
  let prefix = "";
  for (const char of value) {
    if (isAlphaNumeric(char)) {
      break;
    }
    prefix += char;
  }
  return prefix;
}

function isAlphaNumeric(char: string): boolean {
  if (!char) {
    return false;
  }
  const code = char.codePointAt(0);
  if (code == null) {
    return false;
  }
  if (code >= 48 && code <= 57) {
    return true;
  }
  const lower = char.toLowerCase();
  const upper = char.toUpperCase();
  return lower !== upper;
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function escapeHTML(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractDoctype(html: string): { doctype: string; markup: string } {
  const doctypeMatch = html.match(/^<!DOCTYPE[^>]*>/i);
  if (!doctypeMatch) {
    return { doctype: "", markup: html };
  }
  const doctype = doctypeMatch[0];
  const markup = html.slice(doctype.length);
  return { doctype, markup };
}

type MaybeSelection = Cheerio<AnyNode> | null | undefined;

function detectNewline(value: string): "\r\n" | "\n" {
  return value.includes("\r\n") ? "\r\n" : "\n";
}

function normalizeLineEndings(value: string, newline: "\r\n" | "\n"): string {
  if (newline === "\r\n") {
    return value.replace(/\r?\n/g, "\r\n");
  }
  return value.replace(/\r\n/g, "\n");
}
