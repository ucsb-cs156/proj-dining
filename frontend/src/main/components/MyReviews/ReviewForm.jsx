import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

export default function ReviewForm({
  initialItemName,
  submitAction,
  buttonLabel = "Submit Review",
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      reviewerComments: "",
      itemsStars: 5,
      dateItemServed: new Date().toISOString().slice(0, 16), // default to now, in YYYY-MM-DDTHH:mm format (UTC)
    },
  });

  const navigate = useNavigate();

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="review-item-name">Item Name</Form.Label>
        <Form.Control
          data-testid="ReviewForm-review-item-name"
          id="review-item-name"
          type="text"
          value={initialItemName}
          disabled
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="review-comments">Comments</Form.Label>
        <Form.Control
          data-testid="ReviewForm-review-comments"
          id="review-comments"
          as="textarea"
          rows={3}
          {...register("reviewerComments")} // not required
        />
      </Form.Group>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="review-stars">Stars (1 to 5)</Form.Label>
            <Form.Select
              data-testid="ReviewForm-review-stars"
              id="review-stars"
              {...register("itemsStars", {
                // default+unemptiable, so required unneeded for frontend
                valueAsNumber: true,
                min: 1,
                max: 5,
              })}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="review-date">
              Date and Time Item was Served
            </Form.Label>
            <Form.Control
              data-testid="ReviewForm-review-date"
              id="review-date"
              type="datetime-local" // HTML native handling of invalid input, so required unneeded for frontend. default already step="60" as desired
              isInvalid={Boolean(errors.dateItemServed)}
              {...register("dateItemServed")}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid="ReviewForm-submit">
            {buttonLabel}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            data-testid="ReviewForm-cancel"
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
