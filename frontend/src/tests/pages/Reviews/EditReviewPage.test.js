import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import EditReviewPage from "main/pages/Reviews/EditReviewPage";

const queryClient = new QueryClient();

describe("EditReviewPage tests", () => {
  test("renders without crashing", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <EditReviewPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const title = screen.getByText(/Edit review with id/);
    expect(title).toBeInTheDocument();

    const message = screen.getByText("Coming soon!");
    expect(message).toBeInTheDocument();
  });
});
