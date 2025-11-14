import { render, screen } from "@testing-library/react";
import Footer from "main/components/Nav/Footer";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

describe("Footer tests", () => {
  test("renders correctly with systemInfo", async () => {
    const systemInfo = systemInfoFixtures.showingNeither;
    render(<Footer systemInfo={systemInfo} />);
    
    // Check for main text
    expect(screen.getByText(/This app is a class project of/)).toBeInTheDocument();
    expect(screen.getByText(/CMPSC 156/)).toBeInTheDocument();
    expect(screen.getByText(/UCSB/)).toBeInTheDocument();
    expect(screen.getByText(/Check out the source code on/)).toBeInTheDocument();
    expect(screen.getByText(/GitHub/)).toBeInTheDocument();
    expect(screen.getByText(/This is not an official source of/)).toBeInTheDocument();
    expect(screen.getByText(/UCSB dining commons information/)).toBeInTheDocument();
    expect(screen.getByText(/An official source can be found/)).toBeInTheDocument();
    expect(screen.getByText(/here/)).toBeInTheDocument();
    
    // Check links
    const cmpscLink = screen.getByText("CMPSC 156");
    expect(cmpscLink).toHaveAttribute("href", "https://ucsb-cs156.github.io/");
    
    const ucsbLink = screen.getByText("UCSB");
    expect(ucsbLink).toHaveAttribute("href", "https://ucsb.edu/");
    
    const githubLink = screen.getByText("GitHub");
    expect(githubLink).toHaveAttribute("href", systemInfo.sourceRepo);
    
    const officialLink = screen.getByText("here");
    expect(officialLink).toHaveAttribute("href", "https://apps.dining.ucsb.edu/menu/day");
  });

  test("renders correctly with default sourceRepo when systemInfo is undefined", async () => {
    render(<Footer systemInfo={undefined} />);
    
    const githubLink = screen.getByText("GitHub");
    expect(githubLink).toHaveAttribute("href", "https://github.com/ucsb-cs156/proj-dining");
  });

  test("renders correctly with default sourceRepo when sourceRepo is missing", async () => {
    const systemInfoWithoutSourceRepo = {
      springH2ConsoleEnabled: false,
      showSwaggerUILink: false,
    };
    render(<Footer systemInfo={systemInfoWithoutSourceRepo} />);
    
    const githubLink = screen.getByText("GitHub");
    expect(githubLink).toHaveAttribute("href", "https://github.com/ucsb-cs156/proj-dining");
  });
});
