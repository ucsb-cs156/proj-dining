import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function ReviewsForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  const navigate = useNavigate();

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="id">Id</Form.Label>
              <Form.Control
                data-testid="ReviewsForm-id"
                id="id"
                type="text"
                {...register("id")}
                value={initialContents.id}
                disabled
              />
            </Form.Group>
          </Col>
        )}
      </Row>

      {initialContents?.itemName && (
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="itemName">Item Being Reviewed</Form.Label>
              <Form.Control
                data-testid="ReviewsForm-itemName"
                id="itemName"
                type="text"
                value={initialContents.itemName}
                disabled
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="itemsStars">Stars (1-5)</Form.Label>
            <Form.Control
              data-testid="ReviewsForm-itemsStars"
              id="itemsStars"
              type="number"
              min={1}
              max={5}
              isInvalid={Boolean(errors.itemsStars)}
              {...register("itemsStars", {
                required: "Stars are required.",
                min: { value: 1, message: "Stars must be at least 1." },
                max: { value: 5, message: "Stars must be at most 5." },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.itemsStars?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="dateReviewed">Date Reviewed</Form.Label>
            <Form.Control
              data-testid="ReviewsForm-dateReviewed"
              id="dateReviewed"
              type="datetime-local"
              isInvalid={Boolean(errors.dateReviewed)}
              {...register("dateReviewed", {
                required: "Date Reviewed is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.dateReviewed?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="reviewerComments">
              Reviewer Comments
            </Form.Label>
            <Form.Control
              data-testid="ReviewsForm-reviewerComments"
              id="reviewerComments"
              as="textarea"
              rows={3}
              isInvalid={Boolean(errors.reviewerComments)}
              {...register("reviewerComments")}
            />
            <Form.Control.Feedback type="invalid">
              {errors.reviewerComments?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid="ReviewsForm-submit">
            {buttonLabel}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            data-testid="ReviewsForm-cancel"
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default ReviewsForm;
