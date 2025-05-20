import { render, screen } from "@testing-library/react";
import ReviewsForMenuItemPage from "../../../main/pages/Reviews/ReviewsForMenuItemPage";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "react-query";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { systemInfoFixtures } from "../../../fixtures/systemInfoFixtures";

describe("ReviewsForMenuItemPage", () => {
  let axiosMock;
  beforeAll(() => {
    axiosMock = new AxiosMockAdapter(axios);
  });
  afterEach(() => {
    axiosMock.reset();
  });
  test("renders placeholder with correct itemid", () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/reviews/42"]}>
          <Routes>
            <Route
              path="/reviews/:itemid"
              element={<ReviewsForMenuItemPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText("Reviews for Menu Item 42")).toBeInTheDocument();
    expect(screen.getByText("Coming Soon!")).toBeInTheDocument();
  });
});
