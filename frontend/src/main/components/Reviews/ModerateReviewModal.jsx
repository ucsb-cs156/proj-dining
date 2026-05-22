import Modal from "react-bootstrap/Modal";
import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

function ModerateReviewModal({
  showModal,
  toggleShowModal,
  review,
  status,
  onSubmitAction,
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({});

  // reset whenever modal opens or review changes
  useEffect(() => {
    if (showModal) {
      reset({ moderatorComments: "" });
    }
  }, [showModal, review, reset]);

  const closeModal = () => {
    toggleShowModal(false);
  };

  const submitWrapper = (data) => {
    if (!review || !status) return;

    onSubmitAction({
      review,
      status,
      moderatorComments: data.moderatorComments,
    });
  };

  return (
    <Modal
      show={showModal}
      onHide={closeModal}
      centered
      data-testid="ModerateReviewModal-base"
    >
      <Modal.Header>
        <Modal.Title>
          {status === "APPROVED" ? "Approve Review" : "Reject Review"}
        </Modal.Title>

        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={closeModal}
          data-testid="ModerateReviewModal-closeButton"
        />
      </Modal.Header>

      <Form onSubmit={handleSubmit(submitWrapper)}>
        <Modal.Body>
          <div style={{ marginBottom: "10px" }}>
            <strong>Item:</strong> {review?.item.name}
          </div>

          <div style={{ marginBottom: "10px" }}>
            <strong>Review:</strong> {review?.reviewerComments}
          </div>

          <Form.Group>
            <Form.Label htmlFor="moderatorComments">
              Moderator Comments
            </Form.Label>

            <Form.Control
              id="moderatorComments"
              as="textarea"
              rows={4}
              placeholder="Optional moderation notes..."
              isInvalid={Boolean(errors.moderatorComments)}
              data-testid="ModerateReviewModal-comments"
              {...register("moderatorComments")}
            />

            <Form.Control.Feedback type="invalid">
              {errors.moderatorComments?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={closeModal}
            data-testid="ModerateReviewModal-cancel"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            data-testid="ModerateReviewModal-submit"
          >
            {status === "APPROVED" ? "Approve" : "Reject"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ModerateReviewModal;
