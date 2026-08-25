import { fireEvent, render, screen } from "@testing-library/react";
import Footer, { space } from "main/components/Nav/Footer";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

describe("Footer tests", () => {
  test("space is a space character", () => {
    expect(space).toBe(" ");
  });

  test("Links are correct", () => {
    render(<Footer />);
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

  test("Feedback button is not shown when systemInfo.appFeedbackUrl is not defined", () => {
    render(<Footer />);

    expect(
      screen.queryByTestId("footer-feedback-button"),
    ).not.toBeInTheDocument();
  });

  test("Feedback button is not shown when systemInfo.appFeedbackUrl is empty", () => {
    const systemInfo = {
      ...systemInfoFixtures.showingBoth,
      appFeedbackUrl: "",
    };

    render(<Footer systemInfo={systemInfo} />);

    expect(
      screen.queryByTestId("footer-feedback-button"),
    ).not.toBeInTheDocument();
  });

  test("Feedback button is shown when systemInfo.appFeedbackUrl is defined, and opens the feedback modal", () => {
    const systemInfo = systemInfoFixtures.showingFeedbackUrl;

    render(<Footer systemInfo={systemInfo} />);

    expect(
      screen.queryByTestId("footer-feedback-modal-link"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("footer-feedback-button"));

    expect(
      screen.getByText(/Users with a UCSB Google Account are welcome/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/try logging into your UCSB Email\/Google account/),
    ).toBeInTheDocument();

    expect(screen.getByTestId("footer-feedback-modal-link")).toHaveAttribute(
      "href",
      "https://docs.google.com/forms/example",
    );
    expect(screen.getByTestId("footer-feedback-modal-link")).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByTestId("footer-feedback-modal-link")).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });

  test("Feedback modal closes when the Cancel button is clicked", () => {
    const systemInfo = systemInfoFixtures.showingFeedbackUrl;

    render(<Footer systemInfo={systemInfo} />);

    fireEvent.click(screen.getByTestId("footer-feedback-button"));
    expect(screen.getByTestId("footer-feedback-modal-link")).toBeVisible();

    fireEvent.click(screen.getByTestId("footer-feedback-modal-close-button"));

    expect(
      screen.queryByTestId("footer-feedback-modal-link"),
    ).not.toBeInTheDocument();
  });

  test("Feedback modal closes when the Open Feedback Form button is clicked", () => {
    const systemInfo = systemInfoFixtures.showingFeedbackUrl;

    render(<Footer systemInfo={systemInfo} />);

    fireEvent.click(screen.getByTestId("footer-feedback-button"));
    expect(screen.getByTestId("footer-feedback-modal-link")).toBeVisible();

    fireEvent.click(screen.getByTestId("footer-feedback-modal-link"));

    expect(
      screen.queryByTestId("footer-feedback-modal-link"),
    ).not.toBeInTheDocument();
  });

  test("Feedback modal closes when the modal onHide is triggered", () => {
    const systemInfo = systemInfoFixtures.showingFeedbackUrl;

    render(<Footer systemInfo={systemInfo} />);

    fireEvent.click(screen.getByTestId("footer-feedback-button"));
    expect(screen.getByTestId("footer-feedback-modal-link")).toBeVisible();

    // Trigger the modal's close button (X) in the header
    fireEvent.click(screen.getByLabelText("Close"));

    expect(
      screen.queryByTestId("footer-feedback-modal-link"),
    ).not.toBeInTheDocument();
  });
});
