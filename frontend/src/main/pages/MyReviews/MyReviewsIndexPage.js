import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReviewTable from "main/components/Review/ReviewTable";

export function extractReview(reviewOrCell) {
  return reviewOrCell?.row?.original ?? reviewOrCell;
}

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

export default function MyReviewsIndexPage() {
  const navigate = useNavigate();

  const {
    data: reviews,
    error: _error,
    status: _status,
  } = useBackend(
    ["/api/reviews/userReviews"],
    { method: "GET", url: "/api/reviews/userReviews" },
    [],
  );

  const deleteMutation = useBackendMutation(
    (review) => ({
      url: `/api/reviews/reviewer`,
      method: "DELETE",
      params: {
        id: review.id,
      },
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
