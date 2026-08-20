import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { toast } from "react-toastify";
import ReviewForm from "main/components/MyReviews/ReviewForm";
import { useBackend } from "main/utils/useBackend";

export default function EditReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: review } = useBackend(
    [`/api/reviews/${id}`],
    // Stryker disable next-line all
    {
      // Stryker disable next-line all : the default method is get, so replacing with an empty string will do nothing
      method: "GET",
      // Stryker disable next-line all : id will be defined by the route
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
          params: {
            id,
          },
        },
      );
      toast(`Review ${id} updated`);
      navigate(-1);
    } catch (err) {
      let errorMessage = err.message;
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      }
      toast.error(`Error updating review: ${errorMessage}`);
    }
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Review</h1>
        {!review || !review.item ? (
          <p>Loading review...</p>
        ) : (
          <ReviewForm
            initialItemName={review.item.name}
            initialComments={review.reviewerComments}
            initialStars={review.itemsStars}
            initialDateServed={review.dateItemServed}
            submitAction={submitReview}
            submitButtonText="Update Review"
          />
        )}
      </div>
    </BasicLayout>
  );
}
