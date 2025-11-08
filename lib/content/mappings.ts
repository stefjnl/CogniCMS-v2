import { SelectorMapping } from "@/types/content";

/**
 * Content mappings connect content.json fields to HTML elements via CSS selectors
 * Format: "jsonPath" -> "cssSelector"
 */
export const contentMappings: SelectorMapping[] = [
  // Metadata
  { path: "metadata.title", selector: "title", type: "text" },
  { path: "metadata.description", selector: 'meta[name="description"]', attribute: "content", type: "attribute" },

  // Hero Section
  { path: "sections[hero].content.heading", selector: "header h1", type: "text" },
  { path: "sections[hero].content.subheading", selector: "header > p", type: "text" },
  { path: "sections[hero].content.ctaText", selector: "header .btn-primary-large", type: "text" },
  { path: "sections[hero].content.ctaUrl", selector: "header .btn-primary-large", attribute: "href", type: "attribute" },
  { path: "sections[hero].content.urgencyText", selector: "header .urgency-text", type: "text" },
  { path: "sections[hero].content.logoAlt", selector: "header .logo", attribute: "alt", type: "attribute" },

  // Next Event Banner
  { path: "sections[next-event].content.heading", selector: ".next-event-banner strong", type: "text" },
  { path: "sections[next-event].content.subtitle", selector: ".next-event-banner .countdown", type: "text" },

  // Intro Section
  { path: "sections[intro].content.heading", selector: ".intro h2", type: "text" },
  { path: "sections[intro].content.paragraphs[0]", selector: ".intro p:nth-of-type(1)", type: "text" },
  { path: "sections[intro].content.paragraphs[1]", selector: ".intro p:nth-of-type(2)", type: "text" },
  { path: "sections[intro].content.paragraphs[2]", selector: ".intro p:nth-of-type(3)", type: "text" },
  { path: "sections[intro].content.paragraphs[3]", selector: ".intro p:nth-of-type(4)", type: "text" },
  { path: "sections[intro].content.paragraphs[4]", selector: ".intro p:nth-of-type(5)", type: "text" },

  // Facilitators
  { path: "sections[facilitators].content.heading", selector: ".facilitators h2", type: "text" },
  { path: "sections[facilitators].content.members[0].name", selector: ".facilitator:nth-of-type(1) h3", type: "text" },
  { path: "sections[facilitators].content.members[0].role", selector: ".facilitator:nth-of-type(1) .facilitator-role", type: "text" },
  { path: "sections[facilitators].content.members[0].bio", selector: ".facilitator:nth-of-type(1) .facilitator-bio", type: "text" },
  { path: "sections[facilitators].content.members[0].photoAlt", selector: ".facilitator:nth-of-type(1) .facilitator-photo", attribute: "alt", type: "attribute" },
  { path: "sections[facilitators].content.members[1].name", selector: ".facilitator:nth-of-type(2) h3", type: "text" },
  { path: "sections[facilitators].content.members[1].role", selector: ".facilitator:nth-of-type(2) .facilitator-role", type: "text" },
  { path: "sections[facilitators].content.members[1].bio", selector: ".facilitator:nth-of-type(2) .facilitator-bio", type: "text" },
  { path: "sections[facilitators].content.members[1].photoAlt", selector: ".facilitator:nth-of-type(2) .facilitator-photo", attribute: "alt", type: "attribute" },

  // Events/Bijeenkomsten
  { path: "sections[bijeenkomsten].content.heading", selector: ".bijeenkomsten h2", type: "text" },
  { path: "sections[bijeenkomsten].content.events[0].title", selector: ".bijeenkomst-card:nth-of-type(1) h3", type: "text" },
  { path: "sections[bijeenkomsten].content.events[0].date", selector: ".bijeenkomst-card:nth-of-type(1) .bijeenkomst-datum", type: "text" },
  { path: "sections[bijeenkomsten].content.events[0].availability", selector: ".bijeenkomst-card:nth-of-type(1) .availability", type: "text" },
  { path: "sections[bijeenkomsten].content.events[1].title", selector: ".bijeenkomst-card:nth-of-type(2) h3", type: "text" },
  { path: "sections[bijeenkomsten].content.events[1].date", selector: ".bijeenkomst-card:nth-of-type(2) .bijeenkomst-datum", type: "text" },
  { path: "sections[bijeenkomsten].content.events[1].availability", selector: ".bijeenkomst-card:nth-of-type(2) .availability", type: "text" },
  { path: "sections[bijeenkomsten].content.events[2].title", selector: ".bijeenkomst-card:nth-of-type(3) h3", type: "text" },
  { path: "sections[bijeenkomsten].content.events[2].date", selector: ".bijeenkomst-card:nth-of-type(3) .bijeenkomst-datum", type: "text" },
  { path: "sections[bijeenkomsten].content.events[2].availability", selector: ".bijeenkomst-card:nth-of-type(3) .availability", type: "text" },
  { path: "sections[bijeenkomsten].content.events[3].title", selector: ".bijeenkomst-card:nth-of-type(4) h3", type: "text" },
  { path: "sections[bijeenkomsten].content.events[3].date", selector: ".bijeenkomst-card:nth-of-type(4) .bijeenkomst-datum", type: "text" },
  { path: "sections[bijeenkomsten].content.events[3].availability", selector: ".bijeenkomst-card:nth-of-type(4) .availability", type: "text" },
  { path: "sections[bijeenkomsten].content.events[4].title", selector: ".bijeenkomst-card:nth-of-type(5) h3", type: "text" },
  { path: "sections[bijeenkomsten].content.events[4].date", selector: ".bijeenkomst-card:nth-of-type(5) .bijeenkomst-datum", type: "text" },
  { path: "sections[bijeenkomsten].content.events[4].availability", selector: ".bijeenkomst-card:nth-of-type(5) .availability", type: "text" },

  // Newsletter
  { path: "sections[newsletter].content.heading", selector: ".newsletter h2", type: "text" },
  { path: "sections[newsletter].content.description", selector: ".newsletter > p", type: "text" },
  { path: "sections[newsletter].content.buttonText", selector: ".newsletter-form button", type: "text" },
  { path: "sections[newsletter].content.privacyNote", selector: ".newsletter .privacy-note", type: "text" },

  // Praktisch
  { path: "sections[praktisch].content.heading", selector: ".praktisch h2", type: "text" },
  { path: "sections[praktisch].content.infoItems[0].label", selector: ".praktisch-item:nth-of-type(1) strong", type: "text" },
  { path: "sections[praktisch].content.infoItems[0].value", selector: ".praktisch-item:nth-of-type(1) p", type: "html" },
  { path: "sections[praktisch].content.infoItems[1].label", selector: ".praktisch-item:nth-of-type(2) strong", type: "text" },
  { path: "sections[praktisch].content.infoItems[1].value", selector: ".praktisch-item:nth-of-type(2) p", type: "html" },
  { path: "sections[praktisch].content.infoItems[2].label", selector: ".praktisch-item:nth-of-type(3) strong", type: "text" },
  { path: "sections[praktisch].content.infoItems[2].value", selector: ".praktisch-item:nth-of-type(3) p", type: "text" },
  { path: "sections[praktisch].content.infoItems[3].label", selector: ".praktisch-item:nth-of-type(4) strong", type: "text" },
  { path: "sections[praktisch].content.infoItems[3].value", selector: ".praktisch-item:nth-of-type(4) p", type: "html" },
  { path: "sections[praktisch].content.locationHeading", selector: ".location-details h3", type: "text" },
  { path: "sections[praktisch].content.directionsLabel", selector: ".directions strong", type: "text" },
  { path: "sections[praktisch].content.directionsText", selector: ".directions", type: "text" },

  // FAQ
  { path: "sections[faq].content.heading", selector: ".faq h2", type: "text" },
  { path: "sections[faq].content.items[0].question", selector: ".faq-item:nth-of-type(1) .faq-question", type: "text" },
  { path: "sections[faq].content.items[0].answer", selector: ".faq-item:nth-of-type(1) .faq-answer", type: "text" },
  { path: "sections[faq].content.items[1].question", selector: ".faq-item:nth-of-type(2) .faq-question", type: "text" },
  { path: "sections[faq].content.items[1].answer", selector: ".faq-item:nth-of-type(2) .faq-answer", type: "text" },
  { path: "sections[faq].content.items[2].question", selector: ".faq-item:nth-of-type(3) .faq-question", type: "text" },
  { path: "sections[faq].content.items[2].answer", selector: ".faq-item:nth-of-type(3) .faq-answer", type: "text" },
  { path: "sections[faq].content.items[3].question", selector: ".faq-item:nth-of-type(4) .faq-question", type: "text" },
  { path: "sections[faq].content.items[3].answer", selector: ".faq-item:nth-of-type(4) .faq-answer", type: "text" },
  { path: "sections[faq].content.items[4].question", selector: ".faq-item:nth-of-type(5) .faq-question", type: "text" },
  { path: "sections[faq].content.items[4].answer", selector: ".faq-item:nth-of-type(5) .faq-answer", type: "text" },
  { path: "sections[faq].content.items[5].question", selector: ".faq-item:nth-of-type(6) .faq-question", type: "text" },
  { path: "sections[faq].content.items[5].answer", selector: ".faq-item:nth-of-type(6) .faq-answer", type: "text" },

  // Contact
  { path: "sections[contact].content.heading", selector: ".contact h2", type: "text" },
  { path: "sections[contact].content.description", selector: ".contact > p", type: "text" },

  // Footer
  { path: "sections[footer].content.text", selector: "footer p:first-child", type: "text" },
  { path: "sections[footer].content.email", selector: "footer p:last-child", type: "text" },
];

/**
 * Helper function to get selector for a JSON path
 */
export function getSelectorForPath(path: string): SelectorMapping | undefined {
  return contentMappings.find((m) => m.path === path);
}

/**
 * Helper function to get all selectors for a section
 */
export function getSelectorsForSection(sectionId: string): SelectorMapping[] {
  return contentMappings.filter((m) => m.path.includes(`sections[${sectionId}]`));
}
