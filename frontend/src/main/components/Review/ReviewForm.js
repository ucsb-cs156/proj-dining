// import { Button, Form } from "react-bootstrap";
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router";

// function Review({ initialContents, submitAction, buttonLabel = "Create" }) {
//   // Stryker disable all
//   const {
//     register,
//     formState: { errors },
//     handleSubmit,
//   } = useForm({ defaultValues: initialContents || {} });
//   // Stryker restore all

//   const navigate = useNavigate();

//   const testIdPrefix = "Review";

//   return (
//     <Form onSubmit={handleSubmit(submitAction)}>
//       <Form.Group className="mb-3">
//         <Form.Label htmlFor="reviewerComments">Reviewer Comments</Form.Label>
//         <Form.Control
//           data-testid={testIdPrefix + "-reviewerComments"}
//           id="reviewerComments"
//           type="text"
//           isInvalid={Boolean(errors.reviewerComments)}
//           {...register("reviewerComments", {
//             required: "Reviewer Comment is required.",
//             maxLength: {
//               value: 255,
//               message: "Max length 255 characters for reviwer comments.",
//             },
//           })}
//         />
//         <Form.Control.Feedback type="invalid">
//           {errors.reviewerComments?.message}
//         </Form.Control.Feedback>
//       </Form.Group>

//       <Form.Group className="mb-3">
//         <Form.Label htmlFor="dateItemServed">Date Item Served</Form.Label>
//         <Form.Control
//           data-testid={testIdPrefix + "-dateItemServed"}
//           id="dateItemServed"
//           type="date"
//           isInvalid={Boolean(errors.dateItemServed)}
//           {...register("dateItemServed", {
//             required: "Date Item Served is required.",
//           })}
//         />
//         <Form.Control.Feedback type="invalid">
//           {errors.dateItemServed?.message}
//         </Form.Control.Feedback>
//       </Form.Group>

//       <Form.Group className="mb-3">
//         <Form.Label>Rating</Form.Label>
//         <div>
//           {[1, 2, 3, 4, 5].map((star) => (
//             <Form.Check
//               inline
//               key={star}
//               type="radio"
//               label={`${star} ⭐`}
//               value={star}
//               id={`itemsStars-${star}`}
//               data-testid={`${testIdPrefix}-itemsStars-${star}`}
//               isInvalid={Boolean(errors.itemsStars)}
//               {...register("itemsStars", {
//                 required: "Star rating is required.",
//               })}
//             />
//           ))}
//         </div>
//         <Form.Control.Feedback type="invalid">
//           {errors.itemsStars?.message}
//         </Form.Control.Feedback>
//       </Form.Group>

//       <Button type="submit" data-testid={testIdPrefix + "-submit"}>
//         {buttonLabel}
//       </Button>
//       <Button
//         variant="Secondary"
//         onClick={() => navigate(-1)}
//         data-testid={testIdPrefix + "-cancel"}
//       >
//         Cancel
//       </Button>
//     </Form>
//   );
// }

// export default Review;
// src/tests/components/Review/ReviewTests.test.js

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import { reviewFixtures } from "fixtures/reviewFixtures"; // note lowercase
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

    // buttons & labels
    expect(await screen.findByTestId("Review-submit")).toBeInTheDocument();
    expect(screen.getByText("Reviewer Comments")).toBeInTheDocument();
    expect(screen.getByText("Date Item Served")).toBeInTheDocument();
    expect(screen.getByText("Rating")).toBeInTheDocument();

    // empty fields
    expect(screen.getByTestId("Review-reviewerComments")).toHaveValue("");
    expect(screen.getByTestId("Review-dateItemServed")).toHaveValue("");

    // all stars are grey and styled
    for (let star = 1; star <= 5; star++) {
      const icon = screen.getByTestId(`Review-star-${star}`);
      expect(icon).toHaveAttribute("color", "#e4e5e9");
      expect(icon).toHaveStyle({
        cursor: "pointer",
        marginRight: "5px",
      });
    }
  });

  test("renders correctly with initialContents", async () => {
    const initial = {
      ...reviewFixtures.oneReview,
      reviewerComments: "Existing comment",
      dateItemServed: "2022-01-05",
      itemsStars: 2,
    };

    renderForm({ initialContents: initial });

    // prefilled inputs
    expect(await screen.findByTestId("Review-reviewerComments")).toHaveValue(
      "Existing comment",
    );
    expect(screen.getByTestId("Review-dateItemServed")).toHaveValue(
      "2022-01-05",
    );

    // stars ≤2 gold, others grey, and style present
    for (let star = 1; star <= 5; star++) {
      const icon = screen.getByTestId(`Review-star-${star}`);
      const expectedColor = star <= 2 ? "#ffc107" : "#e4e5e9";
      expect(icon).toHaveAttribute("color", expectedColor);
      expect(icon).toHaveStyle({
        cursor: "pointer",
        marginRight: "5px",
      });
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

    // only form-field errors—no star error yet
    expect(
      await screen.findByText("Reviewer Comment is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Date Item Served is required."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Star rating is required.")).toBeNull();
  });

  test("validations when fields filled but no star show star error", async () => {
    renderForm();

    // satisfy hook validations
    fireEvent.change(screen.getByTestId("Review-reviewerComments"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByTestId("Review-dateItemServed"), {
      target: { value: "2024-10-02" },
    });

    fireEvent.click(screen.getByTestId("Review-submit"));

    // now star error appears
    const starError = await screen.findByText("Star rating is required.");
    expect(starError).toBeInTheDocument();

    // and its own element has the correct inline style
    expect(starError).toHaveStyle("display: block");
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

    fireEvent.change(screen.getByTestId("Review-reviewerComments"), {
      target: { value: "ok" },
    });
    fireEvent.change(screen.getByTestId("Review-dateItemServed"), {
      target: { value: "2024-10-03" },
    });

    // click the 4th star
    fireEvent.click(screen.getByTestId("Review-star-4"));

    // finally submit
    fireEvent.click(screen.getByTestId("Review-submit"));

    await waitFor(() => expect(submitAction).toHaveBeenCalled());
    expect(submitAction).toHaveBeenCalledWith({
      reviewerComments: "ok",
      dateItemServed: "2024-10-03",
      itemsStars: 4,
    });
  });
});
