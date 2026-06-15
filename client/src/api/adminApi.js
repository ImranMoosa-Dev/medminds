import axios from "../utils/AxiosConfig";

const BASE_URL = process.env.REACT_APP_BASEURL;

// ==========================
// GET ADMIN PROFILE
// ==========================
export const getAdminProfileApi = async () => {
  const res = await axios.get(`${BASE_URL}/api/v1/admin/profile`);
  return res.data;
};
