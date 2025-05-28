// import { fireEvent, render, screen, waitFor } from "@testing-library/react";
// import { BrowserRouter as Router } from "react-router";
// import { reviewFixtures } from "fixtures/reviewFixtures";
// import { QueryClient, QueryClientProvider } from "react-query";
// import ReviewForm from "main/components/Review/ReviewForm";

// const mockedNavigate = jest.fn();

// jest.mock("react-router", () => ({
//   ...jest.requireActual("react-router"),
//   useNavigate: () => mockedNavigate,
// }));

// describe("ReviewForm tests", () => {
//   const queryClient = new QueryClient();

//   const expectedHeaders = ["Reviewer Comments", "Date Item Served", "Rating"];
//   const testId = "Review";

//   test("renders correctly with no initialContents", async () => {
//     render(
//       <QueryClientProvider client={queryClient}>
//         <Router>
//           <ReviewForm />
//         </Router>
//       </QueryClientProvider>,
//     );

//     expect(await screen.findByText(/Create/)).toBeInTheDocument();
//     expect(screen.getByTestId("Review-submit")).toBeInTheDocument();

//     expectedHeaders.forEach((headerText) => {
//       const header = screen.getByText(headerText);
//       expect(header).toBeInTheDocument();
//     });

//     expect(screen.getByLabelText("1 ⭐")).toBeInTheDocument();
//     expect(screen.getByLabelText("3 ⭐")).toBeInTheDocument();
//     expect(screen.getByLabelText("5 ⭐")).toBeInTheDocument();
//   });

//   test("renders correctly when passing in initialContents", async () => {
//     render(
//       <QueryClientProvider client={queryClient}>
//         <Router>
//           <ReviewForm initialContents={reviewFixtures.oneReview} />
//         </Router>
//       </QueryClientProvider>,
//     );

//     expect(await screen.findByText(/Create/)).toBeInTheDocument();

//     expectedHeaders.forEach((headerText) => {
//       const header = screen.getByText(headerText);
//       expect(header).toBeInTheDocument();
//     });

//     // expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
//     // expect(screen.getByText(`Id`)).toBeInTheDocument();
//   });

//   test("that navigate(-1) is called when Cancel is clicked", async () => {
//     render(
//       <QueryClientProvider client={queryClient}>
//         <Router>
//           <ReviewForm />
//         </Router>
//       </QueryClientProvider>,
//     );
//     expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
//     const cancelButton = screen.getByTestId(`${testId}-cancel`);

//     fireEvent.click(cancelButton);

//     await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
//   });

//   test("that the correct validations are performed", async () => {
//     render(
//       <QueryClientProvider client={queryClient}>
//         <Router>
//           <ReviewForm />
//         </Router>
//       </QueryClientProvider>,
//     );

//     expect(await screen.findByText(/Create/)).toBeInTheDocument();
//     const submitButton = screen.getByText(/Create/);
//     fireEvent.click(submitButton);

//     await screen.findByText(/Reviewer Comment is required./);
//     expect(
//       screen.getByText(/Date Item Served is required./),
//     ).toBeInTheDocument();
//     expect(screen.getByText(/Star rating is required./)).toBeInTheDocument();
//     expect(screen.getByText(/Star rating is required./)).toBeVisible();

//     expect(screen.getByTestId(`${testId}-dateItemServed`)).toBeInTheDocument();
//     expect(
//       screen.getByTestId(`${testId}-reviewerComments`),
//     ).toBeInTheDocument();
//     expect(screen.getByTestId("Review-itemsStars-4")).toBeInTheDocument();

//     const starInput = screen.getByTestId("Review-itemsStars-4");
//     expect(starInput).toHaveAttribute("id", "itemsStars-4");

//     const nameInput = screen.getByTestId(`${testId}-reviewerComments`);
//     fireEvent.change(nameInput, { target: { value: "a".repeat(256) } });
//     fireEvent.click(submitButton);

//     await waitFor(() => {
//       expect(
//         screen.getByText(/Max length 255 characters for reviwer comments./),
//       ).toBeInTheDocument();
//     });
//   });
// });

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import { reviewFixtures } from "fixtures/reviewFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import ReviewForm from "main/components/Review/ReviewForm";

const mockedNavigate = jest.fn();

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockedNavigate,
}));

describe("ReviewForm tests", () => {
  const queryClient = new QueryClient();
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
    expect(screen.getByTestId(`${testId}-submit`)).toBeInTheDocument();

    expect(screen.getByText("Reviewer Comments")).toBeInTheDocument();
    expect(screen.getByText("Date Item Served")).toBeInTheDocument();
    expect(screen.getByText("Rating")).toBeInTheDocument();

    [1, 3, 5].forEach((star) => {
      expect(screen.getByTestId(`${testId}-star-${star}`)).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ReviewForm initialContents={reviewFixtures.oneReview} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    expect(screen.getByText("Reviewer Comments")).toBeInTheDocument();
    expect(screen.getByText("Date Item Served")).toBeInTheDocument();
    expect(screen.getByText("Rating")).toBeInTheDocument();
  });

  test("navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    const cancelButton = await screen.findByTestId(`${testId}-cancel`);
    fireEvent.click(cancelButton);
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("validations are performed on empty submit", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    const submitButton = screen.getByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    // Form field validations
    expect(
      await screen.findByText(/Reviewer Comment is required\./),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Date Item Served is required\./),
    ).toBeInTheDocument();

    // Fill in required fields to trigger star validation
    fireEvent.change(screen.getByTestId(`${testId}-reviewerComments`), {
      target: { value: "Great!" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateItemServed`), {
      target: { value: "2025-05-27" },
    });

    fireEvent.click(submitButton);

    expect(
      await screen.findByText(/Star rating is required\./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Star rating is required\./)).toBeVisible();
    const feedbackElements = screen.getAllByText(/Star rating is required\./);
    const feedback = feedbackElements.find((el) => el.tagName === "DIV");
    expect(feedback).toHaveStyle("display: block");
  });

  test("allows selecting star and submitting successfully", async () => {
    const mockSubmit = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ReviewForm submitAction={mockSubmit} />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-reviewerComments`), {
      target: { value: "Great meal!" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateItemServed`), {
      target: { value: "2024-05-27" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-star-4`));
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          reviewerComments: "Great meal!",
          dateItemServed: "2024-05-27",
          itemsStars: 4,
        }),
      );
    });
  });
});
