import api from './api';

const AUTH_URL = "/auth";

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
} 