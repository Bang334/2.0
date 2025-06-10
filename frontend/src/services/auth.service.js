import api from './api';
import axios from 'axios';
import authHeader from './auth-header';

const AUTH_URL = "/auth";
const API_URL = "http://localhost:8080/api";

export default class AuthService {
  login(userId, password) {
    return api
      .post("/auth/login", {
        userId,
        password
      })
      .then(response => {
        if (response.data.token) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
      });
  }

  logout() {
    localStorage.removeItem("user");
    return Promise.resolve();
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
  
  changePassword(oldPassword, newPassword) {
    return api.post("/auth/change-password", {
      oldPassword,
      newPassword
    });
  }

  // Kiểm tra email đã tồn tại chưa
  checkEmailExists(email, excludeId = null) {
    let url = `${API_URL}/quanly/check/email?email=${encodeURIComponent(email)}`;
    if (excludeId) {
      url += `&excludeId=${encodeURIComponent(excludeId)}`;
    }
    return axios.get(url, { headers: authHeader() });
  }

  // Kiểm tra số điện thoại đã tồn tại chưa
  checkPhoneExists(phone, excludeId = null) {
    let url = `${API_URL}/quanly/check/phone?phone=${encodeURIComponent(phone)}`;
    if (excludeId) {
      url += `&excludeId=${encodeURIComponent(excludeId)}`;
    }
    return axios.get(url, { headers: authHeader() });
  }

  // Kiểm tra tên đăng nhập đã tồn tại chưa
  checkUsernameExists(username) {
    let url = `${API_URL}/quanly/check/username?username=${encodeURIComponent(username)}`;
    return axios.get(url, { headers: authHeader() });
  }
} 