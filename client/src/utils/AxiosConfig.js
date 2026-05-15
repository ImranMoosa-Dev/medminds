import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_BASEURL,
  withCredentials: true,
});

// REQUEST INTERCEPTOR → Attach Token from localstorage

instance.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem("auth");
    if (auth) {
      const parsed = JSON.parse(auth);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR → Handle Expired Token
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // if toke expired or unauthorized
    const status = error.response?.status;
    const message = error.response?.data?.message;
    if (status === 401 || message === "Token expired or invalid") {
      localStorage.removeItem("auth"); // logout user
      window.location.href = "/"; // redirect to login
    }
    return Promise.reject(error);
  },
);
export default instance;
