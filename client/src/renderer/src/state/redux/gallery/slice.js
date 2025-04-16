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
 
  },
});

export const { 
  setLoading, 
  setImages, 
  setSelectedImage
} = gallerySlice.actions;

export default gallerySlice;