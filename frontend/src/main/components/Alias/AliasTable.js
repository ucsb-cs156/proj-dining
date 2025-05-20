import React from "react";
import OurTable from "main/components/OurTable";
import { toast } from "react-toastify";
import { useBackendMutation } from "main/utils/useBackend";
// import { useQueryClient } from "react-query";

export default function AliasTable({ alias }) {
  const testid = "AliasTable";
  //   const queryClient = useQueryClient();

  const objectToAxiosParamsApprove = (user) => ({
    // Stryker disable next-line all
    url: `/api/currentUser/updateAliasModeration`,
    method: "PUT",
    
    /* Stryker disable all */ //not tested because it is mocked
    params: {
      id: user.id,
      approved: true,
    },
    /* Stryker restore all */
  });

  const approveMutation = useBackendMutation(objectToAxiosParamsApprove, {
    onSuccess: (user, propAlias) => {
      toast(`Alias ${propAlias.proposedAlias} for id ${user.id} approved!`);
      //   queryClient.invalidateQueries(["/api/admin/usersWithProposedAlias"]);
    },
    // Stryker disable next-line all
    onError: (err) => {
      // Stryker disable next-line all
      toast.error(`Error approving alias: ${err.message}`);
    },
  });

  const objectToAxiosParamsReject = (user) => ({
    // Stryker disable next-line all
    url: `/api/currentUser/updateAliasModeration`,
    method: "PUT",

    /* Stryker disable all */ //not tested because it is mocked
    params: {
      id: user.id,
      approved: false,
    },
    /* Stryker restore all */
  });

  const rejectMutation = useBackendMutation(objectToAxiosParamsReject, {
    onSuccess: (user, propAlias) => {
      toast(`Alias ${propAlias.proposedAlias} for id ${user.id} rejected!`);
      //   queryClient.invalidateQueries(["/api/admin/usersWithProposedAlias"]); //refresh the table
    },

    /* Stryker disable all */
    onError: (err) => {
      toast.error(`Error rejecting alias: ${err.message}`);
    },
    /* Stryker restore all */
  });

  const columns = [
    {
      Header: "Proposed Alias",
      accessor: "proposedAlias", // accessor is the "key" in the data
    },
    {
      Header: "Approve",
      accessor: "approve",
      // green button to approve the alias
      Cell: (cell) => (
        <button
          className="btn btn-success"
          onClick={
            () => {
              const user = cell.row.original;
              approveMutation.mutate(user, user.proposedAlias);
            }
          }
        >
          Approve
        </button>
      ),
    },
    {
      Header: "Reject",
      accessor: "reject",
      Cell: (cell) => (
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
