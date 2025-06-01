import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

export default function AliasApprovalTable({
  aliases,
  approveCallback,
  rejectCallback,
}) {
  const testid = "Aliasapprovaltable";

  const columns = [
    {
      Header: "Proposed Alias",
      accessor: "proposedAlias",
    },
  ];

  columns.push(ButtonColumn("Approve", "primary", approveCallback, testid));
  columns.push(ButtonColumn("Reject", "danger", rejectCallback, testid));

  return (
    <OurTable
      data={aliases.filter((user) => user.status === "AWAITING_REVIEW")}
      columns={columns}
      testid={testid}
    />
  );
}
