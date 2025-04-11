import { configureStore } from "@reduxjs/toolkit";
import usersSlice from "./users/slice";
import gallerySlice from "./gallery/slice";


const store = configureStore({
  reducer: {
    users: usersSlice.reducer,
    gallery: gallerySlice.reducer,


  },
});

export default store;
