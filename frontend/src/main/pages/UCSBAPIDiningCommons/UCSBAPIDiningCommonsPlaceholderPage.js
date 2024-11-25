import React from "react";
import { useParams } from "react-router-dom";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

function DiningCommonsPlaceholderPage() {
  const { diningCommonsCode } = useParams();

  return (
    <BasicLayout>
      <h1>Placeholder for Dining Commons Page</h1>
      <p>This is the placeholder page for {diningCommonsCode}</p>
    </BasicLayout>
  );
}

export default DiningCommonsPlaceholderPage;
