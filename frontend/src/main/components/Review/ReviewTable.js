import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { hasRole } from "main/utils/currentUser";

export default function ReviewTable({
  reviews,
  currentUser,
  userOptions = false,
  moderatorOptions = false,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}) {
  const testid = "ReviewTable";

  const columns = [
    {
      Header: "Score",
      accessor: "score",
    },
    {
      Header: "Comments",
      accessor: "comments",
    },
    {
      Header: "Date Served",
      accessor: "dateServed",
    },
  ];

  if (userOptions) {
    columns.push({
      Header: "Item Name",
      accessor: "itemName",
    });
    columns.push(ButtonColumn("Edit", "primary", onEdit, testid));
    columns.push(ButtonColumn("Delete", "danger", onDelete, testid));
  }

  if (moderatorOptions) {
    columns.push(ButtonColumn("Approve", "success", onApprove, testid));
    columns.push(ButtonColumn("Reject", "danger", onReject, testid));
  }

  return <OurTable columns={columns} data={reviews} testid={testid} />;
}
