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
// src/tests/components/Review/ReviewTests.test.js

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import { reviewFixtures } from "fixtures/reviewFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import ReviewForm from "main/components/Review/ReviewForm";

const mockedNavigate = jest.fn();
const queryClient = new QueryClient();

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockedNavigate,
}));

describe("ReviewForm", () => {
  const renderForm = (props = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ReviewForm {...props} />
        </Router>
      </QueryClientProvider>,
    );

  test("renders correctly with no initialContents", async () => {
    renderForm();

    // submit button + labels
    expect(await screen.findByTestId("Review-submit")).toBeInTheDocument();
    expect(screen.getByText("Reviewer Comments")).toBeInTheDocument();
    expect(screen.getByText("Date Item Served")).toBeInTheDocument();
    expect(screen.getByText("Rating")).toBeInTheDocument();

    // fields start empty
    expect(screen.getByTestId("Review-reviewerComments")).toHaveValue("");
    expect(screen.getByTestId("Review-dateItemServed")).toHaveValue("");

    // all stars gray
    for (let star = 1; star <= 5; star++) {
      expect(screen.getByTestId(`Review-star-${star}`)).toHaveAttribute(
        "color",
        "#e4e5e9",
      );
    }
  });

  test("renders correctly with initialContents", async () => {
    // extend fixture with form‐fields
    const initial = {
      ...reviewFixtures.oneReview,
      reviewerComments: "Existing comment",
      dateItemServed: "2022-01-05",
      itemsStars: 2,
    };

    renderForm({ initialContents: initial });

    // form inputs populated
    expect(await screen.findByTestId("Review-reviewerComments")).toHaveValue(
      "Existing comment",
    );
    expect(screen.getByTestId("Review-dateItemServed")).toHaveValue(
      "2022-01-05",
    );

    // stars <= 2 gold, >2 gray
    for (let star = 1; star <= 2; star++) {
      expect(screen.getByTestId(`Review-star-${star}`)).toHaveAttribute(
        "color",
        "#ffc107",
      );
    }
    for (let star = 3; star <= 5; star++) {
      expect(screen.getByTestId(`Review-star-${star}`)).toHaveAttribute(
        "color",
        "#e4e5e9",
      );
    }
  });

  test("navigate(-1) is called when Cancel is clicked", async () => {
    renderForm();
    const cancel = await screen.findByTestId("Review-cancel");
    fireEvent.click(cancel);
    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });

  test("validations on empty submit show only field errors", async () => {
    renderForm();

    fireEvent.click(screen.getByTestId("Review-submit"));

    // field errors appear
    expect(
      await screen.findByText("Reviewer Comment is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Date Item Served is required."),
    ).toBeInTheDocument();

    // star‐error NOT shown until fields are valid
    expect(screen.queryByText("Star rating is required.")).toBeNull();
  });

  test("validations when fields filled but no star show star error", async () => {
    renderForm();

    // fill required inputs
    fireEvent.change(screen.getByTestId("Review-reviewerComments"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByTestId("Review-dateItemServed"), {
      target: { value: "2022-01-02" },
    });

    fireEvent.click(screen.getByTestId("Review-submit"));

    // now the star‐error displays
    const starError = await screen.findByText("Star rating is required.");
    expect(starError).toBeInTheDocument();

    // and its container has inline display style
    expect(starError.parentElement).toHaveStyle("display: block");
  });

  test("maxLength validation for reviewer comments", async () => {
    renderForm();

    const input = screen.getByTestId("Review-reviewerComments");
    fireEvent.change(input, { target: { value: "a".repeat(256) } });
    fireEvent.click(screen.getByTestId("Review-submit"));

    expect(
      await screen.findByText(
        "Max length 255 characters for reviwer comments.",
      ),
    ).toBeInTheDocument();
  });

  test("allows selecting star and submitting successfully", async () => {
    const submitAction = jest.fn();
    renderForm({ submitAction });

    // fill all required fields
    fireEvent.change(screen.getByTestId("Review-reviewerComments"), {
      target: { value: "ok" },
    });
    fireEvent.change(screen.getByTestId("Review-dateItemServed"), {
      target: { value: "2022-01-03" },
    });

    // pick 4 stars
    fireEvent.click(screen.getByTestId("Review-star-4"));

    fireEvent.click(screen.getByTestId("Review-submit"));

    await waitFor(() => expect(submitAction).toHaveBeenCalled());

    expect(submitAction).toHaveBeenCalledWith({
      reviewerComments: "ok",
      dateItemServed: "2022-01-03",
      itemsStars: 4,
    });
  });
});
