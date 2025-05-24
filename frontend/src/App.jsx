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
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import { isAuthenticated, getDefaultRoute, handleLogout } from "./utils/authUtils";

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
        if (user) {
          setCurrentUser(user);
          setShowQuanLyBoard(user.roles.includes("ROLE_QL") || user.roles.includes("ROLE_ADMIN"));
          setShowGiangVienBoard(user.roles.includes("ROLE_GV"));
          setShowSinhVienBoard(user.roles.includes("ROLE_SV"));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const onLogout = () => {
    authService.logout();
    handleLogout();
    setCurrentUser(undefined);
    setShowQuanLyBoard(false);
    setShowGiangVienBoard(false);
    setShowSinhVienBoard(false);
    navigate("/login");
  };

  // Nếu đang loading, hiển thị loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
        toastId="unique-toast"
      />
      <NavBar
        currentUser={currentUser}
        showAdminBoard={showQuanLyBoard}
        showEmployeeBoard={showGiangVienBoard}
        showSinhVienBoard={showSinhVienBoard}
        onLogout={onLogout}
      />
      <div className="custom-container">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          
          {/* Login route - only accessible when not logged in */}
          <Route path="/login" element={
            <PublicOnlyRoute>
              <Login setCurrentUser={setCurrentUser} />
            </PublicOnlyRoute>
          } />
          
          {/* Protected routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile currentUser={currentUser} />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRoles={['ROLE_QL', 'ROLE_ADMIN']}>
              <BoardAdmin />
            </ProtectedRoute>
          } />
          
          {/* Giảng viên routes */}
          <Route path="/giangvien" element={
            <ProtectedRoute requiredRoles={['ROLE_GV']}>
              <GiangVienBoard />
            </ProtectedRoute>
          } />
          
          {/* Sinh viên routes */}
          <Route path="/sinhvien" element={
            <ProtectedRoute requiredRoles={['ROLE_SV']}>
              <SinhVienBoard />
            </ProtectedRoute>
          } />
          
          {/* General user route */}
          <Route path="/user" element={
            <ProtectedRoute>
              <BoardUser />
            </ProtectedRoute>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;