import { render, screen } from "@testing-library/react";
import Footer from "main/components/Nav/Footer";

describe("Footer tests", () => {
  test("renders correctly", async () => {
    render(<Footer />);
    const expectedText =
      "This is a sample webapp using React with a Spring Boot backend. See the source code on Github.";
    expect(screen.getByTestId("Footer").textContent).toBe(expectedText);
  });
});
