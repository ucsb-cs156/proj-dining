import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import Footer from "main/components/Nav/Footer";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("Footer tests", () => {
  let axiosMock;
  let queryClient;

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
    queryClient = new QueryClient();
  });

  afterEach(() => {
    axiosMock.reset();
    queryClient.clear();
  });

  test("Links are correct", async () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    render(
      <QueryClientProvider client={queryClient}>
        <Footer />
      </QueryClientProvider>,
    );
    expect(screen.getByTestId("footer-class-website-link")).toHaveAttribute(
      "href",
      "https://ucsb-cs156.github.io",
    );
    expect(screen.getByTestId("footer-ucsb-link")).toHaveAttribute(
      "href",
      "https://ucsb.edu",
    );
    expect(screen.getByTestId("footer-source-code-link")).toHaveAttribute(
      "href",
      "https://github.com/ucsb-cs156/proj-dining",
    );

    expect(screen.getByTestId("footer-dining-search-link")).toHaveAttribute(
      "href",
      "https://apps.dining.ucsb.edu/menu/day",
    );
  });

  test("Feedback button is not shown when feedbackUrl is not set", async () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    render(
      <QueryClientProvider client={queryClient}>
        <Footer />
      </QueryClientProvider>,
    );
    // Wait for the component to settle after receiving API response
    await waitFor(() => {
      expect(
        screen.queryByTestId("footer-feedback-link"),
      ).not.toBeInTheDocument();
    });
  });

  test("Feedback button is shown when feedbackUrl is set", async () => {
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingFeedbackUrl);
    render(
      <QueryClientProvider client={queryClient}>
        <Footer />
      </QueryClientProvider>,
    );
    const feedbackButton = await screen.findByTestId("footer-feedback-link");
    expect(feedbackButton).toHaveAttribute(
      "href",
      "https://docs.google.com/forms/example",
    );
  });
});
