import React from "react";
import {CardImg, Button } from "reactstrap";
import "../styles/ImageCard.css"; 
const ImageCard = ({ image, onImageClick, onDeleteClick }) => {
  const handleDeleteClick = (e) => {
    onDeleteClick(image);
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
  );
};

export default ImageCard;