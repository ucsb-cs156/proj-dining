import React from "react";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewsTable from "main/components/Reviews/ReviewsTable";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";
import { useQueryClient } from "react-query";

const Moderate = () => {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();

  //
  // Reviews needing moderation
  //
  const { data: reviews } = useBackend(
    ["/api/reviews/needsmoderation"],
    { method: "GET", url: "/api/reviews/needsmoderation" },
    [],
  );

  //
  // Aliases needing moderation
  //
  const { data: aliases } = useBackend(
    ["/api/admin/users/needsmoderation"],
    { method: "GET", url: "/api/admin/users/needsmoderation" },
    [],
  );

  const moderatorOptions =
    hasRole(currentUser, "ROLE_ADMIN") ||
    hasRole(currentUser, "ROLE_MODERATOR");

  //
  // ---- APPROVE MUTATION ----
  //
  const approveMutation = useBackendMutation(
    (user) => ({
      method: "PUT",
      url: "/api/currentUser/updateAliasModeration",
      params: {
        id: user.id,
        approved: true,
        proposedAlias: user.proposedAlias,
      },
    }),
    // On success: invalidate both relevant query keys
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["/api/admin/users/needsmoderation"]);
        queryClient.invalidateQueries(["/api/reviews/needsmoderation"]);
      },
    },
    [],
  );

  //
  // ---- REJECT MUTATION ----
  //
  const rejectMutation = useBackendMutation(
    (user) => ({
      method: "PUT",
      url: "/api/currentUser/updateAliasModeration",
      params: {
        id: user.id,
        approved: false,

        // maintain rejected alias in the user's "Proposed Alias" field
        proposedAlias: user.proposedAlias,
      },
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["/api/admin/users/needsmoderation"]);
        queryClient.invalidateQueries(["/api/reviews/needsmoderation"]);
      },
    },
    [],
  );

  //
  // Callbacks (just trigger the mutations)
  //
  const approveCallback = (alias) => {
    approveMutation.mutate(alias.row.original);
  };

  const rejectCallback = (alias) => {
    rejectMutation.mutate(alias.row.original);
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Moderate Reviews</h1>

        <ReviewsTable reviews={reviews} moderatorOptions={moderatorOptions} />

        <AliasApprovalTable
          aliases={aliases}
          approveCallback={approveCallback}
          rejectCallback={rejectCallback}
        />
      </div>
    </BasicLayout>
  );
};

export default Moderate;
