import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UsersTable from "main/components/Users/UsersTable";

import { useBackend } from "main/utils/useBackend";
import { useCurrentUser } from "main/utils/currentUser";

const AdminUsersPage = () => {
  const { data: currentUser } = useCurrentUser();

  // Stryker disable all
  const {
    data: users,
    error: _error,
    status: _status,
  } = useBackend(
    ["/api/admin/users"],
    { method: "GET", url: "/api/admin/users" },
    [],
  );

  const { data: defaultAdminEmails } = useBackend(
    ["/api/admin/defaultAdminEmails"],
    { method: "GET", url: "/api/admin/defaultAdminEmails" },
    [],
  );
  // Stryker restore all

  return (
    <BasicLayout>
      <h2>Users</h2>
      <UsersTable
        users={users}
        showToggleRoleButtons={true}
        currentUser={currentUser}
        defaultAdminEmails={defaultAdminEmails}
      />
    </BasicLayout>
  );
};

export default AdminUsersPage;
