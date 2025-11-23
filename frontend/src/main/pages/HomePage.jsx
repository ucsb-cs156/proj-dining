import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "main/utils/useBackend";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";

export default function HomePage() {
  const { data } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/dining/all`],
    { method: "GET", url: "/api/dining/all" },
    [],
  );

  // Stryker disable ObjectLiteral : We are testing in CA so our timezone defaults to "America/Los_Angeles," but users may be elsewhere
  const date = new Date()
    .toLocaleString("fr-CA", { timeZone: "America/Los_Angeles" })
    .split(" ")[0];
  // Stryker enable ObjectLiteral

  return (
    <BasicLayout>
      <h1>Dining Commons</h1>
      <DiningCommonsTable commons={data} date={date} />
    </BasicLayout>
  );
}
