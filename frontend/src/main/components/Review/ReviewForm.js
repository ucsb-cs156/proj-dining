import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function Review({ initialContents, submitAction, buttonLabel = "Create" }) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();

  const testIdPrefix = "Review";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="reviewerComments">Reviewer Comments</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-reviewerComments"}
          id="reviewerComments"
          type="text"
          isInvalid={Boolean(errors.reviewerComments)}
          {...register("reviewerComments", {
            required: "Reviewer Comment is required.",
            maxLength: {
              value: 255,
              message: "Max length 255 characters for reviwer comments.",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.reviewerComments?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateItemServed">Date Item Served</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-dateItemServed"}
          id="dateItemServed"
          type="date"
          isInvalid={Boolean(errors.dateItemServed)}
          {...register("dateItemServed", {
            required: "Date Item Served is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateItemServed?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Rating</Form.Label>
        <div>
          {[1, 2, 3, 4, 5].map((star) => (
            <Form.Check
              inline
              key={star}
              type="radio"
              label={`${star} ⭐`}
              value={star}
              id={`itemsStars-${star}`}
              data-testid={`${testIdPrefix}-itemsStars-${star}`}
              isInvalid={Boolean(errors.itemsStars)}
              {...register("itemsStars", {
                required: "Star rating is required.",
              })}
            />
          ))}
        </div>
        <Form.Control.Feedback type="invalid" style={{ display: "block" }}>
          {errors.itemsStars?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button type="submit" data-testid={testIdPrefix + "-submit"}>
        {buttonLabel}
      </Button>
      <Button
        variant="Secondary"
        onClick={() => navigate(-1)}
        data-testid={testIdPrefix + "-cancel"}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default Review;
