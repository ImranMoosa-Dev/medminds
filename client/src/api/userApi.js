import axios from "../utils/AxiosConfig";

const BASE_URL = process.env.REACT_APP_BASEURL;

export const getAllUsers = async () => {
  const { data } = await axios.get(`${BASE_URL}/api/v1/admin/users/all-users`);

  return data;
};
