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
  const [danhSachSinhVien, setDanhSachSinhVien] = useState([]);
  const [selectedLopHoc, setSelectedLopHoc] = useState(null);
  const [lopHocList, setLopHocList] = useState([]);
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
    fetchLopHocList();
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
      
      console.log("Modified giangVienInfo:", gvData);
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

  const fetchDanhSachSinhVien = async (maLop) => {
    if (!maLop) return;
    
    try {
      setLoading(true);
      const response = await UserService.getDanhSachSinhVienLop(maLop);
      setDanhSachSinhVien(response.data);
      setSelectedLopHoc(maLop);
      setLoading(false);
    } catch (error) {
      console.error(`Error fetching danh sách sinh viên of ${maLop}:`, error);
      handleError(`Không thể tải danh sách sinh viên của lớp ${maLop}`);
      setLoading(false);
    }
  };

  const fetchLopHocList = async () => {
    try {
      // Lấy danh sách lớp học từ lịch dạy, sử dụng API không cần tham số tuần
      const response = await UserService.getLichDayGiangVienAll();
      
      // Lọc và tạo danh sách lớp học duy nhất
      const uniqueLopHoc = new Set();
      if (Array.isArray(response.data)) {
        response.data.forEach(tkb => {
          if (tkb.lopHoc) {
            uniqueLopHoc.add(JSON.stringify({
              maLop: tkb.lopHoc.maLop,
              tenLop: tkb.lopHoc.tenLop || tkb.lopHoc.maLop
            }));
          }
        });
      }
      
      const lopList = Array.from(uniqueLopHoc).map(jsonStr => JSON.parse(jsonStr));
      setLopHocList(lopList);
    } catch (error) {
      console.error("Error fetching lớp học list:", error);
      handleError("Không thể tải danh sách lớp học");
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
  };

  const handleSuccess = (successMessage) => {
    setMessage(successMessage);
    setShowToast(true);
  };

  const handleRefresh = () => {
    fetchYeuCauMuonPhong();
    fetchLichSuMuonPhong();
  };

  return (
    <Container fluid className="py-3">
      <div className="tabs-spacer"></div>
      
      {/* Toast notifications */}
      <div className="toast-container position-fixed top-0 end-0 p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          bg="success"
          delay={3000}
          autohide
        >
          <Toast.Header closeButton={true}>
            <strong className="me-auto">Thông báo</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{message}</Toast.Body>
        </Toast>

        <Toast 
          show={errorToast} 
          onClose={() => setErrorToast(false)} 
          bg="danger"
          delay={4000}
          autohide
          className="mt-2"
        >
          <Toast.Header closeButton={true}>
            <strong className="me-auto">Lỗi</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{error}</Toast.Body>
        </Toast>
      </div>

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
                />
              )}
              {thongBaoTab === "form" && (
                <ThongBaoForm 
                  isGiangVien={true}
                  onSendSuccess={handleSuccess}
                  onError={handleError}
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