import React from "react";
import { useParams } from "react-router";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

export default function ReviewsForMenuItemPage() {
  const { itemid } = useParams();
  return (
    <BasicLayout>
      <h1>Reviews for Menu Item {itemid}</h1>
      <p>Coming Soon!</p>
    </BasicLayout>
  );
}
