import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "../utils/useBackend";
import DiningCommonsTable from "../components/DiningCommons/DiningCommonsTable";

export default function HomePage() {
  const { data } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/dining/all`],
    { method: "GET", url: "/api/dining/all" },
    [],
  );

  const date = new Date().toISOString().split("T")[0];

  return (
    <BasicLayout>
      <h1>Dining Commons</h1>
      <DiningCommonsTable commons={data} date={date} />
    </BasicLayout>
  );
}
