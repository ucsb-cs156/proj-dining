// MUST mock before imports
import { vi } from "vitest";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import PostReviewPage from "main/pages/Reviews/PostReviewPage";

vi.mock("react-router-dom", async () => {
  const original = await vi.importActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams("")],
  };
});

const axiosMock = new AxiosMockAdapter(axios);
axiosMock.onGet("/api/currentUser").reply(200, { user: null });
axiosMock.onGet("/api/systemInfo").reply(200, {});

describe("MyReviewsCreatePage handles missing query params", () => {
  test("renders default view", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PostReviewPage />
          <ToastContainer />
        </BrowserRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("heading", { name: /review/i }),
    ).toBeInTheDocument();
  });
});
