import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "../utils/useBackend";
import { useQueries } from "react-query";
import axios from "axios";
import DiningCommonsTable from "../components/DiningCommons/DiningCommonsTable";

export default function HomePage() {
  const { data } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/dining/all`],
    { method: "GET", url: "/api/dining/all" },
    [],
  );

  const date = new Date().toISOString().split("T")[0];

  const queries = [];
  if (Array.isArray(data)) {
    for (const d of data) {
      queries.push({
        queryKey: ["meals", d.code, date],
        queryFn: () =>
          axios
            .get(`/api/diningcommons/${date}/${d.code}`)
            .then((res) => res.data),
      });
    }
  }
  const mealsOffered = useQueries(queries);

  const combined = Array.isArray(data)
    ? data.map((d, i) => ({
        ...d,
        mealsOfferedToday: mealsOffered[i]?.data ?? [],
      }))
    : [];

  return (
    <BasicLayout>
      <h1>Dining Commons</h1>
      <DiningCommonsTable commons={combined} date={date} />
    </BasicLayout>
  );
}
