import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_BASEURL,
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
    if (
      error.response.status === 401 ||
      error.response.data?.message === "Token expired or invalid"
    ) {
      localStorage.removeItem("auth"); // logout user
      window.location.href = "/"; // redirect to login
    }
    return Promise.reject(error);
  },
);
export default instance;
