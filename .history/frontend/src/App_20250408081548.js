import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './redux/authSlice';
import axios from 'axios';

// ... existing imports ...

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Thêm interceptor cho axios để xử lý lỗi 401 (Unauthorized)
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token hết hạn, đăng xuất và hiển thị thông báo
          dispatch(logout());
          toast.error('Phiên đăng nhập đã hết hạn', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          window.location.href = '/login';
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor khi component unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [dispatch]);

  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          {/* ... existing routes ... */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App; 