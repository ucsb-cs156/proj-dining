import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";

export default function ReviewsCreatePage() {
  const { id } = useParams();
  // Stryker disable all : placeholder for future implementation
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Post a review for Menu Item {id}</h1>
        <p>Coming Soon!</p>
      </div>
    </BasicLayout>
  );
}
