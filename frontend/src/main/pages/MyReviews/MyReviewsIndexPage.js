import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "main/utils/useBackend";
import ReviewTable from "main/components/Reviews/ReviewTable";

export default function MyReviewsIndexPage() {
  const { data, isLoading, error } = useBackend(
    // Stryker disable next-line all: don't test internal caching of React Query
    ["/api/reviews/userReviews"],
    // Stryker disable next-line all: default method is get, so replacing with an empty string will do nothing
    { method: "GET", url: `/api/reviews/userReviews` },
  );

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
      <ReviewTable data={data} userOptions={true} moderatorOptions={false} />
    </BasicLayout>
  );
}
