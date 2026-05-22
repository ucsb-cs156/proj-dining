import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useNavigate, useParams } from "react-router";
import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ReviewForm from "main/components/MyReviews/ReviewForm";
import { useBackend } from "main/utils/useBackend";

export default function EditReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: review } = useBackend(
    [`/api/reviews/${id}`],
    {
      method: "GET",
      url: `/api/reviews/${id}`,
    },
    {},
  );

  const itemName = review.item?.name;

  const submitReview = async (formData) => {
    try {
      await axios.put("/api/reviews/reviewer", formData, {
        params: {
          id,
        },
      });
      toast(`Review updated for ${itemName}`);
      navigate(-1);
    } catch (err) {
      toast.error(
        `Error updating review: ${err.response?.data?.error || err.message}`,
      );
    }
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit review with id {id}</h1>
        <ReviewForm
          initialItemName={review.item?.name}
          initialContents={review}
          submitAction={submitReview}
          buttonLabel="Update Review"
        />
      </div>
    </BasicLayout>
  );
}
