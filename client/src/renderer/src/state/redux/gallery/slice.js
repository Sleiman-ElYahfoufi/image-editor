import { createSlice } from "@reduxjs/toolkit";

const gallerySlice = createSlice({
  name: "gallery",
  initialState: {
    images: [],
    loading: false,
    selectedImage: null,
    error: null
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setImages: (state, action) => {
      state.images = action.payload;
    },
    setSelectedImage: (state, action) => {
      state.selectedImage = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addImage: (state, action) => {
      state.images.push(action.payload);
    },
    removeImage: (state, action) => {
      state.images = state.images.filter(image => image.id !== action.payload);
    }
  },
});

export const { 
  setLoading, 
  setImages, 
  setSelectedImage, 
  setError, 
  addImage, 
  removeImage
} = gallerySlice.actions;

export default gallerySlice;