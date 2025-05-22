import React from "react";
import OurTable from "main/components/OurTable";

export default function AliasApprovalTable({ commons, onApprove, onReject }) {
  const testid = "AliasApprovalTable";
  const columns = [
    {
      Header: "Alias",
      accessor: "alias",
    },
    {
      Header: "Proposed Alias",
      accessor: "proposedAlias",
    },
    {
      Header: "Status",
      accessor: "status",
    },
    {
      Header: "Approve",
      id: "approve",
      Cell: ({ row }) => (
        <button
          data-testid={`approve-button-${row.original.id}`}
          onClick={() => onApprove(row.original)}
          disabled={row.original.status !== "AWAITING_REVIEW"}
          className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          Approve
        </button>
      ),
    },
    {
      Header: "Reject",
      id: "reject",
      Cell: ({ row }) => (
        <button
          data-testid={`reject-button-${row.original.id}`}
          onClick={() => onReject(row.original)}
          disabled={row.original.status !== "AWAITING_REVIEW"}
          className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          Reject
        </button>
      ),
    },
  ];

  return (
    <OurTable testid="AliasApprovalTable" columns={columns} data={commons} />
  );
}
