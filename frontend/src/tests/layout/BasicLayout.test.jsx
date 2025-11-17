import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { vi } from "vitest";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

describe("BasicLayout tests", () => {
  const queryClient = new QueryClient();

  test("displays the correct page title", async () => {
    render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <BasicLayout />
          </MemoryRouter>
        </QueryClientProvider>,
      );
    expect(document.title).toBe("UCSB Dining");
  });
});