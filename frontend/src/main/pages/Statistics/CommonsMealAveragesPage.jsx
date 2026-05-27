import React, { useState } from "react";
import { Form } from "react-bootstrap";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CommonsMealAveragesSection from "main/components/Statistics/CommonsMealAveragesSection";
import { useBackend } from "main/utils/useBackend";

export default function CommonsMealAveragesPage() {
  const { data: commons } = useBackend(
    ["/api/dining/all"],
    { method: "GET", url: "/api/dining/all" },
    [],
  );

  const [selectedCode, setSelectedCode] = useState("");

  const effectiveCode = selectedCode || commons[0]?.code;

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Meal Averages by Dining Commons</h1>
        {commons.length > 0 && (
          <Form.Group className="mb-3">
            <Form.Label htmlFor="CommonsMealAveragesPage-commons-select">
              Dining Commons
            </Form.Label>
            <Form.Select
              id="CommonsMealAveragesPage-commons-select"
              data-testid="CommonsMealAveragesPage-commons-select"
              value={effectiveCode}
              onChange={(e) => setSelectedCode(e.target.value)}
            >
              {commons.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}
        {effectiveCode && <CommonsMealAveragesSection code={effectiveCode} />}
      </div>
    </BasicLayout>
  );
}
