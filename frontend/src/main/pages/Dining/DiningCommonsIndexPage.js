import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";

export default function DiningCommonsIndexPage() {
  // Stryker disable all : placeholder for future implementation
  let { diningCommonsCode } = useParams();

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Placeholder for Dining Commons Page for {diningCommonsCode}</h1>
        <p>This is a placeholder page that will be updated later.</p>
      </div>
    </BasicLayout>
  );
}
