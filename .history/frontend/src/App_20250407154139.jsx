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
        if (user) {
          setCurrentUser(user);
          setShowQuanLyBoard(user.roles.includes("ROLE_QL"));
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

  const handleLogout = () => {
    authService.logout();
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
        onLogout={handleLogout}
      />
      <div className="custom-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={
            currentUser ? (
              <Navigate to={getDefaultRoute(currentUser.roles)} replace />
            ) : (
              <Login setCurrentUser={setCurrentUser} />
            )
          } />
          <Route path="/profile" element={
            currentUser ? <Profile currentUser={currentUser} /> : <Navigate to="/login" replace />
          } />
          <Route path="/admin" element={
            showQuanLyBoard ? <BoardAdmin /> : <Navigate to="/login" replace />
          } />
          <Route path="/giangvien" element={
            showGiangVienBoard ? <GiangVienBoard /> : <Navigate to="/login" replace />
          } />
          <Route path="/user" element={
            currentUser ? <BoardUser /> : <Navigate to="/login" replace />
          } />
          <Route path="/sinhvien" element={
            showSinhVienBoard ? <SinhVienBoard /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </div>
    </div>
  );
};

// Helper function to get default route based on user roles
const getDefaultRoute = (roles) => {
  if (roles.includes("ROLE_SV")) return "/sinhvien";
  if (roles.includes("ROLE_GV")) return "/giangvien";
  if (roles.includes("ROLE_QL")) return "/admin";
  return "/profile";
};

export default App;