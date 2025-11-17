import { render, screen } from "@testing-library/react";
import Footer from "main/components/Nav/Footer";

describe("Footer tests", () => {
  test("renders correctly", async () => {
    render(<Footer />);
    const expectedText =
      "This app is a class project of CMPSC 156 at UCSB. Check out the source code on GitHub! This is not an official source of UCSB dining commons information. An official source can be found here.";
    expect(screen.getByTestId("Footer").textContent).toBe(expectedText);
  });
});
