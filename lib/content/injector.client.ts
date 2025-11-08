/**
 * Client-side content injector using browser's DOMParser
 * This is used for real-time preview updates in the browser
 */

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

type MaybeElement = Element | null;

const HIGHLIGHT_STYLE_MARKER = "data-cognicms-highlight";
const HIGHLIGHT_CLASS = "cognicms-changed";

/**
 * NOTE: Highlighting and "modified" markers are development-only.
 * The client-side injector now strips all cognicms-changed classes and
 * highlight styles from the returned HTML so the preview is clean.
 * markChanged/ensureHighlightStyle remain available for debug tooling only.
 */

export function injectContentIntoHTMLClient(
  html: string,
  content: ContentSchema
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  try {
    updateMetadata(doc, content);

    content.sections.forEach((section) => {
      const target = doc.querySelector(section.selector);

      if (!target) {
        console.warn(`Selector not found: ${section.selector}`);
        return;
      }

      switch (section.type) {
        case "hero":
          injectHero(target, section.content as HeroContent);
          break;
        case "banner":
          injectBanner(target, section.content as BannerContent);
          break;
        case "content":
          injectContentSection(
            target,
            section.content as ContentSectionContent
          );
          break;
        case "team":
          injectTeam(target, section.content as TeamContent);
          break;
        case "events":
          injectEvents(target, section.content as EventsContent);
          break;
        case "form":
          injectForm(target, section.content as FormContent);
          break;
        case "info":
          injectInfo(target, section.content as InfoContent);
          break;
        case "faq":
          injectFAQ(target, section.content as FAQContent);
          break;
        case "contact":
          injectContact(target, section.content as ContactContent);
          break;
        case "footer":
          injectFooter(target, section.content as FooterContent);
          break;
        default:
          console.warn(`Unsupported section type: ${section.type}`);
      }
    });

    // Strip all highlighting artifacts before returning HTML for preview.
    removeHighlightingArtifacts(doc);

    return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
  } catch (error) {
    console.error("Error injecting content:", error);
    return html;
  }
}

function updateMetadata(doc: Document, content: ContentSchema): void {
  setTextContent(doc.querySelector("title"), content.metadata.title);

  const descriptionElement = doc.querySelector('meta[name="description"]');
  setMetaContent(descriptionElement, content.metadata.description);

  if (content.metadata.keywords) {
    setMetaContent(
      doc.querySelector('meta[name="keywords"]'),
      content.metadata.keywords
    );
  }

  const ogTitleElement = doc.querySelector('meta[property="og:title"]');
  const ogTitle =
    content.metadata.ogTitle ??
    ogTitleElement?.getAttribute("content") ??
    content.metadata.title;
  setMetaContent(ogTitleElement, ogTitle);

  const ogDescriptionElement = doc.querySelector(
    'meta[property="og:description"]'
  );
  const ogDescription =
    content.metadata.ogDescription ??
    ogDescriptionElement?.getAttribute("content") ??
    content.metadata.description;
  setMetaContent(ogDescriptionElement, ogDescription);

  const twitterTitleElement = doc.querySelector('meta[name="twitter:title"]');
  const twitterTitle =
    content.metadata.twitterTitle ??
    twitterTitleElement?.getAttribute("content") ??
    content.metadata.title;
  setMetaContent(twitterTitleElement, twitterTitle);

  const twitterDescriptionElement = doc.querySelector(
    'meta[name="twitter:description"]'
  );
  const twitterDescription =
    content.metadata.twitterDescription ??
    twitterDescriptionElement?.getAttribute("content") ??
    content.metadata.description;
  setMetaContent(twitterDescriptionElement, twitterDescription);
}

/**
 * Development-only: injects highlight styles when explicitly used.
 * Not invoked in standard preview flows.
 */
