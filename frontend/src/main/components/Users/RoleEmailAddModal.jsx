import { useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";

// Stryker disable next-line Regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RoleEmailAddModal({
  show,
  onHide,
  onSubmitEmail,
  title = "Add Email",
  buttonLabel = "Add",
  serverError = null,
}) {
  const testIdPrefix = "RoleEmailAddModal";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Clear the form each time the modal opens or closes, so a previous
  // submission's value/errors don't linger.
  useEffect(() => {
    reset();
  }, [show, reset]);

  const onSubmit = (data) => {
    onSubmitEmail(data.email);
  };

  return (
    <Modal show={show} onHide={onHide} centered data-testid={testIdPrefix}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="email">Email</Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-email"}
              id="email"
              type="text"
              isInvalid={Boolean(errors.email) || Boolean(serverError)}
              {...register("email", {
                required: "Email is required.",
                pattern: emailRegex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email && "A valid email is required."}
            </Form.Control.Feedback>
          </Form.Group>
          {serverError && (
            <div className="text-danger" data-testid={testIdPrefix + "-error"}>
              {serverError}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={onHide}
            data-testid={testIdPrefix + "-cancel"}
          >
            Cancel
          </Button>
          <Button type="submit" data-testid={testIdPrefix + "-submit"}>
            {buttonLabel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

RoleEmailAddModal.propTypes = Object.create(null);
RoleEmailAddModal.propTypes.show = PropTypes.bool.isRequired;
RoleEmailAddModal.propTypes.onHide = PropTypes.func.isRequired;
RoleEmailAddModal.propTypes.onSubmitEmail = PropTypes.func.isRequired;
RoleEmailAddModal.propTypes.title = PropTypes.string;
RoleEmailAddModal.propTypes.buttonLabel = PropTypes.string;
RoleEmailAddModal.propTypes.serverError = PropTypes.string;
