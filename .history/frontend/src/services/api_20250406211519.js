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
    return res; // Trả về response thành công
  },
  async (err) => {
    const originalConfig = err.config;

    if (err.response) {
      if (err.response.status === 401 && !originalConfig._retry) {
        console.warn("401 Unauthorized detected for URL:", originalConfig.url);
        const isNotificationApi = originalConfig.url.includes("/thongbao/");
        
        if (originalConfig.url.includes("undefined")) {
          console.error("Lỗi API với tham số undefined phát hiện tại:", originalConfig.url);
          return Promise.reject(new Error("Tham số không hợp lệ trong URL API"));
        }
        
        if (isNotificationApi) {
          console.warn("401 Unauthorized detected for notification API, attempting to renew token");
          originalConfig._retry = true;
          
          try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user && user.token) {
              originalConfig.headers["Authorization"] = `Bearer ${user.token}`;
              return instance(originalConfig);
            } else {
              console.error("Không tìm thấy token hợp lệ để retry");
              return Promise.reject(new Error("Token không tồn tại hoặc không hợp lệ"));
            }
          } catch (retryError) {
            console.error("Lỗi khi retry request thông báo:", retryError);
            return Promise.reject(retryError);
          }
        } else {
          console.warn("401 Unauthorized detected for non-notification API, clearing user data");
          localStorage.removeItem("user");
        }
      }
      
      return Promise.reject(err);
    }
    return Promise.reject(err); 
  }
);

export default instance;