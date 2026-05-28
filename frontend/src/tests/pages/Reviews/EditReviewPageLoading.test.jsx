import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import { vi } from "vitest";

vi.mock("main/utils/useBackend", () => ({
  useBackend: () => ({
    data: undefined,
    isLoading: true,
    isError: false,
  }),
}));

vi.mock("react-router", async () => {
  const original = await vi.importActual("react-router");
  return {
    ...original,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: "1" }),
  };
});

import EditReviewPage from "main/pages/Reviews/EditReviewPage";

describe("EditReviewPage loading state", () => {
  test("shows a loading state while the review is being fetched", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EditReviewPage />
          <ToastContainer />
        </BrowserRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Loading review/i)).toBeInTheDocument();
  });
});
