import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import React from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import ReviewForm from "main/components/MyReviews/ReviewForm";
import { useBackend } from "main/utils/useBackend";

export default function EditReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: review,
    isLoading,
    isError,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/reviews/${id}`],
    // Stryker disable next-line all
    {
      // Stryker disable next-line all : the default method is get, so replacing with an empty string will do nothing
      method: "GET",
      // Stryker disable next-line all : id will be defined from the route
      url: `/api/reviews/${id}`,
    },
  );

  const submitReview = async (formData) => {
    try {
      await axios.put(
        "/api/reviews/reviewer",
        {
          itemStars: formData.itemsStars,
          reviewerComments: formData.reviewerComments,
          dateItemServed: formData.dateItemServed,
        },
        {
          params: { id },
        },
      );
      toast(`Review updated for ${review.item.name}`);
      navigate(-1);
    } catch (err) {
      toast.error(
        `Error updating review: ${err.response?.data?.error || err.message}`,
      );
    }
  };

  if (isError) {
    return (
      <BasicLayout>
        <div className="pt-2">
          <h1>Edit review with id {id}</h1>
          <p>Unable to load review.</p>
        </div>
      </BasicLayout>
    );
  }

  if (isLoading || !review) {
    return (
      <BasicLayout>
        <div className="pt-2">
          <h1>Edit review with id {id}</h1>
          <p>Loading review...</p>
        </div>
      </BasicLayout>
    );
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit review with id {id}</h1>
        <ReviewForm
          initialItemName={review.item.name}
          initialReviewerComments={review.reviewerComments}
          initialItemsStars={review.itemsStars}
          initialDateItemServed={review.dateItemServed}
          submitAction={submitReview}
          submitButtonText="Update Review"
        />
      </div>
    </BasicLayout>
  );
}
