import axios from "../utils/AxiosConfig";

const BASE_URL = process.env.REACT_APP_BASEURL;

// User Login
export const userLogin = async (email, password) => {
  const { data } = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
    email,
    password,
  });
  return data;
};

// User Register
export const userRegister = async (
  fullName,
  fatherName,
  district,
  whatsapp,
  status,
  email,
  password,
  confirmPassword,
) => {
  const { data } = await axios.post(`${BASE_URL}/api/v1/auth/register`, {
    fullName,
    fatherName,
    district,
    whatsapp,
    status,
    email,
    password,
    confirmPassword,
  });
  return data;
};

// Check User Authentication
export const authCheckApi = async () => {
  const { data } = await axios.get(
    `${process.env.REACT_APP_BASEURL}/api/v1/auth/me`,
  );
  return data;
};
