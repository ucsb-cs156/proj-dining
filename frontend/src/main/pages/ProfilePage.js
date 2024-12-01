import { Row, Col, Button, Form } from "react-bootstrap";
import RoleBadge from "main/components/Profile/RoleBadge";
import { useCurrentUser } from "main/utils/currentUser";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useBackendMutation } from "main/utils/useBackend";

const ProfilePage = () => {
  const { data: currentUser } = useCurrentUser();
  const { root } = currentUser || {};
  const { user } = root || {};
  const { email, pictureUrl, fullName, alias: initialAlias, proposedAlias, status } = user || {};

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const objectToAxiosParams = (user) => ({
    url: "/api/currentUser/updateAlias",
    method: "POST",
    params: {
      proposedAlias: user.proposedAlias,
    },
  });
  const onSuccess = (user) => {
    toast(`Alias Awaiting Moderation: ${user.proposedAlias}`);
  };

  const mutation = useBackendMutation(objectToAxiosParams, { onSuccess });
  if (!currentUser?.loggedIn) {
    return <p>Not logged in.</p>;
  }
  const onSubmit = async (data) => {
    mutation.mutate({ proposedAlias: data.alias });
  };

  const { isSuccess } = mutation;
  if (isSuccess) {
    window.location.reload();
  }

  const displayedAlias = initialAlias || "Anonymous User";
  const displayedProposedAlias = proposedAlias || "---";
  const aliasTag =
    status === "Approved"
      ? " New alias now displayed."
      : status === "Rejected"
      ? " Please try a different alias."
      : ""; 
  const displayedStatus = status ? ("(Alias " + status + "." +aliasTag + ")") : "";


  return ( 
    <BasicLayout>
      <Row className="align-items-center profile-header mb-5 text-center text-md-left">
        <Col md={2}>
          <img
            src={pictureUrl}
            alt="Profile"
            className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
          />
        </Col>
        <Col md>
          <h2>{fullName}</h2>
          <h3>{displayedAlias}</h3>
          <h7>Proposed Alias: {displayedProposedAlias} {displayedStatus}</h7>
          <p className="lead text-muted">{email}</p>
          <RoleBadge role={"ROLE_USER"} currentUser={currentUser} />
          <RoleBadge role={"ROLE_MEMBER"} currentUser={currentUser} />
          <RoleBadge role={"ROLE_ADMIN"} currentUser={currentUser} />
        </Col>
      </Row>
      <Row className="text-left">
        <Col md={12}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group controlId="formAlias">
              <Form.Label>Alias</Form.Label>
              <Form.Control
                type="text"
                {...register("alias", {
                  required: "Alias is required.",
                })}
                isInvalid={Boolean(errors.alias)}
                placeholder="Enter your new alias"
              />
              <Form.Control.Feedback type="invalid">
                {errors.alias?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={mutation.isLoading}
            >
              {"Update Alias"}
            </Button>
          </Form>
        </Col>
      </Row>
    </BasicLayout>
  );
};
export default ProfilePage;
