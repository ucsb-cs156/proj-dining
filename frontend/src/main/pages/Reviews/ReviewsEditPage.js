import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";

export default function ReviewsCreatePage() {
  const { id } = useParams();
  // Stryker disable all : placeholder for future implementation
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit review with id {id}</h1>
        <p>Coming Soon!</p>
      </div>
    </BasicLayout>
  );
}
