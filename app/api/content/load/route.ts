import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

/**
 * GET /api/content/load
 * Loads the HTML and content.json from the target GitHub repository
 */
export async function GET() {
  try {
    // Validate environment variables
    if (!process.env.GITHUB_TOKEN) {
      console.error("GITHUB_TOKEN is not set");
      return NextResponse.json(
        { error: "GitHub token not configured" },
        { status: 500 }
      );
    }

    if (!process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
      console.error("GITHUB_OWNER or GITHUB_REPO not set");
      return NextResponse.json(
        { error: "GitHub repository not configured" },
        { status: 500 }
      );
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";

    console.log(`Loading content from ${owner}/${repo} (${branch})`);

    // Fetch index.html
    const htmlResponse = await octokit.repos.getContent({
      owner,
      repo,
      path: "index.html",
      ref: branch,
    });

    // Fetch content.json from contents/ subdirectory
    const contentResponse = await octokit.repos.getContent({
      owner,
      repo,
      path: "contents/content.json",
      ref: branch,
    });

    // Check if responses are files (not directories)
    if (
      "content" in htmlResponse.data &&
      "content" in contentResponse.data &&
      htmlResponse.data.type === "file" &&
      contentResponse.data.type === "file"
    ) {
      // Decode base64 content
      const html = Buffer.from(htmlResponse.data.content, "base64").toString(
        "utf-8"
      );
      const contentJson = Buffer.from(
        contentResponse.data.content,
        "base64"
      ).toString("utf-8");
      const content = JSON.parse(contentJson);

      console.log("Content loaded successfully");

      return NextResponse.json({
        html,
        content,
        sha: {
          html: htmlResponse.data.sha,
          content: contentResponse.data.sha,
        },
        lastModified: {
          html: htmlResponse.data.sha,
          content: contentResponse.data.sha,
        },
      });
    }

    throw new Error("Invalid response from GitHub - expected file content");
  } catch (error) {
    console.error("Error loading from GitHub:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Not Found")) {
        return NextResponse.json(
          {
            error:
              "Repository or file not found. Check GITHUB_OWNER, GITHUB_REPO, and file paths.",
          },
          { status: 404 }
        );
      }
      if (error.message.includes("Bad credentials")) {
        return NextResponse.json(
          {
            error:
              "Invalid GitHub token. Please check GITHUB_TOKEN environment variable.",
          },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: `Failed to load content: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to load content from GitHub" },
      { status: 500 }
    );
  }
}
