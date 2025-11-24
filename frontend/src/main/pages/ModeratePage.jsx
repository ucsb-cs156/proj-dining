import React from "react";
import { useBackend } from "main/utils/useBackend";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewsTable from "main/components/Reviews/ReviewsTable";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";
import axios from "axios";
import { toast } from "react-toastify";

const Moderate = () => {
  const currentUser = useCurrentUser();

  const {
    data: reviews,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/reviews/needsmoderation"],
    // Stryker disable next-line all : don't test internal caching of React Query
    { method: "GET", url: "/api/reviews/needsmoderation" },
    // Stryker disable next-line all : don't test internal caching of React Query
    [],
  );

  //
  // Fetch aliases awaiting approval
  //
  const { data: aliases } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/admin/users/needsmoderation"],
    // Stryker disable next-line all : don't test internal caching of React Query
    { method: "GET", url: "/api/admin/users/needsmoderation" },
    // Stryker disable next-line all : don't test internal caching of React Query
    [],
  );

  const moderatorOptions =
    hasRole(currentUser, "ROLE_ADMIN") ||
    hasRole(currentUser, "ROLE_MODERATOR");

  // const approveCallback = async (alias) => {
  //   const user = alias.row.original;
  //   console.log(user);
  //   await fetch(
  //     `/api/admin/users/updateAliasModeration?id=${user.id}&approved=true`,
  //     {
  //       method: "PUT",
  //     }
  //   );
  // };

  // const rejectCallback = async (alias) => {
  //   const user = alias.row.original;
  //   await fetch(
  //     `/api/admin/users/updateAliasModeration?id=${user.id}&approved=false`,
  //     {
  //       method: "PUT",
  //     }
  //   );
  // };
  // Get doBackend for authenticated requests
  const approveCallback = async (alias) => {
    const user = alias.row.original;

    try {
      await axios.put("/api/currentUser/updateAliasModeration", null, {
        params: {
          id: user.id,
          approved: true,
        },
      });

      toast(`Approved alias for ${user.email}`);
    } catch (err) {
      toast.error(
        `Error approving alias: ${err.response?.data?.error || err.message}`,
      );
    }
  };

  const rejectCallback = async (alias) => {
    const user = alias.row.original;

    try {
      await axios.put("/api/currentUser/updateAliasModeration", null, {
        params: {
          id: user.id,
          approved: false,
        },
      });

      toast(`Rejected alias for ${user.email}`);
    } catch (err) {
      toast.error(
        `Error rejecting alias: ${err.response?.data?.error || err.message}`,
      );
    }
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Moderation Page</h1>
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
