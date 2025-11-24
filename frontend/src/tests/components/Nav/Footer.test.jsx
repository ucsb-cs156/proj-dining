import { render, screen } from "@testing-library/react";
import Footer from "main/components/Nav/Footer";

describe("Footer tests", () => {
  test("Links are correct", async () => {
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
});
