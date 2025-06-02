import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

export default function AliasTable({ aliases, onApprove, onReject }) {
  const testid = "AliasTable";

  const columns = [
    {
      Header: "Proposed Alias",
      accessor: "proposedAlias",
      Cell: ({ value }) => value || "(No proposed alias)",
    },
    ButtonColumn(
      "Approve",
      "primary",
      (cell) => onApprove(cell.row.original),
      testid,
    ),
    ButtonColumn(
      "Reject",
      "danger",
      (cell) => onReject(cell.row.original),
      testid,
    ),
  ];

  if (!aliases || aliases.length === 0) {
    return (
      <div data-testid={`${testid}-empty`}>No aliases awaiting approval</div>
    );
  }

  return <OurTable data={aliases} columns={columns} testid={testid} />;
}
