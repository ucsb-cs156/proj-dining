import { render, screen } from "@testing-library/react";
import Footer from "main/components/Nav/Footer";

describe("Footer tests", () => {
  test("renders correctly", async () => {
    render(<Footer />);

    expect(
      screen.getByText(/This app is a class project of/),
    ).toBeInTheDocument();
    expect(screen.getByText(/CMPSC 156/)).toBeInTheDocument();
    expect(screen.getByText(/at/)).toBeInTheDocument();
    expect(screen.getByText(/UCSB/)).toBeInTheDocument();

    const cmpsc156Link = screen.getByRole("link", { name: /CMPSC 156/i });
    expect(cmpsc156Link).toHaveAttribute(
      "href",
      "https://ucsb-cs156.github.io/",
    );

    const ucsbLink = screen.getByRole("link", { name: /UCSB/i });
    expect(ucsbLink).toHaveAttribute("href", "https://ucsb.edu/");

    const githubLink = screen.getByRole("link", { name: /GitHub/i });
    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/ucsb-cs156/proj-courses",
    );

    const diningLink = screen.getByRole("link", { name: /here/i });
    expect(diningLink).toHaveAttribute(
      "href",
      "https://apps.dining.ucsb.edu/menu/day",
    );
  });
});
