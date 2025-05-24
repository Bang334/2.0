import React, { useState, useEffect, useRef } from "react";
import UserService from "../services/user.service";
import { Container, Nav, Card, Tabs, Tab } from "react-bootstrap";
import { toast } from "react-toastify";
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
  const thongBaoListRef = useRef(null);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all required data in parallel
      const [sinhVienRes, phongRes, yeuCauRes, thongBaoRes, thongBaoGuiRes] = await Promise.all([
        UserService.getThongTinSinhVien(),
        UserService.getDanhSachPhong(),
        UserService.getYeuCauMuonPhong(),
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
      toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Handle notifications
  const handleSendSuccess = (message) => {
    toast.success(message);
    refreshThongBao();
    setActiveTab("thongbao");
    if (thongBaoListRef.current) {
      thongBaoListRef.current.switchToSentTab();
    }
  };

  const handleSuccess = (message) => {
    toast.success(message);
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
      toast.error("Không thể tải lại thông báo: " + (error.response?.data?.message || error.message));
    }
  };

  const refreshLichSuMuon = async () => {
    setLoading(true);
    try {
      const yeuCauRes = await UserService.getYeuCauMuonPhong();
      setYeuCauMuonPhong(yeuCauRes.data);
      const lichSuDaTraRes = await UserService.getLichSuMuonPhongDaTraAPI();
      setLichSuMuonPhong(lichSuDaTraRes.data);
    } catch (error) {
      console.error("Error refreshing room data:", error);
      if (activeTab === "muonphong") {
        toast.error("Không thể cập nhật dữ liệu. Vui lòng tải lại trang.");
      }
    } finally {
      setLoading(false);
    }
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
                  onError={toast.error}
                  onRefresh={refreshThongBao}
                />
              )}
              {thongBaoTab === "form" && (
                <ThongBaoForm 
                  isGiangVien={false}
                  onSendSuccess={handleSuccess}
                  onError={toast.error}
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
            onError={toast.error}
            onSuccess={handleSuccess}
            onRefresh={refreshLichSuMuon}
          />
        )}
      </div>
    </Container>
  );
};

export default SinhVienBoard;