import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";
import Login from "@/app/login/page";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: jest.fn(),
  };
});

describe("Authentication Flow Integration", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    });

    window.localStorage.clear();
    (global.fetch as any) = jest.fn();
  });

  it("renders login page correctly with password field and button", () => {
    render(<Login />);

    // Updated assertions to match current login UI copy.
    expect(
      screen.getByRole("heading", { name: /cognicms v2/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/content management system/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login/i })
    ).toBeInTheDocument();
  });

  it("submits login form to /api/auth and on success stores auth flag and redirects to CMS", async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authenticated: true }),
    });

    render(<Login />);

    const input = screen.getByLabelText(/password/i);
    const button = screen.getByRole("button", { name: /login/i });

    await user.type(input, "test-password");
    await user.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "test-password" }),
      });
    });

    expect(window.localStorage.getItem("cms-auth")).toBe("true");
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("shows error when authentication fails", async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid password" }),
    });

    render(<Login />);

    const input = screen.getByLabelText(/password/i);
    const button = screen.getByRole("button", { name: /login/i });

    await user.type(input, "wrong-password");
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/invalid password/i)
      ).toBeInTheDocument();
    });

    expect(window.localStorage.getItem("cms-auth")).toBeNull();
    expect(mockPush).not.toHaveBeenCalledWith("/");
  });

  it("redirects unauthenticated user from CMS (/) to /login", async () => {
    window.localStorage.removeItem("cms-auth");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        content: { sections: [] },
        html: "<html></html>",
      }),
    });

    render(<Home />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("loads CMS for authenticated user and calls /api/content/load", async () => {
    window.localStorage.setItem("cms-auth", "true");

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: { sections: [] },
        html: "<html></html>",
      }),
    });

    render(<Home />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/content/load");
    });

    // Once content is loaded, loading text disappears.
    await waitFor(() => {
      expect(screen.queryByText(/loading cms/i)).toBeNull();
    });
  });
});