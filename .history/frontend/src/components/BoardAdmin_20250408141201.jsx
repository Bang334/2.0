import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, ListGroup, Tab, Spinner, Table, ProgressBar, Badge, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import authHeader from "../services/auth-header";
import TaiKhoanManager from "./TaiKhoanManager";
import PhongManager from "./PhongManager";
import GiangVienManager from "./GiangVienManager";
import SinhVienManager from "./SinhVienManager";
import YeuCauMuonPhongManager from "./YeuCauMuonPhongManager";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply, faFlag } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import SuCoManager from './SuCoManager';

const API_URL = "http://localhost:8080/api/quanly";

const BoardAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [roomFeedbackStats, setRoomFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAllFeedbacksModal, setShowAllFeedbacksModal] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState("");
  const [feedbackSort, setFeedbackSort] = useState("recent");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboardStats();
    } else if (activeTab === "baocao") {
      fetchRoomFeedbackStats();
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`, { headers: authHeader() });
      setDashboardStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê dashboard:", error);
      setLoading(false);
    }
  };

  const fetchRoomFeedbackStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/phong/feedback`, { headers: authHeader() });
      setRoomFeedbackStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê phản hồi phòng học:", error);
      setLoading(false);
    }
  };

  // Xử lý hiển thị tất cả phản hồi
  const handleShowAllFeedbacks = () => {
    setShowAllFeedbacksModal(true);
  };

  // Lọc danh sách phản hồi
  const getFilteredFeedbacks = () => {
    if (!roomFeedbackStats || !roomFeedbackStats.recentFeedbacks) return [];
    
    // Tạo danh sách tất cả phản hồi (thực tế sẽ được lấy từ API)
    // Ở đây sử dụng recentFeedbacks để demo
    let allFeedbacks = [...roomFeedbackStats.recentFeedbacks];
    
    // Thêm một số phản hồi giả lập để demo tính năng lọc/sắp xếp
    allFeedbacks = [
      ...allFeedbacks,
      // {
      //   maPhong: "P103",
      //   viTri: "Tầng 1, Tòa A",
      //   rating: 3.5,
      //   comment: "Phòng khá ổn, nhưng thiếu một số thiết bị cần thiết.",
      //   userName: "Hoàng Văn D",
      //   daysAgo: 7,
      //   idPhanHoi: 4
      // },
      // {
      //   maPhong: "P205",
      //   viTri: "Tầng 2, Tòa B",
      //   rating: 5.0,
      //   comment: "Phòng rất tuyệt vời, đầy đủ tiện nghi và thoáng mát.",
      //   userName: "Nguyễn Thị E",
      //   daysAgo: 10,
      //   idPhanHoi: 5
      // }
    ];
    
    // Lọc theo từ khóa
    if (feedbackFilter) {
      const filter = feedbackFilter.toLowerCase();
      allFeedbacks = allFeedbacks.filter(
        f => f.maPhong.toLowerCase().includes(filter) || 
             f.viTri.toLowerCase().includes(filter) || 
             f.comment.toLowerCase().includes(filter) || 
             f.userName.toLowerCase().includes(filter)
      );
    }
    
    // Sắp xếp
    switch(feedbackSort) {
      case "recent":
        return allFeedbacks.sort((a, b) => a.daysAgo - b.daysAgo);
      case "oldest":
        return allFeedbacks.sort((a, b) => b.daysAgo - a.daysAgo);
      case "highRating":
        return allFeedbacks.sort((a, b) => b.rating - a.rating);
      case "lowRating":
        return allFeedbacks.sort((a, b) => a.rating - b.rating);
      default:
        return allFeedbacks;
    }
  };

  // Phản hồi lại đánh giá
  const handleReplyToFeedback = async (feedback) => {
    // Lấy nội dung phản hồi từ người dùng
    const replyContent = prompt("Nhập nội dung phản hồi:", "");
    if (replyContent === null || replyContent.trim() === "") return;
    
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/phong/feedback/${feedback.idPhanHoi}/reply`, 
        { reply: replyContent }, 
        { headers: authHeader() }
      );
      
      toast.success("Đã phản hồi thành công");
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi phản hồi đánh giá:", error);
      toast.error("Có lỗi xảy ra khi phản hồi đánh giá");
      setLoading(false);
    }
  };
  
  // Đánh dấu đánh giá
  const handleFlagFeedback = async (feedback) => {
    if (!window.confirm("Bạn có chắc muốn đánh dấu phản hồi này không?")) return;
    
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/phong/feedback/${feedback.idPhanHoi}/flag`, 
        {}, 
        { headers: authHeader() }
      );
      
      toast.success("Đã đánh dấu phản hồi thành công");
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi đánh dấu phản hồi:", error);
      toast.error("Có lỗi xảy ra khi đánh dấu phản hồi");
      setLoading(false);
    }
  };

  // Xử lý khi tài khoản được thêm mới
  const handleTaiKhoanAdded = (vaiTro) => {
    console.log("Tài khoản mới được tạo với vai trò:", vaiTro);
    // Tăng refreshKey để các component con biết cần cập nhật dữ liệu
    setRefreshKey(prevKey => prevKey + 1);
    
    // Tự động chuyển sang tab tương ứng dựa trên vai trò tài khoản mới
    if (vaiTro === "ROLE_SV" && activeTab === "quanlytaikhoan") {
      setActiveTab("quanlysinhvien");
    } else if (vaiTro === "ROLE_GV" && activeTab === "quanlytaikhoan") {
      setActiveTab("quanlygiaovien");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'rooms':
        return <RoomManagement />;
      case 'requests':
        return <RequestManagement />;
      case 'suco':
        return <SuCoManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="admin-container">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default BoardAdmin; 