function ensureHighlightStyle(doc: Document): void {
  if (doc.querySelector(`style[${HIGHLIGHT_STYLE_MARKER}]`)) {
    return;
  }

  const style = doc.createElement("style");
  style.setAttribute(HIGHLIGHT_STYLE_MARKER, "true");
  style.textContent = `
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
  doc.head.appendChild(style);
}

/**
 * Removes all highlighting artifacts from the DOM to ensure clean preview HTML.
 */
function removeHighlightingArtifacts(doc: Document): void {
  // Remove highlight marker styles
  doc.querySelectorAll(`style[${HIGHLIGHT_STYLE_MARKER}]`).forEach((node) => {
    node.parentNode?.removeChild(node);
  });

  // Remove highlight classes
  doc.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => {
    el.classList.remove(HIGHLIGHT_CLASS);
    if (!el.className.trim()) {
      el.removeAttribute("class");
    }
  });
}

function injectHero(element: Element, content: HeroContent): void {
  let changed = false;
  changed =
    setTextContent(element.querySelector("h1"), content.heading) || changed;

  const subtitleParagraph = getHeroSubtitle(element);
  changed = setTextContent(subtitleParagraph, content.subheading) || changed;

  const ctaButton =
    element.querySelector<HTMLAnchorElement>(".btn-primary-large");
  changed = setTextContent(ctaButton, content.ctaText) || changed;
  changed = setAttribute(ctaButton, "href", content.ctaUrl) || changed;

  const urgencyText = element.querySelector(".urgency-text");
  changed = setTextContent(urgencyText, content.urgencyText) || changed;

  const logoImage = element.querySelector<HTMLImageElement>(".logo");
  changed = setAttribute(logoImage, "alt", content.logoAlt) || changed;

  if (changed) {
    markChanged(element);
  }
}

function getHeroSubtitle(element: Element): Element | null {
  const paragraphs = Array.from(element.querySelectorAll("p"));
  return (
    paragraphs.find(
      (paragraph) => !paragraph.classList.contains("urgency-text")
    ) ?? null
  );
}

function injectBanner(element: Element, content: BannerContent): void {
  let changed = false;
  changed =
    setTextContent(element.querySelector("strong"), content.heading) || changed;
  const subtitle =
    element.querySelector(".countdown") ?? element.querySelector("p");
  changed = setTextContent(subtitle, content.subtitle) || changed;

  if (changed) {
    markChanged(element);
  }
}

function injectContentSection(
  element: Element,
  content: ContentSectionContent
): void {
  let changed = false;
  changed =
    setTextContent(element.querySelector("h2"), content.heading) || changed;

  const paragraphs = element.querySelectorAll("p");
  content.paragraphs.forEach((paragraphText, index) => {
    const paragraph = paragraphs[index] ?? null;

    if (!paragraph) {
      console.warn(
        `Paragraph index ${index} missing for selector ${element.tagName.toLowerCase()}`
      );
      return;
    }

    changed = setTextContent(paragraph, paragraphText) || changed;
  });

  if (changed) {
    markChanged(element);
  }
}

function injectTeam(element: Element, content: TeamContent): void {
  let sectionChanged = false;
  sectionChanged =
    setTextContent(element.querySelector("h2"), content.heading) ||
    sectionChanged;

  const facilitators = element.querySelectorAll(".facilitator");
  content.members.forEach((member, index) => {
    const facilitator = facilitators[index] ?? null;

    if (!facilitator) {
      console.warn(`Facilitator index ${index} missing for team section`);
      return;
    }

    let changed = false;
    const photo =
      facilitator.querySelector<HTMLImageElement>(".facilitator-photo");
    changed = setAttribute(photo, "src", member.photo) || changed;
    changed = setAttribute(photo, "alt", member.photoAlt) || changed;
    changed =
      setTextContent(facilitator.querySelector("h3"), member.name) || changed;
    changed =
      setTextContent(
        facilitator.querySelector(".facilitator-role"),
        member.role
      ) || changed;
    changed =
      setTextContent(
        facilitator.querySelector(".facilitator-bio"),
        member.bio
      ) || changed;

    if (changed) {
      markChanged(facilitator);
      sectionChanged = true;
    }
  });

  if (sectionChanged) {
    markChanged(element);
  }
}

function injectEvents(element: Element, content: EventsContent): void {
  let sectionChanged = false;
  sectionChanged =
    setTextContent(element.querySelector("h2"), content.heading) ||
    sectionChanged;

  const cards = element.querySelectorAll(".bijeenkomst-card");
  content.events.forEach((event, index) => {
    const card = cards[index] ?? null;

    if (!card) {
      console.warn(`Event card index ${index} missing for events section`);
      return;
    }

    let changed = false;
    changed = setTextContent(card.querySelector("h3"), event.title) || changed;
    changed =
      setTextContent(card.querySelector(".bijeenkomst-datum"), event.date) ||
      changed;
    changed =
      setTextContent(card.querySelector(".availability"), event.availability) ||
      changed;

    const reserveButton = card.querySelector<HTMLAnchorElement>(".btn-reserve");
    if (reserveButton) {
      if (event.reserveLink) {
        changed =
          setAttribute(reserveButton, "href", event.reserveLink) || changed;
      } else {
        // No reserve link provided, remove href to prevent stale URLs.
        if (reserveButton.hasAttribute("href")) {
          reserveButton.removeAttribute("href");
          changed = true;
        }
      }
    } else if (event.reserveLink) {
      console.warn(`Reserve button missing for event ${event.id}`);
    }

    if (typeof event.featured === "boolean") {
      if (card.classList.contains("featured") !== event.featured) {
        card.classList.toggle("featured", event.featured);
        changed = true;
      }

      const badge = card.querySelector<HTMLElement>(".featured-badge");
      if (badge) {
        badge.style.display = event.featured ? "" : "none";
      }
    }

    if (changed) {
      markChanged(card);
      sectionChanged = true;
    }
  });

  if (sectionChanged) {
    markChanged(element);
  }
}

function injectForm(element: Element, content: FormContent): void {
  let changed = false;
  changed =
    setTextContent(element.querySelector("h2"), content.heading) || changed;
  const description = element.querySelector("p");
  changed = setTextContent(description, content.description) || changed;

  const button = element.querySelector<HTMLButtonElement>("button");
  changed = setTextContent(button, content.buttonText) || changed;

  changed =
    setTextContent(
      element.querySelector(".privacy-note"),
      content.privacyNote
    ) || changed;

  if (changed) {
    markChanged(element);
  }
}

function injectInfo(element: Element, content: InfoContent): void {
  let sectionChanged = false;
  sectionChanged =
    setTextContent(element.querySelector("h2"), content.heading) ||
    sectionChanged;

  const items = element.querySelectorAll(".praktisch-item");
  content.infoItems.forEach((item, index) => {
    const itemElement = items[index] ?? null;

    if (!itemElement) {
      console.warn(`Practical info item index ${index} missing`);
      return;
    }

    let changed = false;
    const label = `${item.icon} ${item.label}`.trim();
    changed =
      setTextContent(itemElement.querySelector("strong"), label) || changed;
    changed =
      setMultilineText(itemElement.querySelector("p"), item.value) || changed;

    if (changed) {
      markChanged(itemElement);
      sectionChanged = true;
    }
  });

  const locationHeading = element.querySelector(".location-details h3");
  sectionChanged =
    setTextContent(locationHeading, content.locationHeading) || sectionChanged;

  const map = element.querySelector<HTMLIFrameElement>(".map-container iframe");
  sectionChanged =
    setAttribute(map, "src", content.mapEmbedUrl) || sectionChanged;

  const directions = element.querySelector(".directions");
  if (directions) {
    const doc = directions.ownerDocument;
    if (doc) {
      directions.textContent = "";
      const strong = doc.createElement("strong");
      strong.textContent = content.directionsLabel;
      directions.appendChild(strong);
      directions.appendChild(doc.createTextNode(` ${content.directionsText}`));
      sectionChanged = true;
      markChanged(directions);
    }
  }

  if (sectionChanged) {
    markChanged(element);
  }
}

function injectFAQ(element: Element, content: FAQContent): void {
  let sectionChanged = false;
  sectionChanged =
    setTextContent(element.querySelector("h2"), content.heading) ||
    sectionChanged;

  const faqItems = element.querySelectorAll(".faq-item");
  content.items.forEach((faq, index) => {
    const faqItem = faqItems[index] ?? null;

    if (!faqItem) {
      console.warn(`FAQ item index ${index} missing`);
      return;
    }

    let changed = false;
    changed =
      setTextContent(faqItem.querySelector(".faq-question"), faq.question) ||
      changed;
    changed =
      setTextContent(faqItem.querySelector(".faq-answer"), faq.answer) ||
      changed;

    if (changed) {
      markChanged(faqItem);
      sectionChanged = true;
    }
  });

  if (sectionChanged) {
    markChanged(element);
  }
}

function injectContact(element: Element, content: ContactContent): void {
  let sectionChanged = false;
  sectionChanged =
    setTextContent(element.querySelector("h2"), content.heading) ||
    sectionChanged;
  sectionChanged =
    setTextContent(element.querySelector("p"), content.description) ||
    sectionChanged;

  const buttons =
    element.querySelectorAll<HTMLAnchorElement>(".contact-buttons a");
  content.buttons.forEach((buttonContent, index) => {
    const button = buttons[index] ?? null;

    if (!button) {
      console.warn(`Contact button index ${index} missing`);
      return;
    }

    let changed = false;
    changed = setTextContent(button, buttonContent.text) || changed;
    changed = setAttribute(button, "href", buttonContent.link) || changed;

    if (changed) {
      markChanged(button);
      sectionChanged = true;
    }
  });

  if (sectionChanged) {
    markChanged(element);
  }
}

function injectFooter(element: Element, content: FooterContent): void {
  const paragraphs = element.querySelectorAll("p");
  let changed = false;
  changed = setTextContent(paragraphs[0] ?? null, content.text) || changed;
  changed = setTextContent(paragraphs[1] ?? null, content.email) || changed;

  if (changed) {
    markChanged(element);
  }
}

function setTextContent(target: MaybeElement, value?: string): boolean {
  if (!target || value == null) {
    return false;
  }

  if (target.textContent === value) {
    return false;
  }

  target.textContent = value;
  return true;
}

function setAttribute(
  target: MaybeElement,
  attribute: string,
  value?: string | null
): boolean {
  if (!target || value == null) {
    return false;
  }

  if (target.getAttribute(attribute) === value) {
    return false;
  }

  target.setAttribute(attribute, value);
  return true;
}

function setMetaContent(target: MaybeElement, value?: string): boolean {
  return setAttribute(target, "content", value ?? null);
}

function setMultilineText(target: MaybeElement, value?: string): boolean {
  if (!target || value == null) {
    return false;
  }

  const doc = target.ownerDocument;
  if (!doc) {
    return false;
  }

  const parts = value.split("\n");
  const existing = Array.from(target.childNodes);
  const currentText = existing
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? "")
    .join("\n");

  if (currentText === value) {
    return false;
  }

  while (target.firstChild) {
    target.removeChild(target.firstChild);
  }

  parts.forEach((part, index) => {
    target.appendChild(doc.createTextNode(part));
    if (index < parts.length - 1) {
      target.appendChild(doc.createElement("br"));
    }
  });

  return true;
}

function markChanged(element: Element): void {
  element.classList.add(HIGHLIGHT_CLASS);
}
