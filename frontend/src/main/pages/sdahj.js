import { Row, Col, Button, Form } from "react-bootstrap";
import RoleBadge from "main/components/Profile/RoleBadge";
import { useCurrentUser } from "main/utils/currentUser";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const { data: currentUser } = useCurrentUser();
  const [alias, setAlias] = useState(currentUser?.root?.user?.alias || ""); // Track alias in state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(null); // Track success or failure of the update

  // If the user is not logged in, show a message
  if (!currentUser.loggedIn) {
    return <p>Not logged in.</p>;
  }

  const { email, pictureUrl, fullName } = currentUser.root.user;

  // Handle changes to the alias input field
  const handleAliasChange = (event) => {
    setAlias(event.target.value); // Only update state here
  };

  // Handle alias submission when the user clicks the "Update Alias" button
  const handleAliasSubmit = async (event) => {
    event.preventDefault(); // Prevent form submission (page reload)
    setIsSubmitting(true);  // Set submitting to true while waiting for the response

    try {
      // Pass the alias as a query parameter
      const response = await axios.post(`/api/currentUser/updateAlias?alias=${alias}`);

      // If alias update is successful, update the success message and reset state
      if (response.status === 200) {
        setUpdateSuccess(true);
        toast(`Alias Updated - Alias: ${alias}`); // Show success toast
        setIsSubmitting(false);
      }
    } catch (error) {
      // Handle error and show an error message
      setUpdateSuccess(false);
      setIsSubmitting(false);
      console.error("Error updating alias:", error);
    }
  };

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
          <p className="lead text-muted">{email}</p>
          <RoleBadge role={"ROLE_USER"} currentUser={currentUser} />
          <RoleBadge role={"ROLE_MEMBER"} currentUser={currentUser} />
          <RoleBadge role={"ROLE_ADMIN"} currentUser={currentUser} />
        </Col>
      </Row>

      <Row className="text-left">
        <Col md={12}>
          <h3>Update Alias</h3>
          <Form onSubmit={handleAliasSubmit}> {/* Only trigger API on form submit */}
            <Form.Group controlId="formAlias">
              <Form.Label>Alias</Form.Label>
              <Form.Control
                type="text"
                value={alias}
                onChange={handleAliasChange} // Update state on change
                disabled={isSubmitting} // Disable input while submitting
              />
            </Form.Group>
            <Button 
              type="submit" 
              disabled={isSubmitting || !alias} // Disable button if submitting or alias is empty
            >
              {isSubmitting ? "Updating..." : "Update Alias"}
            </Button>
          </Form>

          {updateSuccess === false && (
            <p className="text-danger mt-3">Error updating alias. Please try again.</p>
          )}
        </Col>
      </Row>
    </BasicLayout>
  );
};

export default ProfilePage;
