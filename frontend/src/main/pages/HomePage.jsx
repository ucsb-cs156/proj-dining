import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "../utils/useBackend";
import DiningCommonsTable from "../components/DiningCommons/DiningCommonsTable";
import { useState } from "react";

export default function HomePage() {
  const { data } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/dining/all`],
    { method: "GET", url: "/api/dining/all" },
    [],
  );

  const todayDate = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayDate);

  return (
    <BasicLayout>
      <h1>Dining Commons</h1>
      
      <div className="mb-3">
        <label htmlFor="date" className="form-label">
          Select date:
        </label>
        <input 
          id = "date"
          type = "date"
          className = "form-control"
          value = {selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
      <DiningCommonsTable commons={data} date={selectedDate} />
    </BasicLayout>
  );
}
