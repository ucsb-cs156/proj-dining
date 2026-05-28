import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ReviewModeratorModal = ({ isOpen, onClose, status, onSubmit }) => {
  // Stryker disable next-line StringLiteral
  const [moderatorComment, setModeratorComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (status === "APPROVED" || status === "REJECTED") {
      onSubmit({ status, moderatorComment });
    }
    // Stryker disable next-line StringLiteral
    setModeratorComment("");
    onClose();
  };

  const handleClose = () => {
    // Stryker disable next-line StringLiteral
    setModeratorComment("");
    onClose();
  };

  const isApproved = status === "APPROVED";

  return (
    <Modal
      data-testid={"review-moderator-modal"}
      show={isOpen}
      onHide={handleClose}
    >
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group
            data-testid="review-moderator-modal-closeGroup"
            // Stryker disable all
            style={{ display: "flex", justifyContent: "right" }}
            // Stryker restore all
          ></Form.Group>
          <Form.Group>
            <Form.Label>
              {/* Stryker disable next-line StringLiteral */}
              You are about to{" "}
              <strong>
                {status === "APPROVED" ? "APPROVE" : "REJECT"}
              </strong>{" "}
              this review. Please add a moderator comment below.
            </Form.Label>
          </Form.Group>

          <Form.Group>
            <Form.Control
              data-testid="review-moderation-modal-comment"
              as="textarea"
              rows={4}
              placeholder="Enter moderator comment..."
              value={moderatorComment}
              onChange={(e) => setModeratorComment(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer
        data-testid={"review-moderator-modal-footer"}
        // Stryker disable all
        style={{ borderTop: "0px" }}
        // Stryker restore all
      >
        <Button
          data-testid={"review-moderator-modal-cancel"}
          variant="secondary"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          data-testid="review-moderation-modal-submit"
          variant={isApproved ? "success" : "danger"}
          onClick={handleSubmit}
        >
          {isApproved ? "Approve" : "Reject"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReviewModeratorModal;
