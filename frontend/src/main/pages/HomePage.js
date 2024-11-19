import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";
import { useBackend } from "main/utils/useBackend";

export default function HomePage() {

  const {
    data: fetchedDiningData,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/diningcommons/all"],
    {
      // Stryker disable next-line StringLiteral : GET is default, so replacing with "" is an equivalent mutation
      method: "GET",
      url: "/api/diningcommons/all",
    },
    [],
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Dining Commons</h1>
        <DiningCommonsTable diningCommonsData={fetchedDiningData}></DiningCommonsTable>
      </div>
    </BasicLayout>
  );
}
