import axios from 'axios';

const BASE_URL = "/api";
export const API_URL = BASE_URL;

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token authorization vào header
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

// Interceptor cho response
instance.interceptors.response.use(
  (res) => {
    return res; // Trả về response thành công
  },
  async (err) => {
    const originalConfig = err.config;

    if (err.response) {
      // Token hết hạn hoặc lỗi xác thực
      if (err.response.status === 401 && !originalConfig._retry) {
        console.warn("401 Unauthorized detected for URL:", originalConfig.url);
        
        // Kiểm tra nếu URL có chứa từ khóa thông báo
        const isNotificationApi = originalConfig.url.includes("/thongbao/");
        
        // Kiểm tra nếu URL trả về undefined, đó có thể là lỗi thông số
        if (originalConfig.url.includes("undefined")) {
          console.error("Lỗi API với tham số undefined phát hiện tại:", originalConfig.url);
          return Promise.reject(new Error("Tham số không hợp lệ trong URL API"));
        }
        
        if (isNotificationApi) {
          console.warn("401 Unauthorized detected for notification API, attempting to renew token");
          
          // Đánh dấu đã thử retry request này
          originalConfig._retry = true;
          
          // Lấy lại token từ localStorage
          try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user && user.token) {
              // Cập nhật token trong header và thử lại request
              originalConfig.headers["Authorization"] = `Bearer ${user.token}`;
              return instance(originalConfig);
            } else {
              console.error("Không tìm thấy token hợp lệ để retry");
              // Nếu không có token, từ chối request và thông báo lỗi rõ ràng
              return Promise.reject(new Error("Token không tồn tại hoặc không hợp lệ"));
            }
          } catch (retryError) {
            console.error("Lỗi khi retry request thông báo:", retryError);
            return Promise.reject(retryError);
          }
        } else {
          // Xóa user data nếu không phải API thông báo
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