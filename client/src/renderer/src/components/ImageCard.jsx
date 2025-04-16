import React from "react";
import { CardImg, Button } from "reactstrap";
import "../styles/ImageCard.css"; 

const ImageCard = ({ image, onImageClick, onDeleteClick, onEditClick }) => {
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDeleteClick(image);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEditClick(image);
  };

  return (
    <div className="image-card-container">
      <div className="image-wrapper">
        <CardImg
          top
          src={image.path}
          alt={image.name}
          className="card-image"
          onClick={() => onImageClick(image)}
        />
        <div className="image-buttons">
          <Button 
            color="primary" 
            size="sm"
            className="edit-button me-2"
            onClick={handleEditClick}
          >
            Edit
          </Button>
          <Button 
            color="danger" 
            size="sm"
            className="delete-button"
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;