// MUST mock before imports
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import MyReviewsCreatePage from "main/pages/MyReviews/MyReviewsCreatePage";

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => jest.fn(),
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
          <MyReviewsCreatePage />
          <ToastContainer />
        </BrowserRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("heading", { name: /review/i }),
    ).toBeInTheDocument();
  });
});
