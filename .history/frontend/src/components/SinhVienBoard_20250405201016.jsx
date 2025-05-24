import React, { useState, useEffect, useRef } from "react";
import UserService from "../services/user.service";
import { Container, Nav, Alert, Toast, Card, Tabs, Tab } from "react-bootstrap";
import ThoiKhoaBieu from "./ThoiKhoaBieu";
import UserInfoDisplay from "./UserInfoDisplay";
import ThongBaoList from "./ThongBaoList";
import ThongBaoForm from "./ThongBaoForm";
import MuonPhongManager from "./MuonPhongManager";
import "../css/ThongBaoList.css";
import "../css/Toast.css";

const SinhVienBoard = ({ currentUser }) => {
  // State declarations
  const [thongTinSV, setThongTinSV] = useState(null);
  const [danhSachPhong, setDanhSachPhong] = useState([]);
  const [yeuCauMuonPhong, setYeuCauMuonPhong] = useState([]);
  const [lichSuMuonPhong, setLichSuMuonPhong] = useState([]);
  const [thongBao, setThongBao] = useState([]);
  const [thongBaoDaGui, setThongBaoDaGui] = useState([]);
  const [activeTab, setActiveTab] = useState("thongtin");
  const [thongBaoTab, setThongBaoTab] = useState("list");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorToast, setErrorToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const thongBaoListRef = useRef(null);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);
  
  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (successMessage && showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage, showToast]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all required data in parallel
      const [sinhVienRes, phongRes, yeuCauRes, thongBaoRes, thongBaoGuiRes] = await Promise.all([
        UserService.getThongTinSinhVien(),
        UserService.getDanhSachPhong(),
        UserService.getLichSuMuonPhong(),
        UserService.getThongBaoNhan(),
        UserService.getThongBaoDaGui()
      ]);
      
      // Also fetch the history of returned rooms
      const lichSuDaTraRes = await UserService.getLichSuMuonPhongDaTraAPI();
      
      // Update state with fetched data
      setThongTinSV(sinhVienRes.data);
      setDanhSachPhong(phongRes.data);
      setYeuCauMuonPhong(yeuCauRes.data);
      setLichSuMuonPhong(lichSuDaTraRes.data);
      setThongBao(thongBaoRes.data);
      setThongBaoDaGui(thongBaoGuiRes.data);
      console.log("Loaded YeuCauMuonPhong:", yeuCauRes.data);
      console.log("Loaded lichSuMuonPhong:", lichSuDaTraRes.data);
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      handleError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Handle notifications
  const handleSendSuccess = (message) => {
    setSuccessMessage(message);
    setShowToast(true);
    refreshThongBao();
    setActiveTab("thongbao");
    if (thongBaoListRef.current) {
      thongBaoListRef.current.switchToSentTab();
    }
  };

  const handleSuccess = (message) => {
    setSuccessMessage(message);
    setShowToast(true);
  };

  const refreshThongBao = async () => {
    try {
      const [thongBaoRes, thongBaoDaGuiRes] = await Promise.all([
        UserService.getThongBaoNhan(),
        UserService.getThongBaoDaGui()
      ]);
      
      setThongBao(thongBaoRes.data);
      setThongBaoDaGui(thongBaoDaGuiRes.data);
      
      // Cập nhật ThongBaoList thông qua ref
      if (thongBaoListRef.current) {
        thongBaoListRef.current.refreshList();
      }
    } catch (error) {
      handleError("Không thể tải lại thông báo: " + (error.response?.data?.message || error.message));
    }
  };

  const refreshLichSuMuon = async () => {
    try {
      const yeuCauRes = await UserService.getLichSuMuonPhong();
      setYeuCauMuonPhong(yeuCauRes.data);
      
      // Also refresh the history data
      const lichSuDaTraRes = await UserService.getLichSuMuonPhongDaTraAPI();
      setLichSuMuonPhong(lichSuDaTraRes.data);
      console.log("Refreshed lichSuMuonPhong:", lichSuDaTraRes.data);
    } catch (error) {
      handleError("Không thể cập nhật lịch sử mượn phòng");
    }
  };

  const handleError = (message) => {
    setError(message);
    setErrorToast(true);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

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
          <Toast.Body className="text-white">{successMessage}</Toast.Body>
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
            <Nav.Link eventKey="lichhoc">Lịch học</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="muonphong">Mượn phòng</Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "thongtin" && thongTinSV && (
          <UserInfoDisplay 
            userInfo={thongTinSV} 
            userType="sinhvien" 
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
                  isGiangVien={false}
                  ref={thongBaoListRef}
                  onError={handleError}
                  onRefresh={refreshThongBao}
                />
              )}
              {thongBaoTab === "form" && (
                <ThongBaoForm 
                  isGiangVien={false}
                  onSendSuccess={handleSuccess}
                  onError={handleError}
                  onSendComplete={() => {
                    setThongBaoTab("list");
                    refreshThongBao();
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
          <ThoiKhoaBieu currentUser={thongTinSV} isGiangVien={false} />
        )}

        {activeTab === "muonphong" && (
          <MuonPhongManager 
            yeuCauMuonPhong={yeuCauMuonPhong}
            lichSuMuonPhong={lichSuMuonPhong}
            danhSachPhong={danhSachPhong}
            onError={handleError}
            onSuccess={handleSuccess}
            onRefresh={refreshLichSuMuon}
          />
        )}
      </div>
    </Container>
  );
};

export default SinhVienBoard;