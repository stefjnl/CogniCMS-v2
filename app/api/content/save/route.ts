import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";
import { injectContentIntoHTML } from "@/lib/content/injector";
import { ContentSchema } from "@/types/content";

/**
 * POST /api/content/save
 * Saves the updated content back to GitHub by:
 * 1. Injecting the content into the HTML
 * 2. Committing both files (index.html and content.json)
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { content, htmlSha, contentSha, html } = body as {
      content: ContentSchema;
      htmlSha: string;
      contentSha: string;
      html: string;
    };

    // Validate request
    if (!content || !htmlSha || !contentSha || !html) {
      return NextResponse.json(
        {
          error: "Missing required fields: content, htmlSha, contentSha, html",
        },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json(
        { error: "GitHub token not configured" },
        { status: 500 }
      );
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const branch = process.env.GITHUB_BRANCH || "main";

    console.log(`Saving content to ${owner}/${repo} (${branch})`);

    // Inject updated content into HTML
    const updatedHtml = injectContentIntoHTML(html, content);

    // Prepare commit message with timestamp
    const timestamp = new Date().toISOString();
    const commitMessage = `Update content via CogniCMS - ${timestamp}`;

    // Commit updated HTML file
    console.log("Committing index.html...");
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "index.html",
      message: commitMessage,
      content: Buffer.from(updatedHtml).toString("base64"),
      sha: htmlSha,
      branch,
    });

    // Commit updated content.json file
    console.log("Committing content.json...");
    const contentJsonString = JSON.stringify(content, null, 2);
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "contents/content.json",
      message: commitMessage,
      content: Buffer.from(contentJsonString).toString("base64"),
      sha: contentSha,
      branch,
    });

    console.log("Content saved successfully");

    return NextResponse.json({
      success: true,
      message: "Content saved to GitHub",
      timestamp,
    });
  } catch (error) {
    console.error("Error saving to GitHub:", error);

    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes("409")) {
        return NextResponse.json(
          {
            error:
              "Conflict: File has been modified by another user. Please reload and try again.",
          },
          { status: 409 }
        );
      }
      if (error.message.includes("Bad credentials")) {
        return NextResponse.json(
          { error: "Invalid GitHub token" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: `Failed to save: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save content to GitHub" },
      { status: 500 }
    );
  }
}
