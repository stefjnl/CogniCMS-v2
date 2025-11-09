import "./jest-next-mocks";
import { NextResponse } from "next/server";
import { POST as PreviewPOST } from "@/app/api/preview/route";
import type { ContentSchema } from "@/types/content";

/**
 * injectContentIntoHTML is mocked globally in jest-next-mocks as a jest.fn.
 * Import it here only for type-level usage; behavior is controlled via the mock.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { injectContentIntoHTMLMock } from "./jest-next-mocks";

describe("[API] /api/preview", () => {
  const baseHtml = "<html><body>{{content}}</body></html>";

  const baseContent: ContentSchema = {
    meta: { title: "Preview Title", description: "Preview Desc" },
    sections: [],
  } as ContentSchema;

  function createJsonRequest(body: unknown): Request {
    return new Request("http://localhost/api/preview", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    injectContentIntoHTMLMock.mockImplementation(
      (html: string, content: ContentSchema) =>
        `${html}<!-- preview:${content.meta?.title ?? ""} -->`
    );
  });

  it("returns 200 with generated HTML for valid html and content", async () => {
    const req = createJsonRequest({
      html: baseHtml,
      content: baseContent,
    });

    const res = (await PreviewPOST(req)) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.html).toContain("<!-- preview:Preview Title -->");
    expect(injectContentIntoHTMLMock).toHaveBeenCalledWith(
      baseHtml,
      baseContent
    );
  });

  it("returns 400 when html is missing", async () => {
    const req = createJsonRequest({
      content: baseContent,
    });

    const res = (await PreviewPOST(req)) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toMatchObject({
      error: "Missing required fields: html, content",
    });
  });

  it("returns 400 when content is missing", async () => {
    const req = createJsonRequest({
      html: baseHtml,
    });

    const res = (await PreviewPOST(req)) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toMatchObject({
      error: "Missing required fields: html, content",
    });
  });

  it("returns 500 when injectContentIntoHTML throws (invalid content schema or runtime error)", async () => {
    injectContentIntoHTMLMock.mockImplementation(() => {
      throw new Error("Injection failed");
    });

    const req = createJsonRequest({
      html: baseHtml,
      content: baseContent,
    });

    const res = (await PreviewPOST(req)) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(String(data.error)).toContain(
      "Preview generation failed: Injection failed"
    );
  });

  it("returns 500 when request.json fails (invalid JSON)", async () => {
    class FailingJsonRequest extends Request {
      // eslint-disable-next-line class-methods-use-this
      async json(): Promise<never> {
        throw new Error("Unexpected token");
      }
    }

    const malformed = new Request("http://localhost/api/preview", {
      method: "POST",
      body: "{ invalid json",
      headers: { "Content-Type": "application/json" },
    });

    const failingRequest = new FailingJsonRequest(malformed);

    const res = (await PreviewPOST(failingRequest)) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(String(data.error)).toContain("Preview generation failed:");
  });
});