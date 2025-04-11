import React, { useState } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { useDispatch } from 'react-redux'
import { addImage } from '../state/redux/gallery/slice'

// Access electron through window.electron which should be exposed via contextBridge
const electron = window.electron;

const ImageUploader = ({ onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const dispatch = useDispatch()

  const toggle = () => setIsOpen(!isOpen)

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      // Use the exposed electron API to save the file
      const newImage = await electron.uploadImage(file);
      
      dispatch(addImage(newImage))
      
      setIsOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <Button color="primary" onClick={toggle} className="btn-color border-0">
        Upload Image
      </Button>
      
      <Modal isOpen={isOpen} toggle={toggle} className="modal-dark">
        <ModalHeader toggle={toggle} className="container-bg text-white">
          Upload Image
        </ModalHeader>
        <ModalBody className="container-bg text-white">
          <p>Select an image file to upload to your gallery.</p>
          <input 
            type="file"
            accept="image/*" 
            onChange={handleFileSelect}
            disabled={uploading}
            className="form-control input-color text-white"
          />
        </ModalBody>
        <ModalFooter className="container-bg">
          <Button color="secondary" onClick={toggle} disabled={uploading}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default ImageUploader