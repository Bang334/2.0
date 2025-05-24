import axios from 'axios';

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
      config.headers["Authorization"] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (res) => {
    return res; 
  },
  async (err) => {
    const originalConfig = err.config;

    if (err.response) {
      if (err.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;
        
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          if (user && user.token) {
            originalConfig.headers["Authorization"] = `Bearer ${user.token}`;
            return instance(originalConfig);
          }
        } catch (retryError) {
          console.error("Lỗi khi retry request:", retryError);
          return Promise.reject(retryError);
        }
      }
      return Promise.reject(err);
    }
    return Promise.reject(err);
  }
);

export default instance;