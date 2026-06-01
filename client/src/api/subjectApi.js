import axios from "../utils/AxiosConfig";

const BASE_URL = process.env.REACT_APP_BASEURL;

// get all subjects
export const getAllSubjects = async () => {
  const { data } = await axios.get(`${BASE_URL}/api/v1/subjects`);
  return data;
};
