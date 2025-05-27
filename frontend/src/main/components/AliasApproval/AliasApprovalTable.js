import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
// import { useBackend, useBackendMutation } from "main/utils/useBackend";
// import { Button } from "react-bootstrap";

export default function AliasApprovalTable({
  aliases,
  approveCallback,
  rejectCallback,
}) {
  // const {
  //   data: users = [],
  //   isLoading,
  //   refetch,
  // } = useBackend(
  //   ["/api/admin/usersWithProposedAlias"],
  //   { method: "GET", url: "/api/admin/usersWithProposedAlias" },
  //   [],
  // );

  // mutation for approve/reject
  // const mutation = useBackendMutation(
  //   // transform the row & approved flag into axios params
  //   (rowWithApproved) => ({
  //     method: "PUT",
  //     url: "/api/currentUser/updateAliasModeration",
  //     params: {
  //       id: rowWithApproved.id,
  //       approved: rowWithApproved.approved,
  //     },
  //   }),
  //   {
  //     onSuccess: () => {
  //       // reload the pending list after each decision
  //       refetch();
  //     },
  //   },
  //   ["/api/admin/usersWithProposedAlias"], // invalidate this query on success
  // );

  const columns = [
    {
      Header: "Proposed Alias",
      accessor: "proposedAlias",
    },
    // {
    //   Header: "Approve",
    //   id: "approve",
    //   accessor: (row) => (
    //     <Button
    //       size="sm"
    //       onClick={() => mutation.mutate({ ...row, approved: true })}
    //     >
    //       Approve
    //     </Button>
    //   ),
    // },
    // {
    //   Header: "Reject",
    //   id: "reject",
    //   accessor: (row) => (
    //     <Button
    //       size="sm"
    //       variant="danger"
    //       onClick={() => mutation.mutate({ ...row, approved: false })}
    //     >
    //       Reject
    //     </Button>
    //   ),
    // },
  ];

  const testid = "Aliasapprovaltable";

  // if (moderatorOptions) {
  columns.push(ButtonColumn("Approve", "primary", approveCallback, testid));
  columns.push(ButtonColumn("Reject", "danger", rejectCallback, testid));
  // }

  return <OurTable data={aliases} columns={columns} testid={testid} />;
}
