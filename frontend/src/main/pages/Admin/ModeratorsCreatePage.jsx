import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RoleEmailForm from "main/components/Users/RoleEmailForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function ModeratorsCreatePage({ storybook = false }) {
  const objectToAxiosParams = (moderator) => ({
    url: "/api/admin/moderators/post",
    method: "POST",
    params: {
      email: moderator.email,
    },
  });

  const onSuccess = (moderator) => {
    toast(`New moderator added - email: ${moderator.email}`);
  };

  const mutation = useBackendMutation(objectToAxiosParams, { onSuccess }, [
    "/api/admin/moderators/get",
  ]);

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Add New Moderator</h1>
        <RoleEmailForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
