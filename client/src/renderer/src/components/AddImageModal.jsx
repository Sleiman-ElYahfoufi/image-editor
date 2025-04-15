import React, { useState } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button
} from 'reactstrap';
import '../styles/AddImageModal.css';

const AddImageModal = ({ isOpen, toggle }) => {
  const isElectron = () => {
    return window && window.api && typeof window.api.getImages === 'function'
  }

  const handleCancel = () => {
    toggle(false);
  };

  const handleAddImage = async () => {
    try {
      if (isElectron()) {
        const dialogResult = await window.api.openFileDialog()
        
        if (dialogResult.canceled || dialogResult.error) {
          return;
        }
        
        const newImage = await window.api.uploadImage(dialogResult.filePath)
        
        if (newImage.error) {
          console.log(`Error: ${newImage.error}`);
          toggle(false); 
        } else {
          console.log('Image uploaded successfully');
          toggle(true);
        }
      } else {
        console.log('Development mode: Cannot add images', 'warning');
        toggle(false);
      }
    } catch (error) {
      console.error('Error adding image:', error);
      console.log('Failed to add image');
      toggle(false);
    }
  }

  return (
    <Modal isOpen={isOpen} toggle={handleCancel} className="modal-dark add-image-modal">
      <ModalHeader toggle={handleCancel} className="container-bg text-white border-0">
        Add New Image
      </ModalHeader>
      <ModalBody className="container-bg text-white text-center">
        <div 
          className="upload-area"
          onClick={handleAddImage}
        >
          <div className="plus-icon">+</div>
          <p>Add your image here</p>
        </div>
      </ModalBody>
      <ModalFooter className="container-bg border-0">
        <Button color="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddImageModal;