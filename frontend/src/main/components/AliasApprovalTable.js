import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";
import { useQueryClient } from "react-query";

export default function AliasApprovalTable({ users }) {
  const testid = "AliasApprovalTable";
  const queryClient = useQueryClient();

  const objectToAxiosParams = (variables) => {
    if (
      !variables ||
      typeof variables.id === "undefined" ||
      typeof variables.approved === "undefined"
    ) {
      console.error("Missing id or approved in mutation variables:", variables);
      return {};
    }
    return {
      url: "/api/currentUser/updateAliasModeration",
      method: "PUT",
      params: {
        id: variables.id,
        approved: variables.approved,
      },
    };
  };

  const onSuccess = (returnedUser, variables) => {
    toast(
      `${variables.approved ? "Approved" : "Rejected"} alias: ${returnedUser.alias}`,
    );
    queryClient.invalidateQueries("alias-approval");
  };

  const mutation = useBackendMutation(objectToAxiosParams, { onSuccess }, [
    "alias-approval",
  ]);

  const columns = [
    { Header: "Alias", accessor: "alias" },
    { Header: "Proposed Alias", accessor: "proposedAlias" },
    ButtonColumn("Approve", "success", (cell) => {
      const user = cell.row.original;
      mutation.mutate({ id: user.id, approved: true });
    }),
    ButtonColumn("Reject", "danger", (cell) => {
      const user = cell.row.original;
      mutation.mutate({ id: user.id, approved: false });
    }),
  ];

  return <OurTable data={users} columns={columns} testid={testid} />;
}
