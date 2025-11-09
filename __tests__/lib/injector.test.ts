jest.mock("cheerio", () => ({
  load: (html: string) => {
    const { load } = jest.requireActual("cheerio") as any;
    return load(html);
  },
}));

import {
  injectContentIntoHTML,
} from "@/lib/content/injector";
import type {
  ContentSchema,
  HeroContent,
  BannerContent,
  ContentSectionContent,
  TeamContent,
  EventsContent,
  FormContent,
  InfoContent,
  FAQContent,
  ContactContent,
  FooterContent,
} from "@/types/content";

describe("injector utilities", () => {
  const baseHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>Original Title</title>
    <meta name="description" content="Original description">
    <meta name="keywords" content="old,keywords">
    <meta property="og:title" content="OG Original" />
    <meta property="og:description" content="OG Desc" />
    <meta name="twitter:title" content="Tw Original" />
    <meta name="twitter:description" content="Tw Desc" />
  </head>
  <body>
    <section id="hero" class="hero-section">
      <img class="logo" src="/logo.png" alt="Old Alt" />
      <h1>Hero Title</h1>
      <p class="urgency-text">Old urgency</p>
      <p>Old subtitle</p>
      <a class="btn-primary-large" href="/old-cta">Old CTA</a>
    </section>

    <section id="banner" class="banner">
      <h2>Old Banner</h2>
      <p>Old subtitle</p>
    </section>

    <section id="content" class="content-section">
      <h2>Old Heading</h2>
      <p>Old paragraph 1</p>
    </section>

    <section id="team" class="team-section">
      <h2>Team Heading</h2>
      <div class="facilitator-grid">
        <div class="facilitator">
          <div class="facilitator-photo"></div>
          <h3>Old Name</h3>
          <div class="facilitator-role">Old Role</div>
          <p class="facilitator-bio">Old Bio</p>
        </div>
      </div>
    </section>

    <section id="events" class="events-section">
      <h2>Events Heading</h2>
      <div class="bijeenkomst-card">
        <h3>Old Event</h3>
        <div class="bijeenkomst-datum">📅 1 Jan</div>
        <div class="availability">Old availability</div>
        <a class="btn-reserve" href="/reserve">Reserve</a>
      </div>
    </section>

    <section id="form" class="form-section">
      <h2>Form Heading</h2>
      <p>Old description</p>
      <button>Old button</button>
      <p class="privacy-note">Old privacy</p>
    </section>

    <section id="info" class="info-section">
      <h2>Info Heading</h2>
      <div class="praktisch-grid">
        <div class="praktisch-item">
          <strong>Old label</strong>
          <p>Old value</p>
        </div>
      </div>
      <div class="location-details">
        <h3>Old Location Heading</h3>
      </div>
      <div class="map-container">
        <iframe src="https://old-map"></iframe>
      </div>
      <div class="directions">
        <strong>Old label</strong> Old text
      </div>
    </section>

    <section id="faq" class="faq-section">
      <h2>FAQ Heading</h2>
      <div class="faq-item">
        <div class="faq-question">Old Q</div>
        <div class="faq-answer">Old A</div>
      </div>
    </section>

    <section id="contact" class="contact-section">
      <h2>Contact Heading</h2>
      <p>Contact description</p>
      <div class="contact-buttons">
        <a class="btn-contact" href="mailto:old@example.com">✉️ Old email</a>
        <a class="btn-contact" href="tel:+3100000000">📞 Old phone</a>
        <a class="btn" href="/copy">Copy</a>
      </div>
    </section>

    <footer id="footer">
      <p>Old footer text</p>
      <p>old@example.com</p>
    </footer>
  </body>
</html>`;

  function buildContent(): ContentSchema {
    const hero: HeroContent = {
      heading: "New Hero Heading",
      subheading: "New Hero Subheading",
      ctaText: "New CTA",
      ctaUrl: "/new-cta",
      urgencyText: "New urgency",
      logoAlt: "New Logo Alt",
    };

    const banner: BannerContent = {
      heading: "New Banner Heading",
      subtitle: "New Banner Subtitle",
    };

    const contentSection: ContentSectionContent = {
      heading: "New Content Heading",
      paragraphs: ["Paragraph 1", "Paragraph 2"],
    };

    const team: TeamContent = {
      heading: "New Team Heading",
      members: [
        {
          name: "Member One",
          role: "Role One",
          bio: "Bio One",
          photo: "/one.png",
          photoAlt: "One Alt",
        },
        {
          name: "Member Two",
          role: "Role Two",
          bio: "Bio Two",
          photo: "/two.png",
          photoAlt: "Two Alt",
        },
      ],
    };

    const events: EventsContent = {
      heading: "New Events Heading",
      events: [
        {
          title: "Event One",
          date: "10 Jan",
          availability: "Available",
          reserveLink: "/reserve-1",
          featured: true,
        },
        {
          title: "Event Two",
          date: "20 Jan",
          availability: "Full",
          reserveLink: undefined,
          featured: false,
        },
      ],
    };

    const form: FormContent = {
      heading: "New Form Heading",
      description: "New Form Description",
      buttonText: "Submit",
      privacyNote: "New Privacy",
    };

    const info: InfoContent = {
      heading: "New Info Heading",
      infoItems: [
        {
          icon: "📍",
          label: "Location",
          value: "Street 1\nCity",
        },
      ],
      locationHeading: "New Location Heading",
      mapEmbedUrl: "https://maps/new",
      directionsLabel: "Directions",
      directionsText: "Walk straight",
    };

    const faq: FAQContent = {
      heading: "New FAQ Heading",
      items: [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
      ],
    };

    const contact: ContactContent = {
      heading: "New Contact Heading",
      description: "New contact description",
      buttons: [
        { text: "✉️ Mail us", link: "mailto:new@example.com" },
        { text: "📞 Call us", link: "tel:+3111111111" },
        { text: "Copy", link: "/copy" },
      ],
    };

    const footer: FooterContent = {
      text: "New footer text",
      email: "new@example.com",
    };

    return {
      metadata: {
        title: "Meta Title",
        description: "Meta Description",
        keywords: "a,b,c",
        ogTitle: "OG Title",
        ogDescription: "OG Description",
        twitterTitle: "Twitter Title",
        twitterDescription: "Twitter Description",
      },
      sections: [
        { id: "hero", type: "hero", selector: "#hero", content: hero },
        { id: "banner", type: "banner", selector: "#banner", content: banner },
        {
          id: "content",
          type: "content",
          selector: "#content",
          content: contentSection,
        },
        { id: "team", type: "team", selector: "#team", content: team },
        { id: "events", type: "events", selector: "#events", content: events },
        { id: "form", type: "form", selector: "#form", content: form },
        { id: "info", type: "info", selector: "#info", content: info },
        { id: "faq", type: "faq", selector: "#faq", content: faq },
        {
          id: "contact",
          type: "contact",
          selector: "#contact",
          content: contact,
        },
        {
          id: "footer",
          type: "footer",
          selector: "#footer",
          content: footer,
        },
      ],
    };
  }

  test("injectContentIntoHTML applies metadata and preserves doctype/structure", () => {
    const content = buildContent();
    const result = injectContentIntoHTML(baseHtml, content);

    expect(result.startsWith("<!DOCTYPE html")).toBe(true);
    expect(result).toContain("<html");
    expect(result).toContain("<head>");
    expect(result).toContain("<body>");

    // Metadata
    expect(result).toContain("<title>Meta Title</title>");
    expect(result).toContain(
      '<meta name="description" content="Meta Description">'
    );
    expect(result).toContain('property="og:title"');
    expect(result).toContain('content="OG Title"');
    expect(result).toContain('name="twitter:title"');
    expect(result).toContain('content="Twitter Title"');
  });

  test("injectContentIntoHTML updates hero section and does not emit highlight artifacts", () => {
    const content = buildContent();
    const result = injectContentIntoHTML(baseHtml, content);

    expect(result).toContain("New Hero Heading");
    expect(result).toContain("New Hero Subheading");
    expect(result).toContain("New CTA");
    expect(result).toContain('href="/new-cta"');
    expect(result).toContain("New urgency");
    expect(result).toContain('alt="New Logo Alt"');

    // No cognicms-changed highlight class or marker should be present in final HTML
    expect(result).not.toContain("cognicms-changed");
    expect(result).not.toContain("data-cognicms-highlight");
  });

  test("injectContentIntoHTML updates banner content", () => {
    const content = buildContent();
    const result = injectContentIntoHTML(baseHtml, content);
    expect(result).toContain("New Banner Heading");
    expect(result).toContain("New Banner Subtitle");
  });

  test("injectContentIntoHTML updates content section paragraphs (including cloning/removal)", () => {
    const content = buildContent();
    const result = injectContentIntoHTML(baseHtml, content);

    expect(result).toContain("New Content Heading");
    expect(result).toContain("Paragraph 1");
    expect(result).toContain("Paragraph 2");
  });

  test("injectContentIntoHTML updates team members and handles cloning", () => {
    const content = buildContent();
    const result = injectContentIntoHTML(baseHtml, content);

    expect(result).toContain("New Team Heading");
    expect(result).toContain("Member One");
    expect(result).toContain("Member Two");
    expect(result).toContain('/one.png');
    expect(result).toContain('/two.png');
  });

  test("injectContentIntoHTML updates events including featured and reserve button logic", () => {
    const content = buildContent();
    const result = injectContentIntoHTML(baseHtml, content);

    // Updated heading
    expect(result).toContain("New Events Heading");

    // Event titles and availability
    expect(result).toContain("Event One");
    expect(result).toContain("Event Two");
    expect(result).toContain("Available");
    expect(result).toContain("Full");

    // Reserve link should exist for first, not necessarily for second
    expect(result).toContain('href="/reserve-1"');

    // Featured event markup
    expect(result).toContain("featured");
    expect(result).toContain("featured-badge");
  });

  test("injectContentIntoHTML updates form section", () => {
    const content = buildContent();
    const result = injectContentIntoHTML(baseHtml, content);

    expect(result).toContain("New Form Heading");
    expect(result).toContain("New Form Description");
    expect(result).toContain(">Submit<");
    expect(result).toContain("New Privacy");
  });

  test("injectContentIntoHTML updates info section including multiline and map/directions", () => {
    const content = buildContent();
    const result = injectContentIntoHTML(baseHtml, content);

    expect(result).toContain("New Info Heading");
    // Multiline value should be rendered with <br> escapes inside HTML string
    expect(result).toContain("Street 1");
    expect(result).toContain("City");
    expect(result).toContain("New Location Heading");
    expect(result).toContain("https://maps/new");
    expect(result).toContain("Directions");
    expect(result).toContain("Walk straight");
  });

  test("injectContentIntoHTML updates FAQ items (cloning/removal behavior)", () => {
    const content = buildContent();
    const result = injectContentIntoHTML(baseHtml, content);

    expect(result).toContain("New FAQ Heading");
    expect(result).toContain("Q1");
    expect(result).toContain("A1");
    expect(result).toContain("Q2");
    expect(result).toContain("A2");
  });

  test("injectContentIntoHTML updates contact buttons without altering count or icons semantics", () => {
    const content = buildContent();
    const result = injectContentIntoHTML(baseHtml, content);

    // Heading/description
    expect(result).toContain("New Contact Heading");
    expect(result).toContain("New contact description");

    // Buttons: hrefs updated
    expect(result).toContain('href="mailto:new@example.com"');
    expect(result).toContain('href="tel:+3111111111"');

    // Should keep same number of buttons (3) and no highlight artifacts
    const buttonMatches = result.match(/class="btn-contact"|class="btn"/g) || [];
    expect(buttonMatches.length).toBe(3);
    expect(result).not.toContain("cognicms-changed");
  });

  test("injectContentIntoHTML updates footer content", () => {
    const content = buildContent();
    const result = injectContentIntoHTML(baseHtml, content);

    expect(result).toContain("New footer text");
    expect(result).toContain("new@example.com");
  });

  test("injectContentIntoHTML logs and skips sections with missing selectors", () => {
    const content = buildContent();
    // Change selectors so they do not exist to trigger warning path
    const broken: ContentSchema = {
      ...content,
      sections: [
        {
          id: "missing",
          type: "hero",
          selector: "#does-not-exist",
          content: content.sections[0].content,
        } as any,
      ],
    };

    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const result = injectContentIntoHTML(baseHtml, broken);

    expect(result).toContain("<!DOCTYPE html");
    expect(warnSpy).toHaveBeenCalledWith(
      'Selector not found: #does-not-exist for section missing'
    );
    warnSpy.mockRestore();
  });

  test("injectContentIntoHTML logs error for invalid section type and continues", () => {
    const content = buildContent();
    const invalid: ContentSchema = {
      ...content,
      sections: [
        ...content.sections,
        {
          id: "unknown",
          type: "unknown" as any,
          selector: "#hero",
          content: {},
        },
      ],
    };

    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const result = injectContentIntoHTML(baseHtml, invalid);

    expect(result).toContain("New Hero Heading");
    expect(warnSpy).toHaveBeenCalledWith("Unknown section type: unknown");
    warnSpy.mockRestore();
  });

  test("injectContentIntoHTML rethrows unexpected errors", () => {
    const content = buildContent();

    // Force an error by passing undefined html
    expect(() =>
      // @ts-expect-error - intentionally invalid input
      injectContentIntoHTML(undefined, content)
    ).toThrow();
  });
});