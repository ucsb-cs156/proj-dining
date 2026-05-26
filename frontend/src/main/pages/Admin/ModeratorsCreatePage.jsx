import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RoleEmailForm from "main/components/Users/RoleEmailForm";
import { useNavigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function ModeratorsCreatePage({ storybook = false }) {
  const navigation = useNavigate();
  const objectToAxiosParams = (moderator) => ({
    url: "/api/admin/moderators/post",
    method: "POST",
    params: {
      email: moderator.email,
    },
  });

  const onSuccess = (moderator) => {
    toast(`New moderator added - email: ${moderator.email}`);
    if (!storybook) navigation("/admin/moderators");
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    ["/api/admin/moderators/get"], // mutation makes this key stale so that pages relying on it reload
  );

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Add New Moderator</h1>
        <RoleEmailForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
