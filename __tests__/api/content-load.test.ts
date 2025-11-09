import "./jest-next-mocks";
import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { GET as LoadGET } from "@/app/api/content/load/route";

jest.mock("@octokit/rest");

describe("[API] /api/content/load", () => {
  const ORIGINAL_ENV = process.env;

  const owner = "test-owner";
  const repo = "test-repo";
  const token = "test-token";
  const branch = "main";

  const htmlContent = "<html><body>Hello</body></html>";
  const contentJson = JSON.stringify({ sections: [], meta: { title: "Test" } });

  function mockOctokitGetContentSequence(
    impls: Array<(params: { owner: string; repo: string; path: string; ref: string }) => unknown>
  ) {
    const getContentMock = jest.fn();

    impls.forEach((impl) => {
      getContentMock.mockImplementationOnce((params) => impl(params));
    });

    (Octokit as unknown as jest.Mock).mockImplementation(() => ({
      repos: {
        getContent: getContentMock,
      },
    }));

    return getContentMock;
  }

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = {
      ...ORIGINAL_ENV,
      GITHUB_TOKEN: token,
      GITHUB_OWNER: owner,
      GITHUB_REPO: repo,
      GITHUB_BRANCH: branch,
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns 200 with html, content, sha for valid GitHub configuration", async () => {
    const htmlSha = "html-sha";
    const contentSha = "content-sha";

    const getContentMock = mockOctokitGetContentSequence([
      () => ({
        data: {
          type: "file",
          content: Buffer.from(htmlContent).toString("base64"),
          sha: htmlSha,
        },
      }),
      () => ({
        data: {
          type: "file",
          content: Buffer.from(contentJson).toString("base64"),
          sha: contentSha,
        },
      }),
    ]);

    const res = (await LoadGET()) as NextResponse;
    const data = await res.json();

    expect(getContentMock).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);
    expect(data.html).toBe(htmlContent);
    expect(data.content).toEqual(JSON.parse(contentJson));
    expect(data.sha).toEqual({ html: htmlSha, content: contentSha });
    expect(data.lastModified).toEqual({ html: htmlSha, content: contentSha });
  });

  it("returns 500 when GITHUB_TOKEN is missing", async () => {
    delete process.env.GITHUB_TOKEN;

    const res = (await LoadGET()) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toMatchObject({ error: "GitHub token not configured" });
  });

  it("returns 500 when GITHUB_OWNER or GITHUB_REPO is missing", async () => {
    delete process.env.GITHUB_OWNER;

    const res = (await LoadGET()) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toMatchObject({ error: "GitHub repository not configured" });
  });

  it("returns 401 when GitHub reports bad credentials", async () => {
    mockOctokitGetContentSequence([
      () => {
        throw new Error("Bad credentials");
      },
    ]);

    const res = (await LoadGET()) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toMatchObject({
      error:
        "Invalid GitHub token. Please check GITHUB_TOKEN environment variable.",
    });
  });

  it("returns 404 when repository or file not found", async () => {
    mockOctokitGetContentSequence([
      () => {
        throw new Error("Not Found");
      },
    ]);

    const res = (await LoadGET()) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toMatchObject({
      error:
        "Repository or file not found. Check GITHUB_OWNER, GITHUB_REPO, and file paths.",
    });
  });

  it("returns 404 when index.html not found", async () => {
    mockOctokitGetContentSequence([
      () => {
        throw new Error("Not Found");
      },
    ]);

    const res = (await LoadGET()) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toMatchObject({
      error:
        "Repository or file not found. Check GITHUB_OWNER, GITHUB_REPO, and file paths.",
    });
  });

  it("returns 404 when content.json not found", async () => {
    mockOctokitGetContentSequence([
      // index.html ok
      () => ({
        data: {
          type: "file",
          content: Buffer.from(htmlContent).toString("base64"),
          sha: "html-sha",
        },
      }),
      // content.json missing
      () => {
        throw new Error("Not Found");
      },
    ]);

    const res = (await LoadGET()) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toMatchObject({
      error:
        "Repository or file not found. Check GITHUB_OWNER, GITHUB_REPO, and file paths.",
    });
  });

  it("returns 500 when content.json is malformed JSON", async () => {
    mockOctokitGetContentSequence([
      () => ({
        data: {
          type: "file",
          content: Buffer.from(htmlContent).toString("base64"),
          sha: "html-sha",
        },
      }),
      () => ({
        data: {
          type: "file",
          content: Buffer.from("{ invalid json").toString("base64"),
          sha: "content-sha",
        },
      }),
    ]);

    const res = (await LoadGET()) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(String(data.error)).toContain("Failed to load content:");
  });

  it("returns 500 when responses are not file contents (e.g. directory)", async () => {
    mockOctokitGetContentSequence([
      () => ({
        data: {
          type: "dir",
        },
      }),
      () => ({
        data: {
          type: "dir",
        },
      }),
    ]);

    const res = (await LoadGET()) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(String(data.error)).toContain(
      "Failed to load content from GitHub"
    );
  });
});