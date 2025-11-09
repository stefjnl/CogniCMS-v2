import "./jest-next-mocks";
import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { POST as SavePOST } from "@/app/api/content/save/route";
import type { ContentSchema } from "@/types/content";
import { injectContentIntoHTMLMock } from "./jest-next-mocks";

jest.mock("@octokit/rest");

describe("[API] /api/content/save", () => {
  const ORIGINAL_ENV = process.env;

  const owner = "test-owner";
  const repo = "test-repo";
  const token = "test-token";
  const branch = "main";

  const baseContent: ContentSchema = {
    meta: { title: "Test", description: "Desc" },
    sections: [],
  } as ContentSchema;

  const baseHtml = "<html><body>{{content}}</body></html>";

  function setupOctokitMock(
    impl?: (params: {
      owner: string;
      repo: string;
      path: string;
      message: string;
      content: string;
      sha: string;
      branch: string;
    }) => Promise<unknown>
  ) {
    const createOrUpdateFileContents = jest.fn(
      impl ??
        (async () => ({
          status: 201,
          data: { commit: { message: "test-commit" } },
        }))
    );

    (Octokit as unknown as jest.Mock).mockImplementation(() => ({
      repos: {
        createOrUpdateFileContents,
      },
    }));

    return { createOrUpdateFileContents };
  }

  function createJsonRequest(body: unknown): Request {
    return new Request("http://localhost/api/content/save", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...ORIGINAL_ENV,
      GITHUB_TOKEN: token,
      GITHUB_OWNER: owner,
      GITHUB_REPO: repo,
      GITHUB_BRANCH: branch,
    };
    injectContentIntoHTMLMock.mockImplementation(
      (html: string, content: ContentSchema) =>
        `${html}<!-- injected:${content.meta?.title ?? ""} -->`
    );
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns 200 and commits to GitHub for valid data", async () => {
    const { createOrUpdateFileContents } = setupOctokitMock();

    const req = createJsonRequest({
      content: baseContent,
      htmlSha: "html-sha",
      contentSha: "content-sha",
      html: baseHtml,
    });

    const res = (await SavePOST(req)) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Content saved to GitHub");
    expect(typeof data.timestamp).toBe("string");

    expect(injectContentIntoHTMLMock).toHaveBeenCalledWith(
      baseHtml,
      baseContent
    );
    expect(createOrUpdateFileContents).toHaveBeenCalledTimes(2);

    const firstCall = createOrUpdateFileContents.mock.calls[0]?.[0];
    const secondCall = createOrUpdateFileContents.mock.calls[1]?.[0];

    expect(firstCall).toMatchObject({
      owner,
      repo,
      path: "index.html",
      branch,
      sha: "html-sha",
    });

    expect(secondCall).toMatchObject({
      owner,
      repo,
      path: "contents/content.json",
      branch,
      sha: "content-sha",
    });
  });

  it("returns 400 when required fields are missing", async () => {
    const req = createJsonRequest({
      content: baseContent,
      htmlSha: "html-sha",
      html: baseHtml,
    });

    const res = (await SavePOST(req)) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toMatchObject({
      error: "Missing required fields: content, htmlSha, contentSha, html",
    });
  });

  it("returns 500 when GITHUB_TOKEN is missing", async () => {
    delete process.env.GITHUB_TOKEN;

    const req = createJsonRequest({
      content: baseContent,
      htmlSha: "html-sha",
      contentSha: "content-sha",
      html: baseHtml,
    });

    const res = (await SavePOST(req)) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toMatchObject({ error: "GitHub token not configured" });
  });

  it("returns 409 on SHA conflict", async () => {
    const conflictError = new Error("409");

    const { createOrUpdateFileContents } = setupOctokitMock(async () => {
      throw conflictError;
    });

    const req = createJsonRequest({
      content: baseContent,
      htmlSha: "old-sha",
      contentSha: "old-sha",
      html: baseHtml,
    });

    const res = (await SavePOST(req)) as NextResponse;
    const data = await res.json();

    expect(createOrUpdateFileContents).toHaveBeenCalled();
    expect(res.status).toBe(409);
    expect(data).toMatchObject({
      error:
        "Conflict: File has been modified by another user. Please reload and try again.",
    });
  });

  it("returns 401 on invalid GitHub credentials", async () => {
    const badCredsError = new Error("Bad credentials");

    const { createOrUpdateFileContents } = setupOctokitMock(async () => {
      throw badCredsError;
    });

    const req = createJsonRequest({
      content: baseContent,
      htmlSha: "html-sha",
      contentSha: "content-sha",
      html: baseHtml,
    });

    const res = (await SavePOST(req)) as NextResponse;
    const data = await res.json();

    expect(createOrUpdateFileContents).toHaveBeenCalled();
    expect(res.status).toBe(401);
    expect(data).toMatchObject({ error: "Invalid GitHub token" });
  });

  it("returns 500 on generic GitHub API error", async () => {
    const genericError = new Error("Some GitHub failure");

    const { createOrUpdateFileContents } = setupOctokitMock(async () => {
      throw genericError;
    });

    const req = createJsonRequest({
      content: baseContent,
      htmlSha: "html-sha",
      contentSha: "content-sha",
      html: baseHtml,
    });

    const res = (await SavePOST(req)) as NextResponse;
    const data = await res.json();

    expect(createOrUpdateFileContents).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(String(data.error)).toContain("Failed to save:");
  });

  it("returns 500 when request.json fails (invalid content schema or parse error)", async () => {
    const failingRequest = {
      json: jest.fn().mockRejectedValue(new Error("Invalid body")),
    } as unknown as Request;

    const res = (await SavePOST(failingRequest)) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(String(data.error)).toContain("Failed to save content to GitHub");
  });
});