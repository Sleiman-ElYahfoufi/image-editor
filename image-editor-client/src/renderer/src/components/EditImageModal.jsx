import React, { useState, useEffect, useRef } from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Card,
  Input,
  FormGroup,
  Label,
  Spinner
} from 'reactstrap'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import '../styles/EditImageModal.css'

// Default crop to help users
const defaultCrop = {
  unit: '%',
  width: 100,
  height: 100,
  x: 0,
  y: 0
}

const EditImageModal = ({ isOpen, toggle, image }) => {
  const [rotation, setRotation] = useState(0)
  const [saving, setSaving] = useState(false)
  const [blackAndWhite, setBlackAndWhite] = useState(false)
  const [watermark, setWatermark] = useState(false)
  const [watermarkText, setWatermarkText] = useState('My Photos')
  const [watermarkPosition, setWatermarkPosition] = useState('bottom')
  const [watermarkFontSize, setWatermarkFontSize] = useState(128)
  const [watermarkColor, setWatermarkColor] = useState('#FF0000')
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.5)

  const [crop, setCrop] = useState(defaultCrop)
  const [completedCrop, setCompletedCrop] = useState(null)
  const [isCropping, setIsCropping] = useState(true)

  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const cropImageRef = useRef(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (isOpen && image) {
      setRotation(0)
      setBlackAndWhite(false)
      setWatermark(false)
      setWatermarkFontSize(32)
      setWatermarkColor('#FF0000')
      setWatermarkOpacity(0.5)
      setImageLoaded(false)
      setIsCropping(true)
      setCrop(defaultCrop)
      setCompletedCrop(null)
      setCroppedImageSrc(null)
    }
  }, [isOpen, image])

  const handleImageLoad = () => {
    if (!imageRef.current?.complete) return
    setImageLoaded(true)
    if (!isCropping) applyEdits()
  }

  useEffect(() => {
    if (imageLoaded && !isCropping) applyEdits()
  }, [
    rotation,
    blackAndWhite,
    watermark,
    watermarkText,
    watermarkPosition,
    watermarkFontSize,
    watermarkColor,
    watermarkOpacity,
    imageLoaded,
    isCropping
  ])

  const applyCrop = () => {
    if (!completedCrop || !cropImageRef.current) return null

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const image = cropImageRef.current

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = completedCrop.width * scaleX
    canvas.height = completedCrop.height * scaleY

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )

    const croppedImage = new Image()
    croppedImage.src = canvas.toDataURL('image/jpeg', 1.0)

    return croppedImage
  }

  const applyEdits = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = imageRef.current

    if (!img || !canvas) return

    if (!img.complete) {
      img.onload = applyEdits
      return
    }

    const swapDimensions = rotation === 90 || rotation === 270

    canvas.width = swapDimensions ? img.naturalHeight : img.naturalWidth
    canvas.height = swapDimensions ? img.naturalWidth : img.naturalHeight

    ctx.fillStyle = '#1E1E24'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
    ctx.restore()

    if (blackAndWhite) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        data[i] = avg
        data[i + 1] = avg
        data[i + 2] = avg
      }

      ctx.putImageData(imageData, 0, 0)
    }

    if (watermark && watermarkText) {
      ctx.save()

      const hexToRgba = (hex, opacity) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${opacity})`
      }

      ctx.fillStyle = hexToRgba(watermarkColor, watermarkOpacity)
      ctx.font = `${watermarkFontSize}px Arial`

      const textWidth = ctx.measureText(watermarkText).width
      let x, y

      if (watermarkPosition === 'bottom') {
        x = (canvas.width - textWidth) / 2
        y = canvas.height - 20
      } else {
        x = (canvas.width - textWidth) / 2
        y = canvas.height / 2
      }

      ctx.fillText(watermarkText, x, y)
      ctx.restore()
    }
  }

  const handleRotatePreset = (degrees) => {
    if (rotation == 0 && degrees == -90) setRotation(270)
    else if (rotation == 270 && degrees == 90) setRotation(0)
    else setRotation(rotation + degrees)
  }

  const handleSave = async () => {
    if (!image || !window.api?.saveEditedImage) return
    setSaving(true)

    try {
      const imageData = canvasRef.current.toDataURL('image/jpeg', 0.95)
      const result = await window.api.saveEditedImage({
        id: image.id,
        data: imageData
      })

      if (result?.success) toggle(true)
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const [croppedImageSrc, setCroppedImageSrc] = useState(null)

  const handleFinishCrop = () => {
    if (!completedCrop) {
      setIsCropping(false)
      return
    }

    const croppedImg = applyCrop()
    if (croppedImg) {
      setCroppedImageSrc(croppedImg.src)

      croppedImg.onload = () => {
        setIsCropping(false)
      }
    } else {
      setIsCropping(false)
    }
  }

  return (
    <Modal isOpen={isOpen} toggle={() => toggle(false)} size="xl" className="edit-image-modal">
      <ModalHeader toggle={() => toggle(false)} className="edit-header">
        {isCropping ? 'Crop Image' : 'Edit Image'}
      </ModalHeader>
      <ModalBody className="edit-body p-0">
        {isCropping ? (
          <div className="cropping-container">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={undefined}
            >
              <img
                ref={cropImageRef}
                src={`${image?.path}?t=${Date.now()}`}
                alt="Crop"
                onLoad={() => setImageLoaded(true)}
                style={{ maxHeight: '70vh', maxWidth: '100%' }}
              />
            </ReactCrop>
            <div className="crop-actions">
              <Button color="primary" onClick={handleFinishCrop} disabled={!imageLoaded}>
                Apply Crop
              </Button>
            </div>
          </div>
        ) : (
          <Row className="g-0">
            <Col md={9} className="canvas-section">
              <img
                ref={imageRef}
                src={croppedImageSrc || `${image?.path}?t=${Date.now()}`}
                alt=""
                style={{ display: 'none' }}
                onLoad={handleImageLoad}
              />

              <div className="canvas-container">
                <canvas ref={canvasRef} className="edit-canvas" />
              </div>
            </Col>

            <Col md={3} className="controls-sidebar">
              <Card className="control-card">
                <div className="control-header">Rotate</div>
                <div className="control-body">
                  <FormGroup>
                    <Label for="rotationSlider" className="d-flex justify-content-between">
                      <span>Angle: {rotation}°</span>
                    </Label>
                    <Input
                      type="range"
                      id="rotationSlider"
                      min="0"
                      max="270"
                      step="90"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="rotation-slider mb-2"
                      disabled={!imageLoaded}
                    />
                  </FormGroup>

                  <div className="preset-buttons">
                    <Button
                      outline
                      color="secondary"
                      size="sm"
                      onClick={() => handleRotatePreset(-90)}
                      active={rotation === 270}
                      className="preset-button"
                    >
                      -90°
                    </Button>
                    <Button
                      outline
                      color="secondary"
                      size="sm"
                      onClick={() => handleRotatePreset(0)}
                      active={rotation === 0}
                      className="preset-button"
                    >
                      0°
                    </Button>
                    <Button
                      outline
                      color="secondary"
                      size="sm"
                      onClick={() => handleRotatePreset(90)}
                      active={rotation === 90}
                      className="preset-button"
                    >
                      +90°
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="control-card">
                <div className="control-header">Black & White</div>
                <div className="control-body">
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        checked={blackAndWhite}
                        onChange={() => setBlackAndWhite(!blackAndWhite)}
                        disabled={!imageLoaded}
                      />
                      Convert to B&W
                    </Label>
                  </FormGroup>
                </div>
              </Card>

              {/* Watermark controls */}
              <Card className="control-card">
                <div className="control-header">Watermark</div>
                <div className="control-body">
                  <FormGroup check className="mb-2">
                    <Label check>
                      <Input
                        type="checkbox"
                        checked={watermark}
                        onChange={() => setWatermark(!watermark)}
                        disabled={!imageLoaded}
                      />
                      Add watermark
                    </Label>
                  </FormGroup>

                  {watermark && (
                    <>
                      <FormGroup className="mb-2">
                        <Input
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder="Watermark text"
                          disabled={!imageLoaded}
                          bsSize="sm"
                        />
                      </FormGroup>

                      <FormGroup className="mb-2">
                        <Label for="fontSizeSlider" className="d-flex justify-content-between mb-2">
                          <span>Font Size: {watermarkFontSize}px</span>
                        </Label>
                        <Input
                          type="range"
                          id="fontSizeSlider"
                          min="12"
                          max="128"
                          step="2"
                          value={watermarkFontSize}
                          onChange={(e) => setWatermarkFontSize(parseInt(e.target.value))}
                          className="font-size-slider"
                          disabled={!imageLoaded}
                        />
                      </FormGroup>

                      <FormGroup className="mb-2">
                        <Label for="watermarkColor" className="d-flex justify-content-between mb-2">
                          <span>Color</span>
                        </Label>
                        <div className="d-flex align-items-center">
                          <Input
                            type="color"
                            id="watermarkColor"
                            value={watermarkColor}
                            onChange={(e) => setWatermarkColor(e.target.value)}
                            className="color-picker"
                            disabled={!imageLoaded}
                          />
                          <span className="color-hex">{watermarkColor}</span>
                        </div>
                      </FormGroup>

                      <FormGroup className="mb-3">
                        <Label for="opacitySlider" className="d-flex justify-content-between mb-2">
                          <span>Opacity: {Math.round(watermarkOpacity * 100)}%</span>
                        </Label>
                        <Input
                          type="range"
                          id="opacitySlider"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                          className="opacity-slider"
                          disabled={!imageLoaded}
                        />
                      </FormGroup>

                      <div className="preset-buttons">
                        <Button
                          outline
                          color="secondary"
                          size="sm"
                          onClick={() => setWatermarkPosition('bottom')}
                          active={watermarkPosition === 'bottom'}
                          className="preset-button"
                        >
                          Bottom
                        </Button>
                        <Button
                          outline
                          color="secondary"
                          size="sm"
                          onClick={() => setWatermarkPosition('center')}
                          active={watermarkPosition === 'center'}
                          className="preset-button"
                        >
                          Center
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </ModalBody>
      <ModalFooter className="edit-footer">
        <Button color="secondary" onClick={() => toggle(false)}>
          Cancel
        </Button>
        {isCropping ? (
          <Button color="primary" onClick={() => setIsCropping(false)} disabled={!imageLoaded}>
            Continue to Edit
          </Button>
        ) : (
          <Button color="primary" onClick={handleSave} disabled={saving || !imageLoaded}>
            {saving ? <Spinner size="sm" /> : 'Save'}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  )
}

export default EditImageModal
