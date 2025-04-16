import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap';

const PreviewImageModal = ({ isOpen, toggle, image }) => {
  const isElectron = () => {
    return window && window.api && typeof window.api.getImages === 'function';
  };

  const handleClose = () => {
    toggle();
  };


  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg" className="modal-dark">
      <ModalHeader toggle={handleClose} className="container-bg text-white">
        {image?.name}
      </ModalHeader>
      <ModalBody className="container-bg text-white">
        {image && (
          <div className="text-center">
            <img 
              src={isElectron() ? image.path : `Image not found`}
              alt={image.name}
              style={{ 
                maxWidth: '100%',
                maxHeight: '60vh'
              }}
            />
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default PreviewImageModal;