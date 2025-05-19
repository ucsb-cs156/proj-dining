import React from "react";
import OurTable from "main/components/OurTable";
import { toast } from "react-toastify";
import { useBackendMutation } from "main/utils/useBackend";
import { useQueryClient } from "react-query";


export default function AliasTable({ alias }) {
  const testid = "AliasTable";
  const queryClient = useQueryClient();

  const objectToAxiosParamsApprove = (user) => ({
    url: `/api/currentUser/updateAliasModeration`,
    method: "PUT",
    params: { id: user.id, approved: true },
  });

  const approveMutation = useBackendMutation(objectToAxiosParamsApprove, {
    onSuccess: (user) => {
      toast(`Alias for id ${user.id} approved!`);
      queryClient.invalidateQueries(["/api/admin/usersWithProposedAlias"]);
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
      toast(`Alias for id ${user.id} rejected!`);
      queryClient.invalidateQueries(["/api/admin/usersWithProposedAlias"]);
    },
    onError: (err) => {
      toast.error(`Error rejecting alias: ${err.message}`);
    },
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
                onClick={() => {
                    const user = cell.row.original;
                    approveMutation.mutate(user)
                }
                // disabled={approveMutation.isLoading}
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
                    rejectMutation.mutate(user)
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
