import "./jest-next-mocks";
import { NextResponse } from "next/server";
import { POST as AuthPOST } from "@/app/api/auth/route";

describe("[API] /api/auth", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.NEXT_PUBLIC_CMS_PASSWORD = "test-password";
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  function createRequest(
    body: unknown,
    options: { rawBody?: string } = {}
  ): Request {
    if (options.rawBody !== undefined) {
      return new Request("http://localhost/api/auth", {
        method: "POST",
        body: options.rawBody,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Request("http://localhost/api/auth", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  it("returns 200 with authenticated: true for correct password", async () => {
    const req = createRequest({ password: "test-password" });

    const res = (await AuthPOST(req)) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ authenticated: true });
  });

  it("returns 401 for incorrect password", async () => {
    const req = createRequest({ password: "wrong-password" });

    const res = (await AuthPOST(req)) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toMatchObject({
      authenticated: false,
      error: "Invalid password",
    });
  });

  it("returns 500 when request.json throws (e.g. empty body or invalid JSON)", async () => {
    const badRequest = {
      json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
    } as unknown as Request;

    const res = (await AuthPOST(badRequest)) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toMatchObject({
      authenticated: false,
      error: "Authentication failed",
    });
  });

  it("returns 500 when called with invalid JSON body", async () => {
    class FailingJsonRequest extends Request {
      // eslint-disable-next-line class-methods-use-this
      async json(): Promise<never> {
        throw new Error("Unexpected token");
      }
    }

    const base = createRequest(undefined, { rawBody: "{ invalid json" });
    const failingRequest = new FailingJsonRequest(base);

    const res = (await AuthPOST(failingRequest)) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toMatchObject({
      authenticated: false,
      error: "Authentication failed",
    });
  });

  it("returns 401 when NEXT_PUBLIC_CMS_PASSWORD is not set", async () => {
    delete process.env.NEXT_PUBLIC_CMS_PASSWORD;

    const req = createRequest({ password: "any" });

    const res = (await AuthPOST(req)) as NextResponse;
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toMatchObject({
      authenticated: false,
      error: "Invalid password",
    });
  });
});