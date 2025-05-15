import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackendMutation } from "main/utils/useBackend";
import { useBackend } from "main/utils/useBackend";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReviewTable from "main/components/Review/ReviewTable";

export default function MyReviewsIndexPage() {
  const navigate = useNavigate();

  // Fetch reviews written by the current user
  const {
    data: reviews,
    error: _error,
    status: _status,
  } = useBackend(
    ["/api/reviews/my"],
    { method: "GET", url: "/api/reviews/my" },
    [],
  );

  // Backend mutation for deleting a review
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
    ["/api/reviews/my"], // will revalidate after deletion
  );

  // Handlers
  const handleEdit = (review) => {
    navigate(`/reviews/edit/${review.id}`);
  };

  const handleDelete = async (review) => {
    deleteMutation.mutate(review);
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>My Reviews</h1>
        <ReviewTable
          reviews={reviews}
          currentUser={{}} // not used in this case, safe placeholder
          userOptions={true}
          moderatorOptions={false}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </BasicLayout>
  );
}
