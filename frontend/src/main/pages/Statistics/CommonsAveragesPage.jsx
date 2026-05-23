import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CommonsAveragesTable from "main/components/Statistics/CommonsAveragesTable";
import { useBackend } from "main/utils/useBackend";

export default function CommonsAveragesPage() {
  const { data: averages } = useBackend(
    ["/api/statistics/commons/averages"],
    {
      method: "GET",
      url: "/api/statistics/commons/averages",
    },
    [],
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Dining Commons Averages</h1>
        {averages && averages.length === 0 ? (
          <p data-testid="CommonsAveragesPage-empty">
            No reviews available yet.
          </p>
        ) : (
          <CommonsAveragesTable
            averages={averages}
            testIdPrefix="CommonsAveragesPage-table"
          />
        )}
      </div>
    </BasicLayout>
  );
}
