import axios from 'axios';
import { toast } from 'react-toastify';

// Use relative path which will be resolved by Vite proxy
const BASE_URL = "/api";
export const API_URL = BASE_URL;

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      console.log(`Adding token to ${config.url} request`);
      config.headers["Authorization"] = `Bearer ${user.token}`;
    } else {
      console.log(`No token available for ${config.url} request`);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (res) => {
    return res; 
  },
  async (err) => {
    if (err.response && err.response.status === 401) {
      // localStorage.removeItem("user");
      // toast.error('Phiên đăng nhập đã hết hạn', {
      //   id: 'expired-session',
      //   position: "top-right",
      //   autoClose: 3000,
      //   hideProgressBar: false,
      //   closeOnClick: true,
      //   pauseOnHover: true,
      //   draggable: true,
      // });
      // setTimeout(() => {
      //   window.location.href = "/login";
      // }, 1500);
      return Promise.reject(err);
    }
    return Promise.reject(err);
  }
);

export default instance;