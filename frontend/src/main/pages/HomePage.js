import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "../utils/useBackend";
import DiningCommonsTable from "../components/DiningCommons/DiningCommonsTable";

export default function HomePage() {
  const { data } = useBackend(
    [`/api/dining/all`],
    { method: "GET", url: "/api/dining/all" },
    [],
  );
  return (
    <BasicLayout>
      <h1>Dining Commons</h1>
      <DiningCommonsTable commons={data} />
    </BasicLayout>
  );
}
