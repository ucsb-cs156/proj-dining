import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewForm from "main/components/Review/ReviewForm"; // Adjust path to your ReviewForm
import { Navigate } from "react-router-dom";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function ReviewCreatePage({ storybook = false }) {
  const objectToAxiosParams = (review) => ({
    url: "/api/review/post", // Adjust to match your backend endpoint
    method: "POST",
    params: {
      studentId: review.studentId,
      itemId: review.itemId,
      dateItemServed: review.dateItemServed,
      status: review.status || "Awaiting Moderation",
      userIdModerator: review.userIdModerator || null,
      moderatorComments: review.moderatorComments || null,
      dateCreated: review.dateCreated,
      dateEdited: review.dateEdited,
    },
  });

  const onSuccess = (review) => {
    toast(
      `New review created - Student ID: ${review.studentId}, Item ID: ${review.itemId}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all: hard to set up test for caching
    ["/api/review/all"]
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/review" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New Review</h1>
        <ReviewForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
