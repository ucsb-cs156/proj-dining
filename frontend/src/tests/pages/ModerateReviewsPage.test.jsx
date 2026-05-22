import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import ModerateReviews from "main/pages/ModerateReviewsPage";
import { vi } from "vitest";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
// import mockConsole from "tests/testutils/mockConsole";
import ReviewForm from "main/components/MyReviews/ReviewForm";

const mockMutate = vi.fn();
//const mockToast = vi.fn();


describe("ModerateReviews Page Tests (Updated)", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "Reviewstable";

  const setupModerator = () => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock.onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.moderatorUser);

    axiosMock.onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdmin = () => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock.onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);

    axiosMock.onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock.onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);

    axiosMock.onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  test("renders reviews with approve/reject buttons for moderator", async () => {
    setupModerator();

    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-item.id`)
      ).toHaveTextContent("7");
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`)
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-Reject-button`)
    ).toBeInTheDocument();
  });

  test("renders reviews with approve/reject buttons for admin", async () => {
    setupAdmin();

    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-item.id`)
      ).toHaveTextContent("7");
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`)
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-Reject-button`)
    ).toBeInTheDocument();
  });

  test("does NOT render approve/reject buttons for regular user", async () => {
    setupUserOnly();

    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-item.id`)
      ).not.toBeInTheDocument();
    });

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Approve-button`)
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Reject-button`)
    ).not.toBeInTheDocument();
  });

  test("opens modal when Approve clicked and submits moderation", async () => {
    setupModerator();

    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    axiosMock
      .onPut("/api/reviews/moderate")
      .reply(200);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`)
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`)
    );

    await waitFor(() => {
      expect(screen.getByText("Approve Review")).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByTestId("ModerateReviewModal-comments"),
      {
        target: { value: "Looks good" },
      }
    );

    fireEvent.click(screen.getByTestId("ModerateReviewModal-submit"));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    await waitFor(() => { 
      expect(screen.queryByText("Approve Review")).not.toBeInTheDocument();
    });


    const putRequest = axiosMock.history.put[0];
    const params = putRequest.params;

    expect(params).toBeDefined();
    expect(params.id).toBeDefined();
    expect(params.status).toBe("APPROVED");
    expect(params.moderatorComments).toBe("Looks good");

  

  });

  test("modal opens and closes with Cancel", async () => {
    setupModerator();

    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`)
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`)
    );

    await waitFor(() => {
      expect(screen.getByText("Approve Review")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(
        screen.queryByText("Approve Review")
      ).not.toBeInTheDocument();
    });
  });

  test("modal not visible initially", async () => {
    setupModerator();

    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`)
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("Approve Review")).not.toBeInTheDocument();
    expect(screen.queryByText("Reject Review")).not.toBeInTheDocument();
  });

  test("modal closes after successful moderation submission", async () => {
    setupModerator();
    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    axiosMock
      .onPut("/api/reviews/moderate")
      .reply(200);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`)
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`));

    await waitFor(() => {
      expect(screen.getByText("Approve Review")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("ModerateReviewModal-comments"), {
      target: { value: "Looks good" },
    });

    fireEvent.click(screen.getByTestId("ModerateReviewModal-submit"));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    await waitFor(() => {
      expect(screen.queryByText("Approve Review")).not.toBeInTheDocument();
    });
  });

  test("closeModal clears selected review, status, and closes modal", async () => {
    setupModerator();

    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Open modal (sets review + status)
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button")
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button")
    );

    await waitFor(() => {
      expect(screen.getByText("Approve Review")).toBeInTheDocument();
    });

    // Close modal → triggers closeModal()
    fireEvent.click(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(screen.queryByText("Approve Review")).not.toBeInTheDocument();
      expect(screen.queryByText("Reject Review")).not.toBeInTheDocument();
    });

    // Re-open modal to verify state was actually reset (important for full coverage)
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button")
    );

    await waitFor(() => {
      expect(screen.getByText("Approve Review")).toBeInTheDocument();
    });
  });

  test("opens modal and submits moderation (approve flow)", async () => {
  setupModerator();

  const queryClient = new QueryClient();

  axiosMock
    .onGet("/api/reviews/needsmoderation")
    .reply(200, ReviewFixtures.threeReviews);

  axiosMock
    .onPut("/api/reviews/moderate")
    .reply((config) => {
      const params = config.params;

      expect(params.status).toBe("APPROVED");
      expect(params.moderatorComments).toBe("Looks good");
      expect(params.id).toBeDefined();

      return [200, {}];
    });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ModerateReviews />
      </MemoryRouter>
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button")
    ).toBeInTheDocument();
  });

  fireEvent.click(
    screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button")
  );

  await waitFor(() => {
    expect(screen.getByText("Approve Review")).toBeInTheDocument();
  });

  fireEvent.change(
    screen.getByTestId("ModerateReviewModal-comments"),
    { target: { value: "Looks good" } }
  );

  fireEvent.click(screen.getByTestId("ModerateReviewModal-submit"));

  await waitFor(() => {
    expect(axiosMock.history.put.length).toBe(1);
  });
});

  test("refetches reviews after successful moderation (cache invalidation)", async () => {
  setupModerator();

  const queryClient = new QueryClient();

  let getCallCount = 0;

  axiosMock
    .onGet("/api/reviews/needsmoderation")
    .reply(() => {
      getCallCount += 1;
      return [200, ReviewFixtures.threeReviews];
    });

  axiosMock
    .onPut("/api/reviews/moderate")
    .reply(200);

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ModerateReviews />
      </MemoryRouter>
    </QueryClientProvider>
  );

  // initial load
  await waitFor(() => {
    expect(getCallCount).toBe(1);
  });

  fireEvent.click(
    screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button")
  );

  await waitFor(() => {
    expect(screen.getByText("Approve Review")).toBeInTheDocument();
  });

  fireEvent.change(
    screen.getByTestId("ModerateReviewModal-comments"),
    {
      target: { value: "Looks good" },
    }
  );

  fireEvent.click(screen.getByTestId("ModerateReviewModal-submit"));

  await waitFor(() => {
    expect(getCallCount).toBe(2);
  });
});

