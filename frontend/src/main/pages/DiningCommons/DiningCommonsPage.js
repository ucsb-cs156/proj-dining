import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";

export default function ReviewsLookupPage() {
  let { diningCommonsCode } = useParams();

  // Stryker disable all : placeholder for future implementation
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Placeholder for Dining Commons Page for {diningCommonsCode}</h1>
      </div>
    </BasicLayout>
  );
}
