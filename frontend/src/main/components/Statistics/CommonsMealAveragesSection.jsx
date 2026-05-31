import React from "react";
import CommonsMealAveragesTable from "main/components/Statistics/CommonsMealAveragesTable";
import { useBackend } from "main/utils/useBackend";

export default function CommonsMealAveragesSection({ code }) {
  const { data: averages } = useBackend(
    [`/api/statistics/commons/${code}/meals/averages`],
    {
      method: "GET",
      url: `/api/statistics/commons/${code}/meals/averages`,
    },
    [],
  );

  if (averages && averages.length === 0) {
    return (
      <p data-testid="CommonsMealAveragesSection-empty">
        No reviews available yet.
      </p>
    );
  }

  return (
    <CommonsMealAveragesTable
      averages={averages}
      testIdPrefix="CommonsMealAveragesSection-table"
    />
  );
}
