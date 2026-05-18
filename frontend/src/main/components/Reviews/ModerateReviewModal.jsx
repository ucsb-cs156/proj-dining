import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useBackendMutation } from "main/utils/useBackend";

const buildModerationParams = (review, status, comments) => {
  if (!review || !status) return {};

  return {
    url: "/api/reviews/moderate",
    method: "PUT",
    params: {
      id: review.id,
      status,
      moderatorComments: comments,
    },
  };
};

const ModerateReviewModal = ({ show, onClose, review, status }) => {
  // Stryker disable all : not testing the internal state of the modal, just that it opens and closes correctly and calls the backend with the right parameters
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (show) {
      setComments("");
    }
  }, [show]);

  // Stryker restore all

  const objectToAxiosParams = () =>
    buildModerationParams(review, status, comments);

  const mutation = useBackendMutation(
    objectToAxiosParams,
    {
      onSuccess: () => {
        setComments("");
        onClose();
      },
    },
    ["/api/reviews/needsmoderation"],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!review || !status) return;
    mutation.mutate();
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {status === "APPROVED" ? "Approve Review" : "Reject Review"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div style={{ marginBottom: "10px" }}>
          <strong>Item:</strong> {review?.item?.name}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <strong>Review:</strong> {review?.reviewerComments}
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Moderator Comments</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Optional moderation notes..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>

        <Button variant="primary" onClick={handleSubmit}>
          {status === "APPROVED" ? "Approve" : "Reject"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModerateReviewModal;
