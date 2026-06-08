import axios from "../utils/AxiosConfig";

const BASE_URL = process.env.REACT_APP_BASEURL;

// CREATE ENROLLMENT REQUEST
export const createEnrollmentRequest = async (payload) => {
  const { data } = await axios.post(
    `${BASE_URL}/api/v1/enrollment-requests/create`,
    payload,
  );
  return data;
};

// GET MY ENROLLMENT REQUEST STATUS
export const getMyEnrollmentRequestStatusApi = async () => {
  const { data } = await axios.get(
    `${BASE_URL}/api/v1/enrollment-requests/my-status`,
  );
  return data;
};
