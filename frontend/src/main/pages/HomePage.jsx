import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "main/utils/useBackend";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";

import Form from "react-bootstrap/Form";
import { useState } from "react";

export default function HomePage() {
  const { data } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/dining/all`],
    { method: "GET", url: "/api/dining/all" },
    [],
  );

  const date = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(date);

  return (
    <BasicLayout>
      <h1>Dining Commons</h1>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="selectedDate">Date Selector:</Form.Label>
        <Form.Control
          data-testid="HomePage-selectedDate"
          id="selectedDate"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </Form.Group>
      <DiningCommonsTable commons={data} date={selectedDate} />
    </BasicLayout>
  );
}
