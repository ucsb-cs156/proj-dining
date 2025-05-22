import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import aliasFixtures from "fixtures/aliasFixtures";
import AliasTable from "main/components/Alias/AliasTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

jest.mock("react-toastify", () => ({ toast: jest.fn() }));

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
        `AliasTable-cell-row-${i}-col-proposedAlias`
      );
      expect(aliasCell).toHaveTextContent(aliasFixtures.threeAlias[i].proposedAlias);

      const approveCell = screen.getByTestId(`AliasTable-cell-row-${i}-col-approve`);
      expect(within(approveCell).getByRole("button")).toHaveClass("btn", "btn-success");

      const rejectCell = screen.getByTestId(`AliasTable-cell-row-${i}-col-reject`);
      expect(within(rejectCell).getByRole("button")).toHaveClass("btn", "btn-danger");
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

    const cell = await screen.findByTestId("AliasTable-cell-row-0-col-proposedAlias");
    expect(cell).toHaveTextContent(aliasFixtures.oneAlias[0].proposedAlias);
  });

  test("renders empty table correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={[]} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    ["Proposed Alias", "Approve", "Reject"].forEach(header =>
      expect(screen.getByText(header)).toBeInTheDocument()
    );
    expect(screen.queryByTestId("AliasTable-cell-row-0-col-proposedAlias")).toBeNull();
  });

  test("null proposed alias does nothing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.nullPropAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const approveCell = await screen.findByTestId("AliasTable-cell-row-0-col-approve");
    fireEvent.click(within(approveCell).getByRole("button"));
    expect(toast).not.toHaveBeenCalled();
  });

  test("The approve button approves the alias (toast)", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onPut("/api/currentUser/updateAliasModeration")
      .reply(200, { id: aliasFixtures.oneAlias[0].id, approved: true });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.oneAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const approveCell = await screen.findByTestId("AliasTable-cell-row-0-col-approve");
    fireEvent.click(within(approveCell).getByRole("button"));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        `Alias ${aliasFixtures.oneAlias[0].proposedAlias} for id ${aliasFixtures.oneAlias[0].id} approved!`
      );
    });
  });

  test("approve button calls API with correct params", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onPut("/api/currentUser/updateAliasModeration").reply(200, {
      id: aliasFixtures.oneAlias[0].id,
      approved: true
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.oneAlias} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const approveCell = await screen.findByTestId("AliasTable-cell-row-0-col-approve");
    fireEvent.click(within(approveCell).getByRole("button"));

    await waitFor(() => {
      const calls = axiosMock.history.put;
      expect(calls).toHaveLength(1);
      expect(calls[0].params).toEqual({
        id: aliasFixtures.oneAlias[0].id,
        approved: true
      });
    });
  });

  test("reject button calls API with correct params", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onPut("/api/currentUser/updateAliasModeration").reply(200, {
      id: aliasFixtures.oneAlias[0].id,
      approved: false
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.oneAlias} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const rejectCell = await screen.findByTestId("AliasTable-cell-row-0-col-reject");
    fireEvent.click(within(rejectCell).getByRole("button"));

    await waitFor(() => {
      const calls = axiosMock.history.put;
      expect(calls).toHaveLength(1);
      expect(calls[0].params).toEqual({
        id: aliasFixtures.oneAlias[0].id,
        approved: false
      });
    });
  });
});
