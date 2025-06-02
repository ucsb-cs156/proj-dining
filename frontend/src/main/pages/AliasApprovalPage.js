import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AliasApprovalTable from "main/components/AliasApprovalTable";
import { useBackend } from "main/utils/useBackend";

export default function AliasApprovalPage() {
  const { data: users } = useBackend(
    ["/api/admin/usersWithProposedAlias"],
    { method: "GET", url: "/api/admin/usersWithProposedAlias" },
    [],
  );

  return (
    <BasicLayout>
      <h1>Alias Approval</h1>
      <AliasApprovalTable users={users} />
    </BasicLayout>
  );
}
