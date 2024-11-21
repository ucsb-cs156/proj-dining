import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function ReviewForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
  moderatorOptions = false,
  deleteColumn = false,
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });

  const navigate = useNavigate();

  const isodate_regex =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;

  const integer_regex = /^[1-9]\d*$/i;

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="id">ID</Form.Label>
              <Form.Control
                data-testid="ReviewForm-id"
                id="id"
                type="text"
                {...register("id")}
                value={initialContents.id}
                disabled
              />
            </Form.Group>
          </Col>
        )}

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="studentId">Student ID</Form.Label>
            <Form.Control
              data-testid="ReviewForm-studentId"
              id="studentId"
              type="text"
              isInvalid={Boolean(errors.studentId)}
              {...register("studentId", {
                required: "Student ID is required",
                pattern: integer_regex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.studentId?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="itemId">Item ID</Form.Label>
            <Form.Control
              data-testid="ReviewForm-itemId"
              id="itemId"
              type="text"
              isInvalid={Boolean(errors.itemId)}
              {...register("itemId", {
                required: "Item ID is required",
                pattern: integer_regex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.itemId?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="dateItemServed">Date Item Served</Form.Label>
            <Form.Control
              data-testid="ReviewForm-dateItemServed"
              id="dateItemServed"
              type="datetime-local"
              isInvalid={Boolean(errors.dateItemServed)}
              {...register("dateItemServed", {
                required: "Date Item Served is required",
                pattern: isodate_regex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.dateItemServed?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="status">Status</Form.Label>
            <Form.Control
              data-testid="ReviewForm-status"
              id="status"
              type="text"
              value={initialContents?.status || "Awaiting Moderation"}
              disabled
              {...register("status")}
            />
          </Form.Group>
        </Col>

        {moderatorOptions && (
          <>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="userIdModerator">Moderator ID</Form.Label>
                <Form.Control
                  data-testid="ReviewForm-userIdModerator"
                  id="userIdModerator"
                  type="text"
                  {...register("userIdModerator")}
                />
              </Form.Group>
            </Col>

            <Col>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="moderatorComments">
                  Moderator Comments
                </Form.Label>
                <Form.Control
                  data-testid="ReviewForm-moderatorComments"
                  id="moderatorComments"
                  type="text"
                  {...register("moderatorComments")}
                />
              </Form.Group>
            </Col>
          </>
        )}
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="dateCreated">Date Created</Form.Label>
            <Form.Control
              data-testid="ReviewForm-dateCreated"
              id="dateCreated"
              type="datetime-local"
              value={initialContents?.dateCreated}
              disabled
              {...register("dateCreated")}
            />
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="dateEdited">Date Edited</Form.Label>
            <Form.Control
              data-testid="ReviewForm-dateEdited"
              id="dateEdited"
              type="datetime-local"
              value={initialContents?.dateEdited}
              disabled
              {...register("dateEdited")}
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

export default ReviewForm;
