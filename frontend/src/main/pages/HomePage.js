import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import DiningCommonsTable from "main/components/UCSBAPIDiningCommons/UCSBAPIDiningCommonsTable";
import { useBackend } from "main/utils/useBackend";

export default function HomePage() {
  // Fetch dining commons data from the backend
  const { data: diningCommons, error } = useBackend(
    ["/api/diningcommons/all"],
    { method: "GET", url: "/api/diningcommons/all" },
    [],
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Dining Commons</h1>
        <p>Here is the list of all UCSB Dining Commons:</p>
        (
        <DiningCommonsTable diningCommons={diningCommons} />)
      </div>
    </BasicLayout>
  );
}
