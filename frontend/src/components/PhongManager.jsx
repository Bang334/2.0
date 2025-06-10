import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Modal,
  Badge,
  ProgressBar,
  Dropdown,
  Tabs,
  Tab,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import authHeader from "../services/auth-header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faCircleInfo,
  faTools,
  faCheck,
  faTimes,
  faClockRotateLeft,
  faPlus,
  faSearch,
  faChartBar,
  faFilter,
  faLaptop,
  faTv,
  faDesktop,
} from "@fortawesome/free-solid-svg-icons";
import PhongThietBiManager from "./PhongThietBiManager";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ADMIN_API_URL = "http://localhost:8080/api/quanly";

const PhongManager = () => {
  const [phongList, setPhongList] = useState([]);
  const [phongStats, setPhongStats] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [currentPhong, setCurrentPhong] = useState(null);
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [thietBiList, setThietBiList] = useState([]);
  const [selectedThietBi, setSelectedThietBi] = useState("");
  const [roomsWithDevice, setRoomsWithDevice] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [formData, setFormData] = useState({
    maPhong: "",
    loaiPhong: "HOC",
    trangThai: "TRONG",
    sucChua: 0,
    viTri: "",
  });
  const [filter, setFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState('all');
  const [validationErrors, setValidationErrors] = useState({
    maPhong: false,
    sucChua: false,
    viTri: false
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Lấy danh sách phòng học khi component được render
  useEffect(() => {
    fetchPhongList();
    fetchThietBiList();
  }, []);

  // Lấy danh sách phòng học từ API
  const fetchPhongList = async () => {
    setLoading(true);
    try {
      console.log("Fetching rooms from API endpoint with auth...");
      // Use the admin endpoint with authentication
      const response = await axios.get(`${ADMIN_API_URL}/phong`, {
        headers: authHeader()
      });
      
      console.log("API Response:", response);
      
      // Handle the data
      const data = response.data;
      console.log("Room count:", Array.isArray(data) ? data.length : 0);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log("First room:", data[0]);
        setPhongList(data);
      } else {
        console.warn("No rooms found or response is not an array");
        setPhongList([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng học:", error);
      toast.error("Không thể lấy danh sách phòng học. Vui lòng thử lại sau.", {
        containerId: "phongManagerToast"
      });
      setPhongList([]); // Set empty array on error
      setLoading(false);
    }
  };

  // Lấy thống kê phòng học từ API
  const fetchPhongStats = async () => {
    setStatsLoading(true);
    try {
      const response = await axios.get(`${ADMIN_API_URL}/phong/thongke`, {
        headers: authHeader(),
      });
      setPhongStats(response.data);
      setStatsLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê phòng học:", error);
      setStatsLoading(false);
    }
  };

  // Lấy danh sách thiết bị từ API
  const fetchThietBiList = async () => {
    try {
      const response = await axios.get(`${ADMIN_API_URL}/thietbi`, {
        headers: authHeader(),
      });
      setThietBiList(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thiết bị:", error);
    }
  };

  // Tìm kiếm phòng học theo thiết bị
  const searchRoomsByDevice = async (maThietBi) => {
    if (!maThietBi) {
      setRoomsWithDevice([]);
      return;
    }

    setLoadingDevices(true);
    try {
      const response = await axios.get(`${ADMIN_API_URL}/phong-thietbi/thietbi/${maThietBi}`, {
        headers: authHeader(),
      });
      
      // Ensure response.data is handled as an array
      const deviceData = Array.isArray(response.data) ? response.data : [];
      console.log("Found rooms with device:", deviceData.length, "rooms");
      
      setRoomsWithDevice(deviceData);
      setLoadingDevices(false);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm phòng học theo thiết bị:", error);
      setRoomsWithDevice([]);
      setLoadingDevices(false);
    }
  };

  // Xử lý thay đổi thiết bị tìm kiếm
  const handleDeviceChange = (e) => {
    const maThietBi = e.target.value;
    setSelectedThietBi(maThietBi);
    searchRoomsByDevice(maThietBi);
  };

  // Hiển thị modal quản lý thiết bị của phòng
  const handleShowDeviceModal = (phong) => {
    setCurrentPhong(phong);
    setShowDeviceModal(true);
  };

  // Xử lý thay đổi trên form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validate dữ liệu khi người dùng nhập
    if (name === 'maPhong') {
      const isValid = value.trim() !== '';
      setValidationErrors(prev => ({
        ...prev,
        maPhong: !isValid
      }));
    } else if (name === 'sucChua') {
      const isValid = value !== '' && !isNaN(parseInt(value, 10)) && parseInt(value, 10) > 0;
      setValidationErrors(prev => ({
        ...prev,
        sucChua: !isValid
      }));
    } else if (name === 'viTri') {
      const isValid = value.trim() !== '';
      setValidationErrors(prev => ({
        ...prev,
        viTri: !isValid
      }));
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Sửa lại hàm kiểm tra vị trí trùng lặp
  const checkViTriTrungLap = (viTri, maPhongHienTai = null) => {
    return phongList.some(phong => 
      phong.viTri === viTri && 
      (maPhongHienTai ? phong.maPhong !== maPhongHienTai : true)
    );
  };

  // Hiển thị modal thêm phòng học mới
  const handleShowAddModal = () => {
    setFormData({
      maPhong: "",
      loaiPhong: "HOC",
      trangThai: "TRONG",
      sucChua: "",
      viTri: "",
    });
    setShowAddModal(true);
  };

  // Cập nhật hàm handleAddPhong
  const handleAddPhong = async () => {
    // Reset messages
    setErrorMessage('');
    setSuccessMessage('');

    // Kiểm tra validation
    const errors = {
      maPhong: !formData.maPhong.trim(),
      sucChua: !formData.sucChua || isNaN(parseInt(formData.sucChua, 10)) || parseInt(formData.sucChua, 10) <= 0,
      viTri: !formData.viTri.trim()
    };

    setValidationErrors(errors);

    // Nếu có lỗi validation, hiển thị thông báo và dừng
    if (Object.values(errors).some(error => error)) {
      setErrorMessage("Vui lòng điền đầy đủ và chính xác thông tin bắt buộc.");
      return;
    }

    // Kiểm tra vị trí trùng lặp (không cần bỏ qua phòng nào vì đang thêm mới)
    if (checkViTriTrungLap(formData.viTri)) {
      setErrorMessage("Vị trí này đã được sử dụng cho một phòng học khác. Vui lòng chọn vị trí khác.");
      return;
    }

    try {
      const requestData = {
        ...formData,
        sucChua: parseInt(formData.sucChua, 10),
      };

      const response = await axios.post(`${ADMIN_API_URL}/phong`, requestData, {
        headers: authHeader(),
      });
      
      // Hiển thị thông báo thành công trước khi đóng modal
      setSuccessMessage("Phòng học đã được tạo thành công!");
      
      // Đóng modal sau 1.5 giây để người dùng thấy thông báo
      setTimeout(() => {
        setShowAddModal(false);
        setSuccessMessage('');
        fetchPhongList();
      }, 1500);

    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Đã có lỗi xảy ra khi tạo phòng học.");
    }
  };

  // Hiển thị modal sửa phòng học
  const handleShowEditModal = (phong) => {
    setCurrentPhong(phong);
    setFormData({
      maPhong: phong.maPhong,
      loaiPhong: phong.loaiPhong,
      trangThai: phong.trangThai,
      sucChua: phong.sucChua || "",
      viTri: phong.viTri,
    });
    setShowEditModal(true);
  };
  // Cập nhật phòng học
  const handleUpdatePhong = async () => {
    // Reset messages
    setErrorMessage('');
    setSuccessMessage('');

    // Kiểm tra validation
    const errors = {
      sucChua: !formData.sucChua || isNaN(parseInt(formData.sucChua, 10)) || parseInt(formData.sucChua, 10) <= 0,
      viTri: !formData.viTri.trim()
    };

    setValidationErrors(errors);

    // Nếu có lỗi validation, hiển thị thông báo và dừng
    if (Object.values(errors).some(error => error)) {
      setErrorMessage("Vui lòng điền đầy đủ và chính xác thông tin bắt buộc.");
      return;
    }

    // Kiểm tra vị trí trùng lặp (bỏ qua phòng hiện tại)
    if (checkViTriTrungLap(formData.viTri, currentPhong.maPhong)) {
      setErrorMessage("Vị trí này đã được sử dụng cho một phòng học khác. Vui lòng chọn vị trí khác.");
      return;
    }

    try {
      const requestData = {
        ...formData,
        sucChua: parseInt(formData.sucChua, 10),
      };

      await axios.put(
        `${ADMIN_API_URL}/phong/${currentPhong.maPhong}`,
        requestData,
        { headers: authHeader() }
      );

      // Hiển thị thông báo thành công trước khi đóng modal
      setSuccessMessage("Cập nhật phòng học thành công!");
      
      // Đóng modal sau 1.5 giây để người dùng thấy thông báo
      setTimeout(() => {
        setShowEditModal(false);
        setSuccessMessage('');
        fetchPhongList();
      }, 1500);

    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Đã có lỗi xảy ra khi cập nhật phòng học.");
    }
  };

  // Hiển thị modal xác nhận xóa
  const handleShowDeleteConfirm = (phong) => {
    setCurrentPhong(phong);
    setShowConfirmModal(true);
  };

  // Xóa phòng học
  const handleDeletePhong = async (maPhong) => {
    try {
      await axios.delete(`${ADMIN_API_URL}/phong/${maPhong}`, {
        headers: authHeader(),
      });
      setShowConfirmModal(false);
      toast.success("Phòng học đã được xóa thành công!", {
        containerId: "phongManagerToast"
      });
      fetchPhongList();
    } catch (error) {
      if (error.response?.status === 409) {
        toast.warning("Không thể xóa phòng học này vì đang có phân công mượn phòng.", {
          containerId: "phongManagerToast"
        });
      } else {
        toast.error(error.response?.data?.message || "Đã có lỗi xảy ra khi xóa phòng học.", {
          containerId: "phongManagerToast"
        });
      }
      setShowConfirmModal(false);
    }
  };

  // Thay đổi trạng thái phòng học
  const handleChangePhongStatus = async (phong, newStatus) => {
    // Kiểm tra trạng thái hợp lệ - chỉ cho phép chuyển từ TRONG sang BAOTRI hoặc từ BAOTRI sang TRONG
    if (newStatus === "BAOTRI" && phong.trangThai !== "TRONG") {
      toast.warning(
        "Chỉ có thể đánh dấu bảo trì cho phòng đang ở trạng thái trống."
      );
      return;
    }

    try {
      await axios.put(
        `${ADMIN_API_URL}/phong/${phong.maPhong}/trangthai`,
        { trangThai: newStatus },
        { headers: authHeader() }
      );
      toast.success(
        `Trạng thái phòng học đã được cập nhật thành ${renderTrangThaiText(
          newStatus
        )}`
      );
      fetchPhongList();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Đã có lỗi xảy ra khi thay đổi trạng thái phòng học."
      );
    }
  };

  // Hiển thị loại phòng
  const renderLoaiPhong = (loaiPhong) => {
    // Handle undefined or null values
    if (!loaiPhong) return <Badge bg="secondary">Không xác định</Badge>;
    
    switch (loaiPhong) {
      case "HOC":
        return <Badge bg="primary">Phòng học</Badge>;
      case "THUCHANH":
        return <Badge bg="info">Phòng thực hành</Badge>;
      default:
        return <Badge bg="secondary">{loaiPhong}</Badge>;
    }
  };

  // Hiển thị trạng thái phòng
  const renderTrangThai = (trangThai) => {
    // Handle null or undefined values
    if (!trangThai) return <Badge bg="secondary">Không xác định</Badge>;
    
    // Normalize the trangThai value to uppercase for consistent comparison
    const status = trangThai.toUpperCase();
    
    switch (status) {
      case "TRONG":
        return <Badge bg="success">Trống</Badge>;
      case "DANGSUDUNG":
        return <Badge bg="warning">Đang sử dụng</Badge>;
      case "BAOTRI":
        return <Badge bg="danger">Bảo trì</Badge>;
      default:
        return <Badge bg="secondary">{trangThai}</Badge>;
    }
  };

  // Hiển thị trạng thái phòng dạng text
  const renderTrangThaiText = (trangThai) => {
    switch (trangThai) {
      case "TRONG":
        return "Trống";
      case "DANGSUDUNG":
        return "Đang sử dụng";
      case "BAOTRI":
        return "Bảo trì";
      default:
        return trangThai;
    }
  };

  // Lọc danh sách phòng học theo từ khóa tìm kiếm
  const filteredPhong = phongList.filter((p) => {
    // Kiểm tra nếu p là null hoặc undefined
    if (!p) return false;
    
    // Handle lowercase or camelCase property names 
    const maPhong = p.maPhong || p.maphong || '';
    const viTri = p.viTri || p.vitri || '';
    const trangThai = p.trangThai || p.trangthai || '';
    const loaiPhong = p.loaiPhong || p.loaiphong || '';
    
    const matchesSearch =
      maPhong.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viTri.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "ALL") {
      return matchesSearch;
    } else if (filter === "TRONG" || filter === "BAOTRI" || filter === "DANGSUDUNG") {
      return matchesSearch && trangThai.toUpperCase() === filter;
    } else if (filter === "HOC" || filter === "THUCHANH") {
      return matchesSearch && loaiPhong.toUpperCase() === filter;
    }
    return matchesSearch; // Ensure a value is always returned
  });
  
  console.log("Filtered rooms:", filteredPhong.length, "rooms");
  
  // Phòng học theo thiết bị được chọn
  const roomsByDevice = Array.isArray(roomsWithDevice) ? 
    roomsWithDevice.map(item => item.maphong || item.maPhong) : [];
  
  console.log("Rooms with device:", roomsByDevice.length, "rooms", roomsByDevice);

  // Tính toán thống kê phòng học
  const calculateRoomStats = () => {
    const total = phongList.length;

    // Thống kê theo trạng thái
    const countByStatus = {
      TRONG: phongList.filter((p) => p.trangThai === "TRONG").length,
      DANGSUDUNG: phongList.filter((p) => p.trangThai === "DANGSUDUNG").length,
      BAOTRI: phongList.filter((p) => p.trangThai === "BAOTRI").length,
    };

    // Thống kê theo loại phòng
    const countByType = {
      HOC: phongList.filter((p) => p.loaiPhong === "HOC").length,
      THUCHANH: phongList.filter((p) => p.loaiPhong === "THUCHANH").length,
    };

    // Tính tỷ lệ phần trăm
    const percentByStatus = {
      TRONG: total ? Math.round((countByStatus.TRONG / total) * 100) : 0,
      DANGSUDUNG: total
        ? Math.round((countByStatus.DANGSUDUNG / total) * 100)
        : 0,
      BAOTRI: total ? Math.round((countByStatus.BAOTRI / total) * 100) : 0,
    };

    // Tính tỷ lệ sử dụng
    const utilizationRate = total
      ? Math.round((countByStatus.DANGSUDUNG / total) * 100)
      : 0;

    // Tổng sức chứa
    const totalCapacity = phongList.reduce((sum, p) => sum + p.sucChua, 0);

    // Tính sức chứa trung bình
    const avgCapacity = total ? Math.round(totalCapacity / total) : 0;

    return {
      total,
      countByStatus,
      countByType,
      percentByStatus,
      utilizationRate,
      totalCapacity,
      avgCapacity,
    };
  };

  // Hiển thị modal thống kê
  const handleShowStatsModal = () => {
    fetchPhongStats();
    setShowStatsModal(true);
  };

  return (
    <Container>
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
        theme="light"
        containerId="phongManagerToast"
      />

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Quản lý phòng học</h5>
          <div>
            <Button
              variant="outline-light"
              className="me-2"
              onClick={handleShowAddModal}
            >
              <FontAwesomeIcon icon={faPlus} /> Thêm phòng học
            </Button>
            <Button
              variant="outline-light"
              onClick={handleShowStatsModal}
              id="phong-stats-btn"
            >
              <FontAwesomeIcon icon={faChartBar} /> Báo cáo thống kê
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Tabs
            id="room-tabs"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="all" title="Tất cả phòng">
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-0">
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faSearch} />
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Tìm kiếm theo mã phòng, vị trí..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex justify-content-end">
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="light"
                      style={{ borderColor: "#DEE2E6", color: "black" }}
                      id="dropdown-basic"
                    >
                      <FontAwesomeIcon icon={faFilter} /> Lọc theo:{" "}
                      {filter === "ALL"
                        ? "Tất cả"
                        : filter === "TRONG"
                        ? "Trống"
                        : filter === "BAOTRI"
                        ? "Bảo trì"
                        : filter === "DANGSUDUNG"
                        ? "Đang sử dụng"
                        : filter === "HOC"
                        ? "Phòng học"
                        : "Phòng thực hành"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        active={filter === "ALL"}
                        onClick={() => setFilter("ALL")}
                      >
                        Tất cả
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={filter === "TRONG"}
                        onClick={() => setFilter("TRONG")}
                      >
                        Trống
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={filter === "BAOTRI"}
                        onClick={() => setFilter("BAOTRI")}
                      >
                        Bảo trì
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={filter === "DANGSUDUNG"}
                        onClick={() => setFilter("DANGSUDUNG")}
                      >
                        Đang sử dụng
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={filter === "HOC"}
                        onClick={() => setFilter("HOC")}
                      >
                        Phòng học
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={filter === "THUCHANH"}
                        onClick={() => setFilter("THUCHANH")}
                      >
                        Phòng thực hành
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Row>
            </Tab>
            
            <Tab eventKey="devices" title="Tìm theo thiết bị">
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Chọn thiết bị cần tìm</Form.Label>
                    <Form.Select
                      value={selectedThietBi}
                      onChange={handleDeviceChange}
                    >
                      <option value="">-- Chọn thiết bị --</option>
                      {thietBiList.map(thietBi => (
                        <option key={thietBi.maThietBi} value={thietBi.maThietBi}>
                          {thietBi.tenThietBi}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              {selectedThietBi && (
                <Alert variant="info" className="mb-3">
                  {loadingDevices ? (
                    <div className="text-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Đang tìm kiếm phòng...
                    </div>
                  ) : roomsByDevice.length > 0 ? (
                    <>Đã tìm thấy {roomsByDevice.length} phòng có thiết bị này.</>
                  ) : (
                    <>Không tìm thấy phòng nào có thiết bị này.</>
                  )}
                </Alert>
              )}
            </Tab>
          </Tabs>

          <div className="table-scrollable">
            <Table hover className="align-middle phong-table">
              <thead>
                <tr>
                  <th>Mã phòng</th>
                  <th>Loại phòng</th>
                  <th>Sức chứa</th>
                  <th>Vị trí</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading || loadingDevices ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : activeTab === 'devices' && selectedThietBi ? (
                  roomsByDevice.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Không tìm thấy phòng học nào có thiết bị này
                      </td>
                    </tr>
                  ) : (
                    phongList
                      .filter(phong => roomsByDevice.includes(phong.maPhong || phong.maphong))
                      .map((phong) => {
                        // Handle lowercase or camelCase property names
                        const maPhong = phong.maPhong || phong.maphong || '';
                        const loaiPhong = phong.loaiPhong || phong.loaiphong || '';
                        const sucChua = phong.sucChua || phong.succhua || 0;
                        const viTri = phong.viTri || phong.vitri || '';
                        const trangThai = phong.trangThai || phong.trangthai || '';
                        
                        return (
                          <tr key={maPhong}>
                            <td>{maPhong}</td>
                            <td>{renderLoaiPhong(loaiPhong)}</td>
                            <td>{sucChua}</td>
                            <td>{viTri}</td>
                            <td>{renderTrangThai(trangThai)}</td>
                            <td>
                              <div className="d-flex gap-2 justify-content-center">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  title="Quản lý thiết bị của phòng"
                                  onClick={() => handleShowDeviceModal(phong)}
                                >
                                  <FontAwesomeIcon icon={faLaptop} />
                                </Button>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  title="Chỉnh sửa"
                                  onClick={() => handleShowEditModal(phong)}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                {trangThai.toUpperCase() === "TRONG" && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() =>
                                      handleChangePhongStatus(phong, "BAOTRI")
                                    }
                                    title="Đánh dấu là bảo trì"
                                  >
                                    <FontAwesomeIcon icon={faTools} />
                                  </Button>
                                )}
                                {trangThai.toUpperCase() === "BAOTRI" && (
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() =>
                                      handleChangePhongStatus(phong, "TRONG")
                                    }
                                    title="Đánh dấu là trống"
                                  >
                                    <FontAwesomeIcon icon={faCheck} />
                                  </Button>
                                )}
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  title="Xóa"
                                  onClick={() => handleShowDeleteConfirm(phong)}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  )
                ) : filteredPhong.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Không có phòng học nào
                    </td>
                  </tr>
                ) : (
                  filteredPhong.map((phong) => {
                    // Handle property name case variations
                    const maPhong = phong.maPhong || phong.maphong || '';
                    const loaiPhong = phong.loaiPhong || phong.loaiphong || '';
                    const sucChua = phong.sucChua || phong.succhua || 0;
                    const viTri = phong.viTri || phong.vitri || '';
                    const trangThai = phong.trangThai || phong.trangthai || '';
                    
                    return (
                      <tr key={maPhong}>
                        <td>{maPhong}</td>
                        <td>{renderLoaiPhong(loaiPhong)}</td>
                        <td>{sucChua}</td>
                        <td>{viTri}</td>
                        <td>{renderTrangThai(trangThai)}</td>
                        <td>
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              title="Quản lý thiết bị của phòng"
                              onClick={() => handleShowDeviceModal(phong)}
                            >
                              <FontAwesomeIcon icon={faLaptop} />
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              title="Chỉnh sửa"
                              onClick={() => handleShowEditModal(phong)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Button>
                            {trangThai.toUpperCase() === "TRONG" && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  handleChangePhongStatus(phong, "BAOTRI")
                                }
                                title="Đánh dấu là bảo trì"
                              >
                                <FontAwesomeIcon icon={faTools} />
                              </Button>
                            )}
                            {trangThai.toUpperCase() === "BAOTRI" && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() =>
                                  handleChangePhongStatus(phong, "TRONG")
                                }
                                title="Đánh dấu là trống"
                              >
                                <FontAwesomeIcon icon={faCheck} />
                              </Button>
                            )}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              title="Xóa"
                              onClick={() => handleShowDeleteConfirm(phong)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal Thêm phòng học */}
      <Modal
        show={showAddModal}
        onHide={() => {
          setShowAddModal(false);
          setErrorMessage('');
          setSuccessMessage('');
        }}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm phòng học mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && (
            <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
              {successMessage}
            </Alert>
          )}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Mã phòng <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="maPhong"
                value={formData.maPhong}
                onChange={handleInputChange}
                isInvalid={validationErrors.maPhong}
                required
              />
              {validationErrors.maPhong && (
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập mã phòng
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Loại phòng <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="loaiPhong"
                value={formData.loaiPhong}
                onChange={handleInputChange}
                required
              >
                <option value="HOC">Phòng học</option>
                <option value="THUCHANH">Phòng thực hành</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Sức chứa <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                name="sucChua"
                value={formData.sucChua}
                onChange={handleInputChange}
                min="1"
                step="1"
                isInvalid={validationErrors.sucChua}
                required
              />
              {validationErrors.sucChua && (
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập số lượng người hợp lệ (lớn hơn 0)
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Vị trí <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="viTri"
                value={formData.viTri}
                onChange={handleInputChange}
                placeholder="Ví dụ: Tầng 2, Tòa A"
                isInvalid={validationErrors.viTri}
                required
              />
              {validationErrors.viTri && (
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập vị trí phòng
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowAddModal(false);
            setErrorMessage('');
            setSuccessMessage('');
          }}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddPhong}>
            Thêm phòng học
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Sửa phòng học */}
      <Modal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setErrorMessage('');
          setSuccessMessage('');
        }}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Sửa phòng học {currentPhong?.maPhong}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && (
            <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
              {successMessage}
            </Alert>
          )}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Mã phòng</Form.Label>
              <Form.Control type="text" value={formData.maPhong} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Loại phòng <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="loaiPhong"
                value={formData.loaiPhong}
                onChange={handleInputChange}
                required
              >
                <option value="HOC">Phòng học</option>
                <option value="THUCHANH">Phòng thực hành</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Trạng thái <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="trangThai"
                value={formData.trangThai}
                onChange={handleInputChange}
                required
              >
                <option value="TRONG">Trống</option>
                <option value="DANGSUDUNG">Đang sử dụng</option>
                <option value="BAOTRI">Bảo trì</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Sức chứa <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                name="sucChua"
                value={formData.sucChua}
                onChange={handleInputChange}
                min="0"
                step="1"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Vị trí <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="viTri"
                value={formData.viTri}
                onChange={handleInputChange}
                placeholder="Ví dụ: Tầng 2, Tòa A"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowEditModal(false);
            setErrorMessage('');
            setSuccessMessage('');
          }}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleUpdatePhong}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Xác nhận xóa */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bạn có chắc chắn muốn xóa phòng học{" "}
            <strong>{currentPhong?.maPhong}</strong>?
          </p>
          <p className="text-danger">
            Lưu ý: Hành động này không thể hoàn tác.
          </p>
          {currentPhong?.trangThai === "DANGSUDUNG" && (
            <p className="text-warning">
              <strong>Cảnh báo:</strong> Phòng học này đang được sử dụng. Bạn
              không thể xóa phòng học đang được sử dụng.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeletePhong(currentPhong.maPhong)}
            disabled={currentPhong?.trangThai === "DANGSUDUNG"}
          >
            Xóa phòng học
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Thống kê phòng học */}
      <Modal
        show={showStatsModal}
        onHide={() => setShowStatsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Báo cáo & Thống kê phòng học</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading || statsLoading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <Row className="mb-4">
                <Col md={4} className="text-center">
                  <Card className="h-100">
                    <Card.Body>
                      <h2 className="display-4">
                        {calculateRoomStats().total}
                      </h2>
                      <p className="text-muted">Tổng số phòng</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4} className="text-center">
                  <Card className="h-100">
                    <Card.Body>
                      <h2 className="display-4">
                        {calculateRoomStats().totalCapacity}
                      </h2>
                      <p className="text-muted">Tổng sức chứa</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4} className="text-center">
                  <Card className="h-100">
                    <Card.Body>
                      <h2 className="display-4">
                        {calculateRoomStats().avgCapacity}
                      </h2>
                      <p className="text-muted">Sức chứa trung bình</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <h5 className="mb-3">Thống kê theo trạng thái</h5>
              <Table bordered className="mb-4">
                <thead>
                  <tr>
                    <th>Trạng thái</th>
                    <th>Số lượng</th>
                    <th>Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{renderTrangThai("TRONG")} Trống</td>
                    <td>{calculateRoomStats().countByStatus.TRONG}</td>
                    <td>
                      <ProgressBar
                        now={calculateRoomStats().percentByStatus.TRONG}
                        label={`${calculateRoomStats().percentByStatus.TRONG}%`}
                        variant="success"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>{renderTrangThai("DANGSUDUNG")} Đang sử dụng</td>
                    <td>{calculateRoomStats().countByStatus.DANGSUDUNG}</td>
                    <td>
                      <ProgressBar
                        now={calculateRoomStats().percentByStatus.DANGSUDUNG}
                        label={`${
                          calculateRoomStats().percentByStatus.DANGSUDUNG
                        }%`}
                        variant="warning"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>{renderTrangThai("BAOTRI")} Bảo trì</td>
                    <td>{calculateRoomStats().countByStatus.BAOTRI}</td>
                    <td>
                      <ProgressBar
                        now={calculateRoomStats().percentByStatus.BAOTRI}
                        label={`${
                          calculateRoomStats().percentByStatus.BAOTRI
                        }%`}
                        variant="danger"
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>

              <h5 className="mb-3">Thống kê theo loại phòng</h5>
              <Table bordered className="mb-4">
                <thead>
                  <tr>
                    <th>Loại phòng</th>
                    <th>Số lượng</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{renderLoaiPhong("HOC")} Phòng học</td>
                    <td>{calculateRoomStats().countByType.HOC}</td>
                  </tr>
                  <tr>
                    <td>{renderLoaiPhong("THUCHANH")} Phòng thực hành</td>
                    <td>{calculateRoomStats().countByType.THUCHANH}</td>
                  </tr>
                </tbody>
              </Table>

              <h5 className="mb-3">Tỷ lệ sử dụng phòng học</h5>
              <Card className="mb-4">
                <Card.Body>
                  <h4 className="text-center">
                    {calculateRoomStats().utilizationRate}%
                  </h4>
                  <ProgressBar
                    now={calculateRoomStats().utilizationRate}
                    variant={
                      calculateRoomStats().utilizationRate < 30
                        ? "success"
                        : calculateRoomStats().utilizationRate < 70
                        ? "warning"
                        : "danger"
                    }
                    style={{ height: "30px" }}
                  />
                  <div className="text-muted mt-2 text-center">
                    {calculateRoomStats().utilizationRate < 30
                      ? "Tỷ lệ sử dụng thấp"
                      : calculateRoomStats().utilizationRate < 70
                      ? "Tỷ lệ sử dụng trung bình"
                      : "Tỷ lệ sử dụng cao"}
                  </div>
                </Card.Body>
              </Card>

              <h5 className="mb-3">Thống kê tần suất mượn phòng</h5>
              <div className="table-scrollable">
                <Table striped bordered hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Mã phòng</th>
                      <th>Vị trí</th>
                      <th>Loại phòng</th>
                      <th>Tổng số lần mượn</th>
                      <th>Đã duyệt</th>
                      <th>Từ chối</th>
                      <th>Đang xử lý</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phongStats.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">
                          Không có dữ liệu thống kê
                        </td>
                      </tr>
                    ) : (
                      phongStats.map((stats) => (
                        <tr key={stats.maPhong}>
                          <td>{stats.maPhong}</td>
                          <td>{stats.viTri}</td>
                          <td>{renderLoaiPhong(stats.loaiPhong)}</td>
                          <td className="text-center">
                            <strong>{stats.totalBookings}</strong>
                          </td>
                          <td className="text-center">
                            <Badge bg="success" pill>
                              {stats.approvedBookings}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <Badge bg="danger" pill>
                              {stats.rejectedBookings}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <Badge bg="warning" pill>
                              {stats.pendingBookings}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatsModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Quản lý thiết bị của phòng */}
      <Modal
        show={showDeviceModal}
        onHide={() => setShowDeviceModal(false)}
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Quản lý thiết bị phòng {currentPhong?.maPhong}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentPhong && (
            <PhongThietBiManager 
              maPhong={currentPhong.maPhong} 
              tenPhong={currentPhong.tenPhong}
              onUpdate={() => fetchPhongList()} 
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeviceModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PhongManager;
