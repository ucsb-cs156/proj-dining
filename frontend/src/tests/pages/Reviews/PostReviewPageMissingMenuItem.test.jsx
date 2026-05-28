import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import { vi } from "vitest";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const original = await vi.importActual("react-router");
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "42" }),
  };
});

describe("PostReviewPage when menu item data is missing", () => {
  beforeEach(() => {
    vi.resetModules();
    mockNavigate.mockClear();
  });

  test("renders with an empty item name when the menu item has not loaded yet", async () => {
    vi.doMock("main/utils/useBackend", () => ({
      useBackend: () => ({ data: undefined }),
    }));

    const { default: PostReviewPage } = await import(
      "main/pages/Reviews/PostReviewPage"
    );

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PostReviewPage />
          <ToastContainer />
        </BrowserRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByLabelText(/item name/i)).toHaveValue("");
    expect(
      screen.getByRole("button", { name: /submit review/i }),
    ).toBeEnabled();
  });
});
