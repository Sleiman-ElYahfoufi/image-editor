import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from 'reactstrap';

const DeleteImageModal = ({ isOpen, toggle, image }) => {
  const isElectron = () => {
    return window && window.api && typeof window.api.deleteImage === 'function';
  };

  const handleCancel = () => {
    toggle(false);
  };

  const handleDeleteImage = async () => {
    try {
      if (isElectron() && image) {
        const result = await window.api.deleteImage(image.id);
        
        if (result.error) {
          console.log(`Error: ${result.error}`);
          toggle(false); 
        } else {
          console.log('Image deleted successfully');
          toggle(true); 
        }
      } else {
        console.log('Development mode: Cannot delete image', 'warning');
        toggle(true);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      console.log('Failed to delete image');
      toggle(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={handleCancel} size="sm" className="modal-dark">
      <ModalHeader toggle={handleCancel} className="container-bg text-white">
        Confirm Delete
      </ModalHeader>
      <ModalBody className="container-bg text-white">
        <p>Are you sure you want to delete "{image?.name}"?</p>
        <p className="text-danger small">This action cannot be undone.</p>
      </ModalBody>
      <ModalFooter className="container-bg">
        <Button color="danger" onClick={handleDeleteImage}>
          Yes, Delete
        </Button>
        <Button color="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteImageModal;