import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert
} from 'reactstrap'
import { setLoading, setImages, setSelectedImage, removeImage } from '../../state/redux/gallery/slice'

const Gallery = () => {
  const dispatch = useDispatch()
  const { images, loading, selectedImage } = useSelector((state) => state.gallery)
  const [modalOpen, setModalOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertColor, setAlertColor] = useState('danger')

  useEffect(() => {
    loadImages()
  }, [])

  const showTimedAlert = (message, color = 'danger') => {
    setAlertMessage(message)
    setAlertColor(color)
    setShowAlert(true)

    setTimeout(() => {
      setShowAlert(false)
    }, 2000)
  }

  // Check if we're running in Electron
  const isElectron = () => {
    return window && window.api && typeof window.api.getImages === 'function'
  }

  const loadImages = async () => {
    dispatch(setLoading(true))
    try {
      if (isElectron()) {
        // Running in Electron, use the API
        const loadedImages = await window.api.getImages()
        dispatch(setImages(loadedImages))
        showTimedAlert('Images loaded successfully', 'success')
        console.log('images', images)

      } else {
        // Not running in Electron or API not available
        console.log('images', images)
        showTimedAlert('Development mode: No images available', 'warning')
      }
    } catch (error) {
      console.error('Error loading images:', error)
      showTimedAlert('Failed to load images')
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleImageClick = (image) => {
    dispatch(setSelectedImage(image))
    setModalOpen(true)
  }

  const handleDeleteImage = async () => {
    if (!selectedImage) return
    
    dispatch(setLoading(true))
    try {
      if (isElectron()) {
        // Call the exposed Electron API
        const result = await window.api.deleteImage(selectedImage.id)
        
        if (result.error) {
          showTimedAlert(`Error: ${result.error}`)
        } else {
          dispatch(removeImage(selectedImage.id))
          setModalOpen(false)
          showTimedAlert('Image deleted successfully', 'success')
        }
      } else {
        // Development mode
        dispatch(removeImage(selectedImage.id))
        setModalOpen(false)
        showTimedAlert('Development mode: Image would be deleted', 'warning')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      showTimedAlert('Failed to delete image')
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleAddImage = async () => {
    dispatch(setLoading(true))
    try {
      if (isElectron()) {
        // Open file dialog
        const dialogResult = await window.api.openFileDialog()
        
        if (dialogResult.canceled || dialogResult.error) {
          dispatch(setLoading(false))
          return
        }
        
        // Upload the selected image
        const newImage = await window.api.uploadImage(dialogResult.filePath)
        
        if (newImage.error) {
          showTimedAlert(`Error: ${newImage.error}`)
        } else {
          await loadImages() // Reload images to get the latest list
          showTimedAlert('Image uploaded successfully', 'success')
        }
      } else {
        // Development mode
        showTimedAlert('Development mode: Cannot add images', 'warning')
      }
    } catch (error) {
      console.error('Error adding image:', error)
      showTimedAlert('Failed to add image')
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <Container fluid className="py-4">
      <Alert
        color={alertColor}
        isOpen={showAlert}
        toggle={() => setShowAlert(false)}
        className="mb-3"
      >
        {alertMessage}
      </Alert>
      
      <Row className="mb-4">
        <Col>
          <h2 className="text-white">My Gallery</h2>
        </Col>
        <Col md={4} className="text-end d-flex justify-content-end">
          <Button
            color="primary"
            onClick={handleAddImage}
            className="btn-color border-0"
          >
            Add Image
          </Button>
          <Button
            color="secondary"
            onClick={loadImages}
            disabled={loading}
            className="ms-2"
          >
            {loading ? <Spinner size="sm" /> : 'Refresh'}
          </Button>
        </Col>
      </Row>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="text-white mt-2">Loading images...</p>
        </div>
      ) : (
        <Row>
          {images.length > 0 ? (
            images.map((image) => (
              <Col md={3} key={image.id} className="mb-4">
                <Card 
                  className="container-bg border-0 h-100"
                  onClick={() => handleImageClick(image)}
                  style={{ cursor: 'pointer' }}
                >
                  <img  src={image.path}
                  />
                  <CardBody className="text-white">
                    <h5>{image.name}</h5>
                    <p className="mb-0 text-muted">
                      {new Date(image.modified).toLocaleDateString()}
                    </p>
                  </CardBody>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <Card className="container-bg border-0">
                <CardBody className="text-center py-5 text-white">
                  <h4>No images found</h4>
                  <p>Use the Add Image button to add images to your gallery</p>
                </CardBody>
              </Card>
            </Col>
          )}
        </Row>
      )}
      
      {/* Image Preview Modal */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg" className="modal-dark">
        <ModalHeader toggle={() => setModalOpen(false)} className="container-bg text-white">
          {selectedImage?.name}
        </ModalHeader>
        <ModalBody className="container-bg text-white">
          {selectedImage && (
            <div className="text-center">
              <img 
                src={isElectron() ? `file://${selectedImage.path}` : selectedImage.path}
                alt={selectedImage.name}
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '60vh'
                }}
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter className="container-bg">
          <Button color="danger" onClick={handleDeleteImage}>
            Delete
          </Button>
          <Button color="secondary" onClick={() => setModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  )
}

export default Gallery