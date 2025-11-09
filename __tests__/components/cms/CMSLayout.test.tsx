import React from "react";
import { render, screen } from "@testing-library/react";
import { CMSLayout } from "@/components/cms/CMSLayout";
import { ContentProvider } from "@/lib/state/ContentContext";
import { ContentSchema } from "@/types/content";

function renderWithProvider(
  ui: React.ReactElement,
  content?: Partial<ContentSchema>
) {
  const base: ContentSchema = {
    metadata: {
      title: "Test",
      description: "Test Description",
      lastModified: new Date().toISOString(),
    },
    sections: [
      {
        id: "hero",
        label: "Hero",
        type: "hero",
        selector: "section.hero",
        content: {
          heading: "Hero",
          subheading: "Sub",
          ctaText: "CTA",
          ctaUrl: "#",
          urgencyText: "Now",
          logoAlt: "Logo",
        },
      },
    ],
    assets: {
      images: [],
      links: [],
    },
  };

  return render(
    <ContentProvider initialContent={{ ...base, ...content }}>
      {ui}
    </ContentProvider>
  );
}

describe("components/cms/CMSLayout", () => {
  test("renders without errors within ContentProvider", () => {
    renderWithProvider(<CMSLayout />);

    expect(
      screen.getByRole("heading", { name: /cognicms/i })
    ).toBeInTheDocument();
  });

  test("renders action bar", () => {
    renderWithProvider(<CMSLayout />);

    expect(
      screen.getByRole("heading", { name: /cognicms/i })
    ).toBeInTheDocument();
  });

  test("renders split layout panels with editor and preview", () => {
    renderWithProvider(<CMSLayout />);

    // Left side contains Section Navigator heading label from ContentEditor
    expect(screen.getByText(/content sections/i)).toBeInTheDocument();

    // Right side contains Preview title
    expect(screen.getByText(/preview/i)).toBeInTheDocument();
  });

  test("renders children content from ContentEditor and PreviewPane", () => {
    renderWithProvider(<CMSLayout />);

    // ActiveSection is null initially, ContentEditor shows empty state
    expect(screen.getByText(/no section selected/i)).toBeInTheDocument();

    // Preview pane shows loading placeholder before HTML is set
    expect(screen.getByText(/loading preview/i)).toBeInTheDocument();
  });
});
