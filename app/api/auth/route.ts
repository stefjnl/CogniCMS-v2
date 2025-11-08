import { NextResponse } from "next/server";

/**
 * POST /api/auth
 * Simple password authentication for CMS access
 */
export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Check if password matches environment variable
    if (password === process.env.NEXT_PUBLIC_CMS_PASSWORD) {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json(
      { authenticated: false, error: "Invalid password" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
