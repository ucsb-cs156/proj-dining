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
    onSuccess: (user, propAlias) => {
      toast(`Alias ${propAlias.proposedAlias} for id ${user.id} approved!`);
    },
    onError: (err) => {
      toast.error(`Error approving alias: ${err.message}`);
    },
  });

  // --- reject mutation + toast ---
  const objectToAxiosParamsReject = (user) => ({
    url: `/api/currentUser/updateAliasModeration`,
    method: "PUT",
    params: { id: user.id, approved: false },
  });
  const rejectMutation = useBackendMutation(objectToAxiosParamsReject, {
    onSuccess: (user, propAlias) => {
      toast(`Alias ${propAlias.proposedAlias} for id ${user.id} rejected!`);
    },
    onError: (err) => {
      toast.error(`Error rejecting alias: ${err.message}`);
    },
  });

  // --- table columns line up exactly with your tests :contentReference[oaicite:0]{index=0} ---
  const columns = [
    { Header: "Proposed Alias", accessor: "proposedAlias" },
    {
      Header: "Approve",
      id: "approve",
      Cell: ({ cell }) => (
        <button
          className="btn btn-success"
          onClick={() => {
            const user = cell.row.original;
            approveMutation.mutate(user, user.proposedAlias);
          }}
        >
          Approve
        </button>
      ),
    },
    {
      Header: "Reject",
      id: "reject",
      Cell: ({ cell }) => (
        <button
          className="btn btn-danger"
          onClick={() => {
            const user = cell.row.original;
            rejectMutation.mutate(user, user.proposedAlias);
          }}
        >
          Reject
        </button>
      ),
    },
  ];

  const displayedColumns = columns;

  return <OurTable data={alias} columns={displayedColumns} testid={testid} />;
}
