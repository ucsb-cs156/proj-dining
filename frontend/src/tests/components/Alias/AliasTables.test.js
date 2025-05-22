import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import aliasFixtures from "fixtures/aliasFixtures";
import AliasTable from "main/components/Alias/AliasTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

// Mock toast and toast.error
jest.mock("react-toastify", () => {
  const toast = jest.fn();
  toast.error = jest.fn();
  return { toast };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("AliasTable tests", () => {
  const queryClient = new QueryClient();

  test("approve, reject, alias show up as expected", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.threeAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("AliasTable-header-proposedAlias");
    await screen.findByTestId("AliasTable-header-approve");
    await screen.findByTestId("AliasTable-header-reject");

    for (let i = 0; i < aliasFixtures.threeAlias.length; i++) {
      const aliasCell = await screen.findByTestId(
        `AliasTable-cell-row-${i}-col-proposedAlias`,
      );
      expect(aliasCell).toHaveTextContent(
        aliasFixtures.threeAlias[i].proposedAlias,
      );

      const approveBtn = within(
        screen.getByTestId(`AliasTable-cell-row-${i}-col-approve`),
      ).getByRole("button");
      expect(approveBtn).toHaveClass("btn", "btn-success");

      const rejectBtn = within(
        screen.getByTestId(`AliasTable-cell-row-${i}-col-reject`),
      ).getByRole("button");
      expect(rejectBtn).toHaveClass("btn", "btn-danger");
    }
  });

  test("one proposed alias", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.oneAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const aliasCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-proposedAlias",
    );
    expect(aliasCell).toHaveTextContent(
      aliasFixtures.oneAlias[0].proposedAlias,
    );
  });

  test("renders empty table correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={[]} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    ["Proposed Alias", "Approve", "Reject"].forEach((header) =>
      expect(screen.getByText(header)).toBeInTheDocument(),
    );
    expect(
      screen.queryByTestId("AliasTable-cell-row-0-col-proposedAlias"),
    ).toBeNull();
  });

  test("null proposed alias does nothing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.nullPropAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // cell is rendered but empty
    const aliasCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-proposedAlias",
    );
    expect(aliasCell).toHaveTextContent("");

    // clicking approve does not trigger toast
    const approveBtn = within(
      screen.getByTestId("AliasTable-cell-row-0-col-approve"),
    ).getByRole("button");
    fireEvent.click(approveBtn);
    expect(toast).not.toHaveBeenCalled();

    // clicking reject does not trigger toast
    const rejectBtn = within(
      screen.getByTestId("AliasTable-cell-row-0-col-reject"),
    ).getByRole("button");
    fireEvent.click(rejectBtn);
    expect(toast).not.toHaveBeenCalled();
  });

  test("approve button approves the alias (toast)", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onPut("/api/currentUser/updateAliasModeration").reply(200, {
      id: aliasFixtures.oneAlias[0].id,
      approved: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.oneAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const approveCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-approve",
    );
    fireEvent.click(within(approveCell).getByRole("button"));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        `Alias ${aliasFixtures.oneAlias[0].proposedAlias} for id ${
          aliasFixtures.oneAlias[0].id
        } approved!`,
      ),
    );
  });

  test("approve button calls API with correct url and params", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onPut("/api/currentUser/updateAliasModeration").reply(200, {
      id: aliasFixtures.oneAlias[0].id,
      approved: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.oneAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const approveCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-approve",
    );
    fireEvent.click(within(approveCell).getByRole("button"));

    await waitFor(() => expect(axiosMock.history.put).toHaveLength(1));
    const put = axiosMock.history.put[0];
    expect(put.url).toBe("/api/currentUser/updateAliasModeration");
    expect(put.params).toEqual({
      id: aliasFixtures.oneAlias[0].id,
      approved: true,
    });
  });

  test("approve button shows error toast on failure", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onPut("/api/currentUser/updateAliasModeration").networkError();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.oneAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const approveCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-approve",
    );
    fireEvent.click(within(approveCell).getByRole("button"));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        `Error approving alias: Network Error`,
      ),
    );
  });

  test("reject button calls API with correct url and params", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onPut("/api/currentUser/updateAliasModeration").reply(200, {
      id: aliasFixtures.oneAlias[0].id,
      approved: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.oneAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const rejectCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-reject",
    );
    fireEvent.click(within(rejectCell).getByRole("button"));

    await waitFor(() => expect(axiosMock.history.put).toHaveLength(1));
    const put = axiosMock.history.put[0];
    expect(put.url).toBe("/api/currentUser/updateAliasModeration");
    expect(put.params).toEqual({
      id: aliasFixtures.oneAlias[0].id,
      approved: false,
    });
  });

  test("reject button rejects the alias (toast)", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onPut("/api/currentUser/updateAliasModeration").reply(200, {
      id: aliasFixtures.oneAlias[0].id,
      approved: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.oneAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const rejectCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-reject",
    );
    fireEvent.click(within(rejectCell).getByRole("button"));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        `Alias ${aliasFixtures.oneAlias[0].proposedAlias} for id ${
          aliasFixtures.oneAlias[0].id
        } rejected!`,
      ),
    );
  });

  test("reject button shows error toast on failure", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onPut("/api/currentUser/updateAliasModeration").networkError();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.oneAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const rejectCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-reject",
    );
    fireEvent.click(within(rejectCell).getByRole("button"));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        `Error rejecting alias: Network Error`,
      ),
    );
  });
});
