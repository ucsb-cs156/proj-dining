
import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function ModerationModal({
  show,
  onHide,
  status,
  moderatorComments,
  onModeratorCommentsChange,
  onSubmit,
  review,
}) {
  const title = status === "APPROVED" ? "Approve Review" : "Reject Review";
  const actionText = status === "APPROVED" ? "Approve" : "Reject";
  const actionVerb = status === "APPROVED" ? "approving" : "rejecting";

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Please add moderator comments before {actionVerb} this review.
        </p>
        <Form.Group controlId="moderatorComments">
          <Form.Label>Moderator Comments</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={moderatorComments}
            onChange={(e) => onModeratorCommentsChange(e.target.value)}
            placeholder="Enter your moderator comments here"
            data-testid="moderation-modal-comments"
          />
        </Form.Group>
        {review && (
          <div className="mt-3">
            <strong>Review ID:</strong> {review.id}
            <br />
            <strong>Item:</strong> {review.item?.name ?? "Unknown"}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant={status === "APPROVED" ? "primary" : "danger"}
          onClick={onSubmit}
          disabled={!moderatorComments.trim()}
          data-testid="moderation-modal-submit"
        >
          {actionText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