test("fetches reviews using GET method", async () => {
  setupModerator();
  const queryClient = new QueryClient();

  axiosMock.onGet("/api/reviews/needsmoderation").reply(200, ReviewFixtures.threeReviews);

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ModerateReviews />
      </MemoryRouter>
    </QueryClientProvider>
  );

  await waitFor(() => {
    const getRequest = axiosMock.history.get.find(
      (r) => r.url === "/api/reviews/needsmoderation"
    );
    expect(getRequest).toBeDefined();
    expect(getRequest.method).toBe("get");
  });
});

test("resets moderator comments when modal opens", async () => {
  setupModerator();

  const queryClient = new QueryClient();

  axiosMock
    .onGet("/api/reviews/needsmoderation")
    .reply(200, ReviewFixtures.threeReviews);

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ModerateReviews />
      </MemoryRouter>
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button")
    ).toBeInTheDocument();
  });

  fireEvent.click(
    screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button")
  );

  await waitFor(() => {
    expect(
      screen.getByTestId("ModerateReviewModal-comments")
    ).toHaveValue("");
  });

  fireEvent.change(
    screen.getByTestId("ModerateReviewModal-comments"),
    { target: { value: "hello" } }
  );

  fireEvent.click(screen.getByText("Cancel"));

  fireEvent.click(
    screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button")
  );

  await waitFor(() => {
    expect(
      screen.getByTestId("ModerateReviewModal-comments")
    ).toHaveValue("");
  });
});

test("modal closes after cancel explicitly removes modal", async () => {
  setupModerator();

  const queryClient = new QueryClient();

  axiosMock
    .onGet("/api/reviews/needsmoderation")
    .reply(200, ReviewFixtures.threeReviews);

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ModerateReviews />
      </MemoryRouter>
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button")
    ).toBeInTheDocument();
  });

  fireEvent.click(
    screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button")
  );

  await waitFor(() => {
    expect(screen.getByText("Approve Review")).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText("Cancel"));

  await waitFor(() => {
    expect(screen.queryByText("Approve Review")).not.toBeInTheDocument();
  });

  expect(
    screen.queryByTestId("ModerateReviewModal-comments")
  ).not.toBeInTheDocument();
});


test("modal must close after cancel and not remain open", async () => {
  setupModerator();

  const queryClient = new QueryClient();

  axiosMock
    .onGet("/api/reviews/needsmoderation")
    .reply(200, ReviewFixtures.threeReviews);

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ModerateReviews />
      </MemoryRouter>
    </QueryClientProvider>
  );

  // open modal
  await waitFor(() => {
    expect(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button")
    ).toBeInTheDocument();
  });

  fireEvent.click(
    screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button")
  );

  await waitFor(() => {
    expect(screen.getByText("Approve Review")).toBeInTheDocument();
  });

  // close modal via Cancel
  fireEvent.click(screen.getByText("Cancel"));

  await waitFor(() => {
    expect(screen.queryByText("Approve Review")).toBeNull();
    expect(screen.queryByText("Reject Review")).toBeNull();
  });

  expect(screen.queryByTestId("ModerateReviewModal-comments")).toBeNull();

  fireEvent.click(
    screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button")
  );

  await waitFor(() => {
    expect(screen.getByText("Approve Review")).toBeInTheDocument();
  });
});

test("fetches reviews using correct endpoint", async () => {
  setupModerator();

  const queryClient = new QueryClient();

  axiosMock
    .onGet("/api/reviews/needsmoderation")
    .reply(200, ReviewFixtures.threeReviews);

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ModerateReviews />
      </MemoryRouter>
    </QueryClientProvider>
  );

  await waitFor(() => {
    const getRequest = axiosMock.history.get.find(
      (r) => r.url === "/api/reviews/needsmoderation"
    );

    expect(getRequest).toBeDefined();
    expect(getRequest.url).toBe("/api/reviews/needsmoderation");
  });
});

test("modal must close after submission and not reopen without click", async () => {
  setupModerator();

  const queryClient = new QueryClient();

  axiosMock
    .onGet("/api/reviews/needsmoderation")
    .reply(200, ReviewFixtures.threeReviews);

  axiosMock
    .onPut("/api/reviews/moderate")
    .reply(200);

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ModerateReviews />
      </MemoryRouter>
    </QueryClientProvider>
  );

  // open modal
  await waitFor(() => {
    expect(screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"))
      .toBeInTheDocument();
  });

  fireEvent.click(
    screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button")
  );

  await waitFor(() => {
    expect(screen.getByText("Approve Review")).toBeInTheDocument();
  });

  // submit
  fireEvent.change(
    screen.getByTestId("ModerateReviewModal-comments"),
    { target: { value: "ok" } }
  );

  fireEvent.click(screen.getByTestId("ModerateReviewModal-submit"));

  // modal must close
  await waitFor(() => {
    expect(screen.queryByText("Approve Review")).not.toBeInTheDocument();
  });

  expect(screen.queryByText("Approve Review")).not.toBeInTheDocument();
});

});



