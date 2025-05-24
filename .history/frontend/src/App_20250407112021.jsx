import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthService from "./services/auth.service";
import Login from "./components/Login";
import Home from "./components/Home";
import Profile from "./components/Profile";
import BoardAdmin from "./components/BoardAdmin";
import BoardUser from "./components/BoardUser";
import SinhVienBoard from "./components/SinhVienBoard";
import NavBar from "./components/NavBar";
import GiangVienBoard from "./components/GiangVienBoard";

const App = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [showQuanLyBoard, setShowQuanLyBoard] = useState(false);
  const [showGiangVienBoard, setShowGiangVienBoard] = useState(false);
  const [showSinhVienBoard, setShowSinhVienBoard] = useState(false);
  const [loading, setLoading] = useState(true);
  const authService = new AuthService();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = authService.getCurrentUser();
        console.log("User from localStorage:", user);
        if (user) {
          setCurrentUser(user);
          setShowQuanLyBoard(user.roles.includes("ROLE_QL"));
          setShowGiangVienBoard(user.roles.includes("ROLE_GV"));
          setShowSinhVienBoard(user.roles.includes("ROLE_SV"));
        } else {
          console.log("No user found, keeping default state");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Thêm useEffect mới để xử lý khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      console.log("Current user updated:", currentUser);
      setShowQuanLyBoard(currentUser.roles.includes("ROLE_QL"));
      setShowGiangVienBoard(currentUser.roles.includes("ROLE_GV"));
      setShowSinhVienBoard(currentUser.roles.includes("ROLE_SV"));
    }
  }, [currentUser]);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(undefined);
    setShowQuanLyBoard(false);
    setShowGiangVienBoard(false);
    setShowSinhVienBoard(false);
    navigate("/login");
  };

  return (
    <div className="app-container">
      <ToastContainer />
      <NavBar
        currentUser={currentUser}
        showAdminBoard={showQuanLyBoard}
        showEmployeeBoard={showGiangVienBoard}
        showSinhVienBoard={showSinhVienBoard}
        onLogout={handleLogout}
      />
      <div className="custom-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
          <Route path="/profile" element={<Profile currentUser={currentUser} />} />
          <Route
            path="/admin"
            element={showQuanLyBoard ? <BoardAdmin /> : <Navigate to="/login" />}
          />
          <Route
            path="/giangvien"
            element={
              showGiangVienBoard ? <GiangVienBoard /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/user"
            element={currentUser ? <BoardUser /> : <Navigate to="/login" />}
          />
          <Route
            path="/sinhvien"
            element={
              showSinhVienBoard ? <SinhVienBoard /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;