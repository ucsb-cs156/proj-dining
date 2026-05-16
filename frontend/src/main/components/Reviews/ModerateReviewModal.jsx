import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import { useBackendMutation } from "main/utils/useBackend";

const ModerateReviewModal = ({
  show,
  onClose,
  review,
  status,
}) => {
    const [comments, setComments] = useState("");

    useEffect(() => {
        if (show) {
        setComments("");
        }
    }, [show, review, status]);

    const objectToAxiosParams = () => ({
        url: "/api/reviews/moderate",
        method: "PUT",
        params: {
        id: review?.id,
        status: status,
        moderatorComments: comments,
        },
    });

    const mutation = useBackendMutation(
        objectToAxiosParams,
        {
        onSuccess: () => {
            setComments("");
            onClose();
        },
        },
        ["/api/reviews/needsmoderation"]
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!review || !status) return;
        mutation.mutate();
    };

    if (!show || !review) return null;

    // disabled={!review || !status}


  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {status === "APPROVED" ? "Approve Review" : "Reject Review"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div style={{ marginBottom: "10px" }}>
          <strong>Item:</strong> {review.item?.name}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <strong>Review:</strong> {review.reviewerComments}
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
