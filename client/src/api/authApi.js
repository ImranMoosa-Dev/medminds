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
