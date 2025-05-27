// src/components/Alias/AliasTable.js
import React from "react";
import OurTable from "main/components/OurTable";
import { toast } from "react-toastify";
import { useBackendMutation } from "main/utils/useBackend";

export default function AliasTable({ alias }) {
  const testid = "AliasTable";

  const objectToAxiosParamsApprove = (user) => ({
    url: `/api/currentUser/updateAliasModeration`,
    method: "PUT",
    params: { id: user.id, approved: true },
  });
  const approveMutation = useBackendMutation(objectToAxiosParamsApprove, {
    onSuccess: (user) => {
      toast.success(
        `Alias "${user.proposedAlias}" for ID ${user.id} approved!`,
      );
    },
    onError: (err) => {
      toast.error(`Error approving alias: ${err.message}`);
    },
  });

  const objectToAxiosParamsReject = (user) => ({
    url: `/api/currentUser/updateAliasModeration`,
    method: "PUT",
    params: { id: user.id, approved: false },
  });
  const rejectMutation = useBackendMutation(objectToAxiosParamsReject, {
    onSuccess: (user) => {
      toast.success(
        `Alias "${user.proposedAlias}" for ID ${user.id} rejected!`,
      );
    },
    onError: (err) => {
      toast.error(`Error rejecting alias: ${err.message}`);
    },
  });

  const columns = [
    {
      Header: "Proposed Alias",
      accessor: "proposedAlias",
      Cell: ({ value }) => value || "(No proposed alias)",
    },
    {
      Header: "Approve",
      id: "approve",
      Cell: ({ row }) => (
        <button
          className="btn btn-success"
          onClick={() => approveMutation.mutate(row.original)}
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
          className="btn btn-danger"
          onClick={() => rejectMutation.mutate(row.original)}
        >
          Reject
        </button>
      ),
    },
  ];

  if (!alias || alias.length === 0) {
    return (
      <div data-testid="AliasTable-empty">No aliases awaiting approval</div>
    );
  }

  return <OurTable data={alias} columns={columns} testid={testid} />;
}
