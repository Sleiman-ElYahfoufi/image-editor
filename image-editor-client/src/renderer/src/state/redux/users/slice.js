import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    loading: false,
  },
  reducers: {
    loadingUsers: (current, action) => {
      return {
        ...current,
        loading: true,
      };
    },
    loadUsers: (current, action) => {
      const users = action.payload;

      return {
        ...current,
        loading: false,
        list: users,
      };
    },
  },
});

export const { loadingUsers, loadUsers } = usersSlice.actions;

export default usersSlice;
