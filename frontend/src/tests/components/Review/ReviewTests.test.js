import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import ReviewForm from "main/components/Review/ReviewForm";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("ReviewForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["Reviewer Comments", "Date Item Served", "Rating"];
  const testId = "Review";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ReviewForm initialContents={ReviewFixtures.oneReview} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    // expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    // expect(screen.getByText(`Id`)).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ReviewForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  // test("that the correct validations are performed", async () => {
  //   render(
  //     <QueryClientProvider client={queryClient}>
  //       <Router>
  //         <ReviewForm />
  //       </Router>
  //     </QueryClientProvider>,
  //   );

  //   expect(await screen.findByText(/Create/)).toBeInTheDocument();
  //   const submitButton = screen.getByText(/Create/);
  //   fireEvent.click(submitButton);

  //   await screen.findByText(/Requester email is required/);
  //   expect(screen.getByText(/Professor email is required/)).toBeInTheDocument();
  //   expect(screen.getByText(/Explanation is required/)).toBeInTheDocument();
  //   expect(screen.getByText(/Date Requested is required/)).toBeInTheDocument();
  //   expect(screen.getByText(/Date Needed is required/)).toBeInTheDocument();
  //   //expect(screen.getByText(/Done is required/)).toBeInTheDocument();

  //   expect(
  //     screen.getByTestId("ReviewForm-dateRequested"),
  //   ).toBeInTheDocument();
  //   expect(
  //     screen.getByTestId("ReviewForm-dateNeeded"),
  //   ).toBeInTheDocument();
  //   expect(
  //     screen.getByTestId("ReviewForm-explanation"),
  //   ).toBeInTheDocument();
  //   expect(
  //     screen.getByTestId("ReviewForm-done"),
  //   ).toBeInTheDocument();
  //   expect(
  //     screen.getByTestId("ReviewForm-submit"),
  //   ).toBeInTheDocument();
  //   expect(
  //     screen.getByTestId("ReviewForm-professorEmail"),
  //   ).toBeInTheDocument();
  //   expect(
  //     screen.getByTestId("ReviewForm-requesterEmail"),
  //   ).toBeInTheDocument();

  //   const nameInput = screen.getByTestId(`${testId}-professorEmail`);
  //   fireEvent.change(nameInput, { target: { value: "a".repeat(256) } });
  //   fireEvent.click(submitButton);

  //   await waitFor(() => {
  //     expect(
  //       screen.getByText(/Max length 255 characters for professor email/),
  //     ).toBeInTheDocument();
  //   });

  //   const nameInput2 = screen.getByTestId(`${testId}-requesterEmail`);
  //   fireEvent.change(nameInput2, { target: { value: "a".repeat(256) } });
  //   fireEvent.click(submitButton);

  //   await waitFor(() => {
  //     expect(
  //       screen.getByText(/Max length 255 characters for requester email/),
  //     ).toBeInTheDocument();
  //   });
  // });
});
