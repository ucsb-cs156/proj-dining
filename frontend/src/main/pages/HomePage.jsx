import { useState } from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useQueries } from "react-query";
import axios from "axios";
import { useBackend } from "main/utils/useBackend";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";

export default function HomePage() {
  const { data } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/dining/all`],
    { method: "GET", url: "/api/dining/all" },
    [],
  );

  const date = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(date);

  const onChangeDate = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
  };
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
      <p>
        <label htmlFor="dateSelector">Select Date:</label>
        <br></br>
        <input
          type="date"
          id="dateSelector"
          name="dateSelector"
          value={selectedDate}
          onChange={onChangeDate}
        />
      </p>
      <DiningCommonsTable commons={combined} date={selectedDate} />
    </BasicLayout>
  );
}
