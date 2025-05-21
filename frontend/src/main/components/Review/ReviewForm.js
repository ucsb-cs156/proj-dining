import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function Review({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
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
      {initialContents && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control
            data-testid={testIdPrefix + "-id"}
            id="id"
            type="text"
            {...register("id")}
            value={initialContents.id}
            disabled
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label htmlFor="reviewerComments">Reviewer Comments</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-reviewerComments"}
          id="reviewerComments"
          type="text"
          isInvalid={Boolean(errors.reviewerComments)}
          {...register("reviewerComments", {
            required: "Requester email is required.",
            maxLength: {
              value: 255,
              message: "Max length 255 characters for requester email",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.reviewerComments?.message}
        </Form.Control.Feedback>
      </Form.Group>


      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateCreated">Date Created</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-dateCreated"}
          id="dateCreated"
          type="date"
          isInvalid={Boolean(errors.dateCreated)}
          {...register("dateCreated", {
            required: "Date Needed is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateCreated?.message}
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
