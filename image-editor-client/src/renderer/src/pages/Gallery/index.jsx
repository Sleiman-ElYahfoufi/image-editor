import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert
} from 'reactstrap'
import { setLoading, setImages, setSelectedImage, removeImage } from '../../state/redux/gallery/slice'
import ImageCard from '../../components/ImageCard'
import AddImageModal from '../../components/AddImageModal'
import DeleteImageModal from '../../components/DeleteImageModal'
import PreviewImageModal from '../../components/PreviewImageModal'
import EditImageModal from '../../components/EditImageModal'

const Gallery = () => {
  const dispatch = useDispatch()
  const { images, loading, selectedImage } = useSelector((state) => state.gallery)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [imageToDelete, setImageToDelete] = useState(null)
  const [imageToEdit, setImageToEdit] = useState(null)

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

  const isElectron = () => {
    return window && window.api && typeof window.api.getImages === 'function'
  }

  const loadImages = async () => {
    dispatch(setLoading(true))
    try {
      if (isElectron()) {
        // Get images from Electron
        const loadedImages = await window.api.getImages()
        
        // Add cache-busting timestamp to each image path
        const timestamp = Date.now()
        const refreshedImages = loadedImages.map(img => ({
          ...img,
          path: `${img.path}${img.path.includes('?') ? '&' : '?'}t=${timestamp}`
        }))
        
        dispatch(setImages(refreshedImages))
        showTimedAlert('Images loaded successfully', 'success')
      } else {
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
    setPreviewModalOpen(true)
  }
  
  const handleClosePreviewModal = () => {
    setPreviewModalOpen(false)
  }
  
  const handleAddModal = () => {
    setAddModalOpen(true)
  }
  
  const handleDeleteClick = (image) => {
    setImageToDelete(image)
    setDeleteModalOpen(true)
  }
  
  const handleEditClick = (image) => {
    setImageToEdit(image)
    setEditModalOpen(true)
  }
  
  const handleCloseDeleteModal = async (wasImageDeleted) => {
    if (wasImageDeleted) {
      dispatch(removeImage(imageToDelete.id))
      showTimedAlert('Image deleted successfully', 'success')
      
      if (selectedImage && selectedImage.id === imageToDelete.id) {
        setPreviewModalOpen(false)
      }
    }
    setDeleteModalOpen(false)
    setImageToDelete(null)
  }

  const handleCloseAddModal = async (wasImageAdded) => {
    if (wasImageAdded) {
      await loadImages()
      showTimedAlert('Image added successfully', 'success')
    }
    setAddModalOpen(false)
  }
  
  const handleCloseEditModal = async (wasImageEdited) => {
    if (wasImageEdited) {
      // Force a full reload of all images
      const loadedImages = await window.api.getImages()
      
      // Add a cache-busting timestamp to each image path
      const timestamp = Date.now()
      const refreshedImages = loadedImages.map(img => ({
        ...img,
        path: `${img.path}?t=${timestamp}`
      }))
      
      // Update the redux store
      dispatch(setImages(refreshedImages))
      
      // If we're previewing the edited image, update it
      if (selectedImage && selectedImage.id === imageToEdit.id) {
        const updatedImage = refreshedImages.find(img => img.id === imageToEdit.id)
        if (updatedImage) {
          dispatch(setSelectedImage(updatedImage))
        }
      }
      
      showTimedAlert('Image edited successfully', 'success')
    }
    setEditModalOpen(false)
    setImageToEdit(null)
  }
  
  return (
    <Container fluid className="py-4">
      <Alert
        color={alertColor}
        isOpen={showAlert}
        toggle={() => setShowAlert(false)}
        className="mb-3"
        timeout={2000}
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
            onClick={handleAddModal}
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
                >
                  <ImageCard 
                    image={image} 
                    onImageClick={handleImageClick}
                    onDeleteClick={handleDeleteClick}
                    onEditClick={handleEditClick}
                  />
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <Card className="container-bg border-0">
                <div className="text-center py-5 text-white">
                  <h4>No images found</h4>
                  <p>Use the Add Image button to add images to your gallery</p>
                </div>
              </Card>
            </Col>
          )}
        </Row>
      )}
      
      {/* Image Preview Modal */}
      <PreviewImageModal
        isOpen={previewModalOpen}
        toggle={handleClosePreviewModal}
        image={selectedImage}
      />
      
      {/* Add Image Modal */}
      <AddImageModal 
        isOpen={addModalOpen} 
        toggle={handleCloseAddModal} 
      />
      
      {/* Delete Image Modal */}
      <DeleteImageModal
        isOpen={deleteModalOpen}
        toggle={handleCloseDeleteModal}
        image={imageToDelete}
      />
      
      {/* Edit Image Modal */}
      <EditImageModal
        isOpen={editModalOpen}
        toggle={handleCloseEditModal}
        image={imageToEdit}
      />
    </Container>
  )
}

export default Gallery