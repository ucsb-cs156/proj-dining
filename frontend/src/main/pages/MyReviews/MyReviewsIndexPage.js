import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReviewTable from "main/components/Review/ReviewTable";

// ✅ Named export for testing
export function extractReview(reviewOrCell) {
  return reviewOrCell?.row?.original ?? reviewOrCell;
}

// ✅ Named export for testing
export function useHandlers(navigate, deleteMutation) {
  return {
    handleEdit: (reviewOrCell) => {
      const review = extractReview(reviewOrCell);
      navigate(`/reviews/edit/${review.id}`);
    },
    handleDelete: (reviewOrCell) => {
      const review = extractReview(reviewOrCell);
      deleteMutation.mutate(review);
    },
  };
}

// ✅ Default export for rendering the page
export default function MyReviewsIndexPage() {
  const navigate = useNavigate();

  const {
    data: reviews,
    error: _error,
    status: _status,
  } = useBackend(
    ["/api/reviews/my"],
    { method: "GET", url: "/api/reviews/my" },
    []
  );

  const deleteMutation = useBackendMutation(
    (review) => ({
      url: `/api/reviews/${review.id}`,
      method: "DELETE",
    }),
    {
      onSuccess: () => {
        toast("Review deleted");
      },
    },
  );

  const { handleEdit, handleDelete } = useHandlers(navigate, deleteMutation);

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>My Reviews</h1>
        <ReviewTable
          reviews={reviews}
          userOptions={true}
          moderatorOptions={false}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </BasicLayout>
  );
}
