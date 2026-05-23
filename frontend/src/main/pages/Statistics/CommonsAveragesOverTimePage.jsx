import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CommonsAveragesOverTimeTable from "main/components/Statistics/CommonsAveragesOverTimeTable";
import { useBackend } from "main/utils/useBackend";

export default function CommonsAveragesOverTimePage() {
  const { data: rows } = useBackend(
    ["/api/statistics/commons/averages/overtime"],
    {
      method: "GET",
      url: "/api/statistics/commons/averages/overtime",
    },
    [],
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Dining Commons Averages Over Time</h1>
        <p>
          Average rating per dining commons grouped by the month the meal was
          served. This is the data behind the &quot;averages over time&quot;
          graph.
        </p>
        {rows && rows.length === 0 ? (
          <p data-testid="CommonsAveragesOverTimePage-empty">
            No reviews available yet.
          </p>
        ) : (
          <CommonsAveragesOverTimeTable
            rows={rows}
            testIdPrefix="CommonsAveragesOverTimePage-table"
          />
        )}
      </div>
    </BasicLayout>
  );
}
