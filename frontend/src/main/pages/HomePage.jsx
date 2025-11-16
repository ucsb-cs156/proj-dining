import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "main/utils/useBackend";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";
import { useState } from "react";

export default function HomePage() {
  const { data } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/dining/all"],
    { method: "GET", url: "/api/dining/all" },
    [],
  );

  // Default to today's date
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  return (
    <BasicLayout>
      <h1>Dining Commons</h1>

      {/* Date Selector */}
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="datePicker" style={{ marginRight: "0.5rem" }}>
          Select Date:
        </label>
        <input
          id="datePicker"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Dining Commons table with selected date */}
      <DiningCommonsTable commons={data} date={date} />
    </BasicLayout>
  );
}
