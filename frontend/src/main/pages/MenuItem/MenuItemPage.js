import { useCurrentUser } from "main/utils/currentUser";
import { useBackend } from "main/utils/useBackend";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import MenuItemTable from "main/components/MenuItem/MenuItemTable";
import { useParams } from "react-router-dom";

export default function MenuItemPage() {
  const currentUser = useCurrentUser();
  const {
    "date-time": date,
    "dining-commons-code": diningCommons,
    meal,
  } = useParams();
  const { data: menuItems } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/diningcommons/${date}/${diningCommons}/${meal}`],
    {
      // Stryker disable next-line all : the default method is get, so replacing with an empty string will do nothing
      method: "GET",
      url: `/api/diningcommons/${date}/${diningCommons}/${meal}`,
    },
    // Stryker disable next-line all : Don't test empty initial data
    [],
  );

  const { data: aliases = [] } = useBackend(
    ["/api/admin/usersWithProposedAlias"],
    { method: "GET", url: "/api/admin/usersWithProposedAlias" },
    [],
  );

  // approve/reject mutations
  const approveMutation = useBackendMutation(
    (alias) => ({
      url: "/api/currentUser/updateAliasModeration",
      method: "PUT",
      params: { id: alias.id, approved: true },
    }),
    {
      onSuccess: () => {
        /* optionally refetch */
      },
    },
  );
  const rejectMutation = useBackendMutation(
    (alias) => ({
      url: "/api/currentUser/updateAliasModeration",
      method: "PUT",
      params: { id: alias.id, approved: false },
    }),
    {
      onSuccess: () => {
        /* optionally refetch */
      },
    },
  );

  return (
    <BasicLayout>
      <h2>{meal.at(0).toUpperCase() + meal.substring(1)}</h2>
      <MenuItemTable currentUser={currentUser} menuItems={menuItems} />
      <h3 className="mt-4">Aliases Pending Approval</h3>
      <AliasApprovalTable
        commons={aliases}
        onApprove={approveMutation.mutate}
        onReject={rejectMutation.mutate}
      />
    </BasicLayout>
  );
}
