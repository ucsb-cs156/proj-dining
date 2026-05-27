import React, { useState } from "react";
import { Form } from "react-bootstrap";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ItemStatisticsTable from "main/components/Statistics/ItemStatisticsTable";
import { useBackend } from "main/utils/useBackend";
import { PERIOD_OPTIONS } from "main/pages/Statistics/statisticsConstants";

export default function BestItemsPage() {
  const [period, setPeriod] = useState("ALL");

  const { data: items } = useBackend(
    ["/api/statistics/items/best", period],
    {
      method: "GET",
      url: "/api/statistics/items/best",
      params: { period },
    },
    [],
  );

  const onChangePeriod = (e) => {
    setPeriod(e.target.value);
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Best Rated Items</h1>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="BestItemsPage-period-select">
            Time period
          </Form.Label>
          <Form.Select
            id="BestItemsPage-period-select"
            data-testid="BestItemsPage-period-select"
            value={period}
            onChange={onChangePeriod}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                data-testid={`BestItemsPage-period-option-${opt.value}`}
              >
                {opt.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        {items && items.length === 0 ? (
          <p data-testid="BestItemsPage-empty">
            No reviews available for this period yet.
          </p>
        ) : (
          <ItemStatisticsTable
            items={items}
            testIdPrefix="BestItemsPage-table"
          />
        )}
      </div>
    </BasicLayout>
  );
}
