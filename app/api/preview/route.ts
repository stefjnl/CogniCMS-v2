import { NextResponse } from "next/server";
import { injectContentIntoHTML } from "@/lib/content/injector";
import { ContentSchema } from "@/types/content";

/**
 * POST /api/preview
 * Generates a preview HTML by injecting the current content into the original HTML
 * This is used for live preview updates without committing to GitHub
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { html, content } = body as {
      html: string;
      content: ContentSchema;
    };

    // Validate request
    if (!html || !content) {
      return NextResponse.json(
        { error: "Missing required fields: html, content" },
        { status: 400 }
      );
    }

    // Inject content into HTML
    const updatedHtml = injectContentIntoHTML(html, content);

    return NextResponse.json({
      html: updatedHtml,
      success: true,
    });
  } catch (error) {
    console.error("Error generating preview:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Preview generation failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 }
    );
  }
}
