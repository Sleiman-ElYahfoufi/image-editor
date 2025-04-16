import axios from "axios";

axios.defaults.baseURL = "http://15.237.119.184:8000/api/v0.1/";

export const request = async ({ method, route, body, auth = false }) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (auth) {
    headers.Authorization = `Bearer ${localStorage.token}`;
  }

  try {
    const response = await axios.request({
      method, 
      headers,
      url: route,
      data: body,
    });

    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error.message,
    };
  }
};
