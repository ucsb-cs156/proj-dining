import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import ReviewForm from "main/components/MyReviews/ReviewForm";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

export default function EditReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: review } = useBackend(
    // Stryker disable next-line ArrayDeclaration,StringLiteral
    [`/api/reviews/${id}`],
    // Stryker disable next-line StringLiteral
    { method: "GET", url: `/api/reviews/${id}` },
  );

  const mutation = useBackendMutation(
    (updatedReview) => ({
      method: "PUT",
      url: `/api/reviews/reviewer`,
      params: { id },
      data: {
        reviewerComments: updatedReview.reviewerComments,
        itemStars: updatedReview.itemsStars, 
        dateItemServed: updatedReview.dateItemServed,
      },
    }),
    {
      onSuccess: () => {
        toast("Review updated!");
        navigate("/myreviews");
      },
    },
    // Stryker disable next-line ArrayDeclaration,StringLiteral
    [`/api/reviews/${id}`]
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Review</h1>
        {review && (
          <ReviewForm
            initialContents={{
            ...review,
            itemStars: review.itemsStars, 
            itemName: review.item?.name,    
          }}
          initialItemName={review.item?.name}
          submitAction={(data) => mutation.mutate(data)}
          buttonLabel="Update Review"
          />
        )}
      </div>
    </BasicLayout>
  );
}