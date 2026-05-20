import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

export default function ModeratorCommentsModal({
  show,
  onHide,
  status,
  onSubmit,
}) {
  const [comments, setComments] = useState("");

  const handleSubmit = () => {
    onSubmit(comments);
    setComments("");
    onHide();
  };

  const handleClose = () => {
    setComments("");
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      data-testid="ModeratorCommentsModal"
    >
      <Modal.Header closeButton data-testid="ModeratorCommentsModal-header">
        <Modal.Title data-testid="ModeratorCommentsModal-title">
          {status === "APPROVED" ? "Approve Review" : "Reject Review"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label htmlFor="moderator-comments">
              Moderator Comments
            </Form.Label>
            <Form.Control
              id="moderator-comments"
              as="textarea"
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              data-testid="ModeratorCommentsModal-comments"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleClose}
          data-testid="ModeratorCommentsModal-cancel"
        >
          Cancel
        </Button>
        <Button
          variant={status === "APPROVED" ? "primary" : "danger"}
          onClick={handleSubmit}
          data-testid="ModeratorCommentsModal-submit"
        >
          {status === "APPROVED" ? "Approve" : "Reject"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
