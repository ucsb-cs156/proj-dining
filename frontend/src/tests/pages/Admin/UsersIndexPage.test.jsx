import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import UsersIndexPage from "main/pages/Admin/UsersIndexPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import usersFixtures from "fixtures/usersFixtures";

describe("UsersIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const setup = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  test("renders without crashing", async () => {
    setup();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/users").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Users")).toBeInTheDocument();
  });

  test("renders three users in the table", async () => {
    setup();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/users").reply(200, usersFixtures.threeUsers);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("phtcon@ucsb.edu")).toBeInTheDocument();
    expect(screen.getByText("pconrad.cis@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("craig.zzyzx@example.org")).toBeInTheDocument();
  });

  test("page size selector has correct options", async () => {
    setup();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/users").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const select = await screen.findByTestId("UsersIndexPage-pageSize");
    expect(select).toBeInTheDocument();

    const options = select.querySelectorAll("option");
    const values = Array.from(options).map((o) => o.value);
    expect(values).toEqual(["10", "25", "50", "100", "500"]);
  });

  test("paging works correctly", async () => {
    setup();
    const queryClient = new QueryClient();
    // create 15 users to test pagination with default page size of 10
    const manyUsers = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      email: `user${i + 1}@ucsb.edu`,
      givenName: `First${i + 1}`,
      familyName: `Last${i + 1}`,
      admin: false,
      moderator: false,
    }));
    axiosMock.onGet("/api/admin/users").reply(200, manyUsers);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("UsersIndexPage-page-info"),
    ).toHaveTextContent("Page 1 of 2");

    // first page shows user1 but not user11
    expect(screen.getByText("user1@ucsb.edu")).toBeInTheDocument();
    expect(screen.queryByText("user11@ucsb.edu")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("UsersIndexPage-next"));

    expect(screen.getByTestId("UsersIndexPage-page-info")).toHaveTextContent(
      "Page 2 of 2",
    );
    expect(screen.getByText("user11@ucsb.edu")).toBeInTheDocument();
    expect(screen.queryByText("user1@ucsb.edu")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("UsersIndexPage-prev"));
    expect(screen.getByTestId("UsersIndexPage-page-info")).toHaveTextContent(
      "Page 1 of 2",
    );
  });

  test("prev button is disabled on first page", async () => {
    setup();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/users").reply(200, usersFixtures.threeUsers);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("UsersIndexPage-prev")).toBeDisabled();
    expect(screen.getByTestId("UsersIndexPage-next")).toBeDisabled();
  });

  test("prev from page 3 goes to page 2 (not page 1)", async () => {
    setup();
    const queryClient = new QueryClient();
    // 21 users → 3 pages at default page size of 10
    const manyUsers = Array.from({ length: 21 }, (_, i) => ({
      id: i + 1,
      email: `user${i + 1}@ucsb.edu`,
      givenName: `First${i + 1}`,
      familyName: `Last${i + 1}`,
      admin: false,
      moderator: false,
    }));
    axiosMock.onGet("/api/admin/users").reply(200, manyUsers);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("UsersIndexPage-page-info");

    // advance to page 3
    fireEvent.click(screen.getByTestId("UsersIndexPage-next"));
    fireEvent.click(screen.getByTestId("UsersIndexPage-next"));
    expect(screen.getByTestId("UsersIndexPage-page-info")).toHaveTextContent(
      "Page 3 of 3",
    );
    expect(screen.getByText("user21@ucsb.edu")).toBeInTheDocument();

    // prev from page 3 should go to page 2, not page 1
    fireEvent.click(screen.getByTestId("UsersIndexPage-prev"));
    expect(screen.getByTestId("UsersIndexPage-page-info")).toHaveTextContent(
      "Page 2 of 3",
    );
    expect(screen.getByText("user11@ucsb.edu")).toBeInTheDocument();
    expect(screen.queryByText("user1@ucsb.edu")).not.toBeInTheDocument();
    expect(screen.queryByText("user21@ucsb.edu")).not.toBeInTheDocument();
  });

  test("changing page size resets to first page", async () => {
    setup();
    const queryClient = new QueryClient();
    const manyUsers = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      email: `user${i + 1}@ucsb.edu`,
      givenName: `First${i + 1}`,
      familyName: `Last${i + 1}`,
      admin: false,
      moderator: false,
    }));
    axiosMock.onGet("/api/admin/users").reply(200, manyUsers);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("UsersIndexPage-page-info");

    // go to page 2
    fireEvent.click(screen.getByTestId("UsersIndexPage-next"));
    expect(screen.getByTestId("UsersIndexPage-page-info")).toHaveTextContent(
      "Page 2 of 2",
    );

    // change page size to 25 (all 15 fit on one page)
    fireEvent.change(screen.getByTestId("UsersIndexPage-pageSize"), {
      target: { value: "25" },
    });

    expect(screen.getByTestId("UsersIndexPage-page-info")).toHaveTextContent(
      "Page 1 of 1",
    );
  });
});
