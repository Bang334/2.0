import React, { useState, useEffect, useRef } from "react";
import { Container, Card, Table, Button, Nav, Toast, Tab, Tabs, Alert } from "react-bootstrap";
import UserService from "../services/user.service";
import ThoiKhoaBieu from "./ThoiKhoaBieu";
import MuonPhongManager from "./MuonPhongManager";
import ThongBaoList from "./ThongBaoList";
import ThongBaoForm from "./ThongBaoForm";
import UserInfoDisplay from "./UserInfoDisplay";
import "../css/ThongBaoList.css";
import "../css/Toast.css";
import { toast } from "react-toastify";

// Helper to get the current week number
const getCurrentWeekNumber = () => {
  const today = new Date();
  const oneJan = new Date(today.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((today - oneJan) / 86400000) + 1;
  return Math.ceil(dayOfYear / 7);
};

const GiangVienBoard = () => {
  const [giangVienInfo, setGiangVienInfo] = useState(null);
  const [lichDay, setLichDay] = useState([]);
  const [danhSachPhong, setDanhSachPhong] = useState([]);
  const [yeuCauMuonPhong, setYeuCauMuonPhong] = useState([]);
  const [lichSuMuonPhong, setLichSuMuonPhong] = useState([]);
  const [activeTab, setActiveTab] = useState("thongtin");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errorToast, setErrorToast] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedTuan, setSelectedTuan] = useState(getCurrentWeekNumber());
  const [loading, setLoading] = useState(false);
  const [thongBaoTab, setThongBaoTab] = useState("list");
  const thongBaoListRef = useRef(null);

  useEffect(() => {
    fetchGiangVienInfo();
    fetchDanhSachPhong();
    fetchYeuCauMuonPhong();
    fetchLichSuMuonPhong();
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (message && showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [message, showToast]);

  const fetchGiangVienInfo = async () => {
    try {
      const response = await UserService.getThongTinGiangVien();
      
      // Get the data from response
      const gvData = response.data;

      if (!gvData.nguoiDung) {
        gvData.nguoiDung = {
          hoTen: gvData.hoTen,
          email: gvData.email,
          lienHe: gvData.lienHe,
          gioiTinh: gvData.gioiTinh,
          avatarURL: gvData.avatarURL
        };
      } 
      else if (!gvData.nguoiDung.avatarURL) {
        gvData.nguoiDung.avatarURL = "avatar5.jpg";
      }
      
      if (gvData.avatarURL && !gvData.nguoiDung) {
        gvData.nguoiDung = {
          hoTen: gvData.hoTen,
          email: gvData.email,
          lienHe: gvData.lienHe,
          gioiTinh: gvData.gioiTinh,
          avatarURL: gvData.avatarURL
        };
      }
      
      setGiangVienInfo(gvData);
    } catch (error) {
      console.error("Error fetching giảng viên info:", error);
      handleError("Không thể tải thông tin giảng viên");
    }
  };

  const fetchLichDay = async (tuan = selectedTuan) => {
    try {
      const response = await UserService.getLichDayGiangVien(tuan);
      
      if (response.data && Array.isArray(response.data)) {
        const normalizedData = response.data.map(item => ({
          ...item,
          tietBatDau: parseInt(item.tietBatDau),
          tietKetThuc: parseInt(item.tietKetThuc),
          tuan: parseInt(item.tuan)
        }));
        
        setLichDay(normalizedData);
        return normalizedData;
      } else {
        setLichDay([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching lịch dạy:", error);
      handleError(`Không thể tải lịch dạy: ${error.response?.data?.message || error.message}`);
      return [];
    }
  };

  const fetchDanhSachPhong = async () => {
    try {
      const response = await UserService.getDanhSachPhongGV();
      setDanhSachPhong(response.data);
    } catch (error) {
      console.error("Error fetching danh sách phòng:", error);
      handleError("Không thể tải danh sách phòng");
    }
  };

  const fetchYeuCauMuonPhong = async () => {
    try {
      const response = await UserService.getYeuCauMuonPhongGV();
      setYeuCauMuonPhong(response.data);
    } catch (error) {
      console.error("Error fetching yêu cầu mượn phòng:", error);
      handleError("Không thể tải yêu cầu mượn phòng");
    }
  };

  const fetchLichSuMuonPhong = async () => {
    try {
      const response = await UserService.getLichSuMuonPhongGV();
      setLichSuMuonPhong(response.data);
    } catch (error) {
      console.error("Error fetching lịch sử mượn phòng:", error);
      handleError("Không thể tải lịch sử mượn phòng");
    }
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setErrorToast(true);
    toast.error(errorMessage);
  };

  const handleSuccess = (successMessage) => {
    setMessage(successMessage);
    setShowToast(true);
    toast.success(successMessage);
  };

  const handleRefresh = () => {
    fetchYeuCauMuonPhong();
    fetchLichSuMuonPhong();
  };

  return (
    <Container fluid className="py-3">
      {/* Hiển thị thông báo lỗi */}
      <Toast 
        show={errorToast} 
        onClose={() => setErrorToast(false)} 
        delay={3000} 
        autohide 
        style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}
        bg="danger"
      >
        <Toast.Header>
          <strong className="me-auto">Lỗi</strong>
        </Toast.Header>
        <Toast.Body className="text-white">{error}</Toast.Body>
      </Toast>
      
      {/* Hiển thị thông báo thành công */}
      <Toast 
        show={showToast} 
        onClose={() => setShowToast(false)} 
        delay={3000} 
        autohide 
        style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}
        bg="success"
      >
        <Toast.Header>
          <strong className="me-auto">Thành công</strong>
        </Toast.Header>
        <Toast.Body className="text-white">{message}</Toast.Body>
      </Toast>
      
      <div className="tabs-spacer"></div>
      
      {/* Custom Tabs */}
      <div className="custom-tabs">
        <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav.Item>
            <Nav.Link eventKey="thongtin">Thông tin cá nhân</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="thongbao">Thông báo</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="lichhoc">Lịch dạy</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="muonphong">Mượn phòng</Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "thongtin" && giangVienInfo && (
          <UserInfoDisplay 
            userInfo={giangVienInfo} 
            userType="giangvien" 
          />
        )}

        {activeTab === "thongbao" && (
          <Card>
            <Card.Header>
              <Tabs
                id="thongbao-tabs"
                activeKey={thongBaoTab}
                onSelect={(k) => setThongBaoTab(k)}
                className="mb-3"
              >
                <Tab eventKey="list" title="Danh sách"></Tab>
                <Tab eventKey="form" title="Gửi thông báo"></Tab>
              </Tabs>
            </Card.Header>
            <Card.Body>
              {thongBaoTab === "list" && (
                <ThongBaoList 
                  isGiangVien={true}
                  ref={thongBaoListRef}
                  onError={handleError}
                  onRefresh={() => {}}
                />
              )}
              {thongBaoTab === "form" && (
                <ThongBaoForm 
                  isGiangVien={true} 
                  onSendSuccess={handleSuccess}
                  onError={handleError}
                  onSendComplete={() => {
                    setThongBaoTab("list");
                    if (thongBaoListRef.current) {
                      thongBaoListRef.current.switchToSentTab();
                      thongBaoListRef.current.refreshList();
                    }
                  }}
                />
              )}
            </Card.Body>
          </Card>
        )}

        {activeTab === "lichhoc" && (
          <ThoiKhoaBieu 
            currentUser={giangVienInfo}
            isGiangVien={true}
          />
        )}
        
        {activeTab === "muonphong" && (
          <MuonPhongManager 
            yeuCauMuonPhong={yeuCauMuonPhong}
            lichSuMuonPhong={lichSuMuonPhong}
            danhSachPhong={danhSachPhong}
            onError={handleError}
            onSuccess={handleSuccess}
            onRefresh={handleRefresh}
            isGiangVien={true}
          />
        )}
      </div>
    </Container>
  );
};

export default GiangVienBoard; 