import axios from "../utils/AxiosConfig";

const BASE_URL = process.env.REACT_APP_BASEURL;
// GET ALL BATCHES
export const getAllBatchesApi = async () => {
  const { data } = await axios.get(`${BASE_URL}/api/v1/batches/all`);
  return data;
};

// Get logged in users batch
export const getMyBatch = async () => {
  const { data } = await axios.get(
    `${BASE_URL}/api/v1/batches/student/my-batch`,
  );
  return data;
};
