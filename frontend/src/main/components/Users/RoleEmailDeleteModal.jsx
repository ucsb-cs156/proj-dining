import { Modal, Button } from "react-bootstrap";
import PropTypes from "prop-types";

export default function RoleEmailDeleteModal({
  show,
  onHide,
  email,
  onConfirm,
}) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      data-testid="RoleEmailDeleteModal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete <strong>{email}</strong>?
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onHide}
          data-testid="RoleEmailDeleteModal-cancel"
        >
          No, take me back
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          data-testid="RoleEmailDeleteModal-confirm"
        >
          Yes, delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

RoleEmailDeleteModal.propTypes = Object.create(null);
RoleEmailDeleteModal.propTypes.show = PropTypes.bool.isRequired;
RoleEmailDeleteModal.propTypes.onHide = PropTypes.func.isRequired;
RoleEmailDeleteModal.propTypes.email = PropTypes.string;
RoleEmailDeleteModal.propTypes.onConfirm = PropTypes.func.isRequired;
