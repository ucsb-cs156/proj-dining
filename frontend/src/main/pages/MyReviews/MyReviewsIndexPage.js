import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import ReviewTable from "main/components/Reviews/ReviewTable";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";

export default function MyReviewsIndexPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useBackend(
    // Stryker disable next-line all: don't test internal caching of React Query
    ["/api/reviews/userReviews"],
    // Stryker disable next-line all: default method is get, so replacing with an empty string will do nothing
    { method: "GET", url: `/api/reviews/userReviews` },
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const deleteMutation = useBackendMutation(
    (review) => ({
      url: "/api/reviews/reviewer",
      method: "DELETE",
      params: { id: review.id },
    }),
    {
      onSuccess: () => {
        toast.success("Review deleted");
        setShowDeleteModal(false);
        setPendingDelete(null);
      },
      onError: () => {
        toast.error("Error deleting review");
      },
    },
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/reviews/userReviews"],
  );

  const onEdit = (cell) => {
    const id = cell.row.original.id;
    navigate(`/myreviews/edit/${id}`);
  };

  const onDelete = (cell) => {
    setPendingDelete(cell.row.original);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    // Stryker disable next-line all : don't test guard clause of pendingDelete
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPendingDelete(null);
  };

  if (isLoading) {
    return (
      <BasicLayout>
        <p>Loading...</p>
      </BasicLayout>
    );
  }

  // Stryker disable next-line all : Don't mutate error block
  if (error) {
    return (
      <BasicLayout>
        <p>Error loading reviews.</p>
      </BasicLayout>
    );
  }

  return (
    <BasicLayout>
      <h1>My Reviews</h1>
      <ReviewTable
        data={data}
        userOptions={true}
        moderatorOptions={false}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <Modal
        show={showDeleteModal}
        onHide={handleDeleteCancel}
        data-testid="delete-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this review?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </BasicLayout>
  );
}
