import { request } from "../../../utils/request";
import { loadingUsers, loadUsers } from "./slice";

export const fetchUsers = async (dispatch) => {
  dispatch(loadingUsers());
  const response = await request({
    method: "GET",
    route: "/users",
    auth: true,
  });

  if (!response.error) {
    dispatch(loadUsers(response));
  }
};
