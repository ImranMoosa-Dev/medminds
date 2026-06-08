import axios from "../utils/AxiosConfig";

const BASE_URL = process.env.REACT_APP_BASEURL;

// GET STUDENT PROFILE
export const getStudentProfile = async () => {
  const { data } = await axios.get(`${BASE_URL}/api/v1/student/profile`);
  return data;
};

// UPDATE STUDENT PROFILE
export const updateStudentProfile = async (updates) => {
  const { data } = await axios.put(
    `${BASE_URL}/api/v1/student/update-profile`,
    updates,
  );
  return data;
};

// DELETE STUDENT ACCOUNT
export const deleteStudentAccount = async () => {
  const { data } = await axios.delete(
    `${BASE_URL}/api/v1/student/delete-account`,
  );
  return data;
};
