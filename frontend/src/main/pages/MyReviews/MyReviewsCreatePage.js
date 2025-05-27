import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewForm from "main/components/MyReviews/ReviewForm";

export default function MyReviewsCreatePage() {
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("itemId");
  const itemName = searchParams.get("itemName");
  const navigate = useNavigate();

  const submitReview = async (formData) => {
    try {
      await axios.post("/api/reviews/post", null, {
        params: {
          itemId,
          reviewerComments: formData.reviewerComments,
          itemsStars: formData.itemsStars,
          dateItemServed: formData.dateItemServed,
        },
      });
      toast(`Review submitted for ${itemName}`);
      navigate("/myreviews");
    } catch (err) {
      toast.error(
        `Error submitting review: ${err.response?.data?.error || err.message}`,
      );
    }
  };

  return (
    <BasicLayout>
      <h1>Review: {itemName}</h1>
      <ReviewForm initialItemName={itemName} submitAction={submitReview} />
    </BasicLayout>
  );
}
