import { render, screen, within, waitFor } from "@testing-library/react";
import ReviewsForMenuItemPage from "../../../main/pages/Reviews/ReviewsForMenuItemPage";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "react-query";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { systemInfoFixtures } from "../../../fixtures/systemInfoFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

function renderWithProviders(route = "/reviews/42") {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/reviews/:itemid" element={<ReviewsForMenuItemPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ReviewsForMenuItemPage", () => {
  let axiosMock;
  beforeAll(() => {
    axiosMock = new AxiosMockAdapter(axios);
  });
  afterEach(() => {
    axiosMock.reset();
  });

  test("shows loading state", async () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/diningcommons/menuitem?id=42").timeout();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    renderWithProviders();
    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(3);
    });
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  test("shows error state", async () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/diningcommons/menuitem?id=42").reply(500);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    renderWithProviders();
    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(3);
    });
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  test("filters out reviews with null comments", async () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/diningcommons/menuitem?id=42").reply(200, {
      reviews: [
        { id: 1, itemId: 42, reviewerComments: "Great!" },
        { id: 2, itemId: 42, reviewerComments: null },
        { id: 3, itemId: 42, reviewerComments: undefined },
        { id: 4, itemId: 42, reviewerComments: "Yum!" },
      ],
    });
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    renderWithProviders();
    expect(
      await screen.findByText("Reviews for Menu Item 42"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Great!")).toBeInTheDocument();
    expect(await screen.findByText("Yum!")).toBeInTheDocument();
    expect(screen.queryByText("null")).not.toBeInTheDocument();
    expect(screen.queryByText("undefined")).not.toBeInTheDocument();
  });

  test("renders only reviews with non-null comments (row count)", async () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/diningcommons/menuitem?id=42").reply(200, {
      reviews: [
        { id: 1, itemId: 42, reviewerComments: "Great!" },
        { id: 2, itemId: 42, reviewerComments: null },
        { id: 3, itemId: 42, reviewerComments: undefined },
        { id: 4, itemId: 42, reviewerComments: "Yum!" },
      ],
    });
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    renderWithProviders();
    expect(
      await screen.findByText("Reviews for Menu Item 42"),
    ).toBeInTheDocument();
    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");
    expect(rows.length - 1).toBe(2);
    expect(await screen.findByText("Great!")).toBeInTheDocument();
    expect(await screen.findByText("Yum!")).toBeInTheDocument();
    expect(screen.queryByText("null")).not.toBeInTheDocument();
    expect(screen.queryByText("undefined")).not.toBeInTheDocument();
  });

  test("renders zero rows if data is null", async () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/diningcommons/menuitem?id=42").reply(200, null);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    renderWithProviders();
    expect(
      await screen.findByText("Reviews for Menu Item 42"),
    ).toBeInTheDocument();
    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");
    expect(rows.length - 1).toBe(0);
    expect(screen.queryByText("Stryker was here")).not.toBeInTheDocument();
    const cells = within(table).queryAllByRole("cell");
    expect(cells.length).toBe(0);
    expect(axiosMock.history.get.length).toBe(3);
  });

  test("does not show user or moderator action buttons", async () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/diningcommons/menuitem?id=42").reply(200, {
      reviews: [{ id: 1, itemId: 42, reviewerComments: "Great!" }],
    });
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    renderWithProviders();
    expect(
      await screen.findByText("Reviews for Menu Item 42"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Approve" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reject" }),
    ).not.toBeInTheDocument();
  });

  test("renders correct data for different itemids (query key cache test)", async () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/diningcommons/menuitem?id=42").reply(200, {
      reviews: [
        {
          id: 1,
          itemId: 42,
          itemsStars: 5,
          reviewerComments: "Great!",
          dateItemServed: "2024-01-01",
        },
      ],
    });
    axiosMock.onGet("/api/diningcommons/menuitem?id=99").reply(200, {
      reviews: [
        {
          id: 2,
          itemId: 99,
          itemsStars: 3,
          reviewerComments: "Meh!",
          dateItemServed: "2024-02-01",
        },
      ],
    });

    const queryClient = new QueryClient();
    const { unmount } = render(
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
    expect(
      await screen.findByText("Reviews for Menu Item 42"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("ReviewTable-cell-row-0-col-itemId"),
    ).toHaveTextContent("42");
    expect(
      screen.getByTestId("ReviewTable-cell-row-0-col-reviewerComments"),
    ).toHaveTextContent("Great!");
    unmount();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/reviews/99"]}>
          <Routes>
            <Route
              path="/reviews/:itemid"
              element={<ReviewsForMenuItemPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(
      await screen.findByText("Reviews for Menu Item 99"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("ReviewTable-cell-row-0-col-itemId"),
    ).toHaveTextContent("99");
    expect(
      screen.getByTestId("ReviewTable-cell-row-0-col-reviewerComments"),
    ).toHaveTextContent("Meh!");
  });

  test("renders correct data for two different itemids in sequence (query key mutant)", async () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/diningcommons/menuitem?id=101").reply(200, {
      reviews: [
        {
          id: 1,
          itemId: 101,
          itemsStars: 5,
          reviewerComments: "First!",
          dateItemServed: "2024-01-01",
        },
      ],
    });
    axiosMock.onGet("/api/diningcommons/menuitem?id=202").reply(200, {
      reviews: [
        {
          id: 2,
          itemId: 202,
          itemsStars: 3,
          reviewerComments: "Second!",
          dateItemServed: "2024-02-01",
        },
      ],
    });
    const queryClient = new QueryClient();
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/reviews/101"]}>
          <Routes>
            <Route
              path="/reviews/:itemid"
              element={<ReviewsForMenuItemPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(
      await screen.findByText("Reviews for Menu Item 101"),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("ReviewTable-cell-row-0-col-itemId"),
    ).toHaveTextContent("101");
    expect(
      await screen.findByTestId("ReviewTable-cell-row-0-col-reviewerComments"),
    ).toHaveTextContent("First!");
    unmount();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/reviews/202"]}>
          <Routes>
            <Route
              path="/reviews/:itemid"
              element={<ReviewsForMenuItemPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(
      await screen.findByText("Reviews for Menu Item 202"),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("ReviewTable-cell-row-0-col-itemId"),
    ).toHaveTextContent("202");
    expect(
      await screen.findByTestId("ReviewTable-cell-row-0-col-reviewerComments"),
    ).toHaveTextContent("Second!");
  });

  test("renders zero rows if data is undefined (fallback array mutant)", async () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/diningcommons/menuitem?id=303").reply(200, undefined);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    renderWithProviders("/reviews/303");
    expect(
      await screen.findByText("Reviews for Menu Item 303"),
    ).toBeInTheDocument();
    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    expect(rows.length - 1).toBe(0);
  });

  test("renders zero rows if reviews property is missing (fallback array mutant)", async () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/diningcommons/menuitem?id=404").reply(200, {});
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    renderWithProviders("/reviews/404");
    expect(
      await screen.findByText("Reviews for Menu Item 404"),
    ).toBeInTheDocument();
    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    expect(rows.length - 1).toBe(0);
  });
});
