import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Alert, Spinner } from "react-bootstrap";
import UserService from "../services/user.service";
import { FaPlus, FaTrash, FaCheck, FaTimes, FaEye, FaChartBar } from "react-icons/fa";
import AuthService from "../services/auth.service";
import { toast } from "react-toastify";
import api from "../services/api";

const PhanCongMuonPhongManager = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [danhSachPhanCong, setDanhSachPhanCong] = useState([]);
  const [danhSachPhanCongNhan, setDanhSachPhanCongNhan] = useState([]);
  const [showModalPhanCong, setShowModalPhanCong] = useState(false);
  const [danhSachSinhVien, setDanhSachSinhVien] = useState([]);
  const [danhSachTKB, setDanhSachTKB] = useState([]);
  const [formData, setFormData] = useState({
    maSVNguoiDuocPhanCong: "",
    maTKB: "",
    ghiChu: ""
  });
  const [activeTab, setActiveTab] = useState("phanCong"); // phanCong hoặc nhanPhanCong
  const [loadingTKB, setLoadingTKB] = useState(false);
  const [isCanBo, setIsCanBo] = useState(false);
  const [selectedPhanCong, setSelectedPhanCong] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [studentStats, setStudentStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [phanCongToDelete, setPhanCongToDelete] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [phanCongToReject, setPhanCongToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Khởi tạo đối tượng AuthService
  const authService = new AuthService();
  const user = authService.getCurrentUser();
  const vaiTro = user?.roles && user.roles.includes("ROLE_SV") ? "SV" : "GV";

  useEffect(() => {
    // Check if the user is a Cán Bộ Lớp
    const checkCanBoRole = async () => {
      try {
        if (vaiTro === "SV") {
          const response = await UserService.checkIsCanBoLop();
          const canBoStatus = response.data.isCanBo;
          console.log("Is Cán Bộ Lớp:", canBoStatus);
          setIsCanBo(canBoStatus);
          
          // Fetch all assignments for all students
          fetchAllAssignments(canBoStatus);
        } else {
          fetchAllAssignments(false);
        }
      } catch (error) {
        console.error("Error checking role:", error);
        setIsCanBo(false);
        fetchAllAssignments(false);
      }
    };
    
    checkCanBoRole();
  }, []);

  // Fetch tất cả phân công (cả tạo ra và được nhận)
  const fetchAllAssignments = async (canBoStatus = isCanBo) => {
    setLoading(true);
    try {
      // Lấy tất cả phân công (cho mọi loại sinh viên)
      let allAssignments = [];
      
      try {
        // Sử dụng API mới để lấy tất cả phân công
        const responseAll = await UserService.layTatCaDanhSachPhanCong();
        
        // Xử lý kết quả và đánh dấu người dùng hiện tại
        const currentUser = authService.getCurrentUser();
        const userInfo = await UserService.getThongTinSinhVien();
        const maSVHienTai = userInfo.data.maSV;
        
        allAssignments = responseAll.data.map(item => ({
          ...item,
          isOwner: item.maSVNguoiPhanCong === maSVHienTai, // Là người tạo phân công
          canModify: item.maSVNguoiPhanCong === maSVHienTai, // Có thể xóa nếu là người tạo
          isForMe: item.maSVNguoiDuocPhanCong === maSVHienTai // Là người được phân công
        }));
      } catch (error) {
        console.error("Error fetching all assignments:", error);
        // Nếu API mới gặp lỗi, thử sử dụng cách cũ (lấy riêng từng loại)
        
        // 1. Lấy danh sách phân công của cán bộ (nếu là cán bộ)
        let canBoAssignments = [];
        if (canBoStatus || vaiTro === "GV") {
          try {
            const responseCanBo = await UserService.layDanhSachPhanCongCuaCanBo();
            canBoAssignments = responseCanBo.data.map(item => ({
              ...item,
              isOwner: true, // Đánh dấu là người tạo phân công
              canModify: true // Có thể xóa phân công
            }));
          } catch (error) {
            console.error("Error fetching cán bộ assignments:", error);
          }
        }

        // 2. Lấy danh sách phân công cho sinh viên này (mọi SV đều có)
        let receivedAssignments = [];
        try {
          const responseReceived = await UserService.layDanhSachPhanCongChoSinhVien();
          receivedAssignments = responseReceived.data.map(item => ({
            ...item,
            isOwner: false, // Không phải người tạo phân công
            canModify: item.trangThai === "CHUAXULY", // Chỉ có thể xử lý khi chưa xử lý
            isForMe: true // Đánh dấu là phân công cho mình
          }));
        } catch (error) {
          console.error("Error fetching received assignments:", error);
        }

        // Kết hợp danh sách
        allAssignments = [...canBoAssignments, ...receivedAssignments];
      }

      // Sắp xếp theo thời gian (mới nhất lên đầu)
      allAssignments = allAssignments.sort((a, b) => 
        new Date(b.thoiGianPhanCong) - new Date(a.thoiGianPhanCong)
      );

      setDanhSachPhanCong(allAssignments);
      setError("");
    } catch (error) {
      setError("Không thể tải danh sách phân công: " + (error.response?.data?.message || error.message));
      toast.error("Không thể tải danh sách phân công");
    } finally {
      setLoading(false);
    }
  };

  const openModalPhanCong = async () => {
    setLoading(true);
    try {
      // Đảm bảo có thống kê sinh viên trước khi mở modal
      if (studentStats.length === 0) {
        await loadStudentStatsQuiet();
      }

      // Fetch danh sách sinh viên trong lớp
      console.log("Fetching student list...");
      const response = await UserService.getDanhSachSinhVienLop();
      console.log("Student list response:", response);
      setDanhSachSinhVien(response.data);

      // Fetch danh sách thời khóa biểu
      setLoadingTKB(true);
      console.log("Fetching schedule list...");
      const responseTKB = await UserService.getLichHocChoThoiKhoaBieu();
      console.log("Schedule response:", responseTKB);
      setDanhSachTKB(responseTKB.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error details:", error.response?.data);
      setError("Không thể tải dữ liệu: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setLoadingTKB(false);
      setShowModalPhanCong(true);
    }
  };

  const handleCreatePhanCong = async () => {
    if (!formData.maSVNguoiDuocPhanCong || !formData.maTKB) {
      setError("Vui lòng chọn sinh viên và thời khóa biểu");
      return;
    }

    setLoading(true);
    try {
      await UserService.taoPhanCong(
        formData.maSVNguoiDuocPhanCong,
        formData.maTKB,
        formData.ghiChu
      );
      toast.success("Đã phân công thành công");
      setShowModalPhanCong(false);
      fetchAllAssignments();
      setFormData({
        maSVNguoiDuocPhanCong: "",
        maTKB: "",
        ghiChu: ""
      });
    } catch (error) {
      setError("Không thể tạo phân công: " + (error.response?.data?.message || error.message));
      toast.error("Không thể tạo phân công");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhanCong = (maPhanCong) => {
    // Lưu mã phân công cần xóa và hiển thị modal xác nhận
    setPhanCongToDelete(maPhanCong);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeletePhanCong = async () => {
    if (!phanCongToDelete) return;
    
    setLoading(true);
    try {
      const response = await UserService.huyPhanCong(phanCongToDelete);
      console.log("Response từ API hủy phân công:", response);
      toast.success("Đã hủy phân công thành công");
      
      // Xóa bản ghi khỏi state để cập nhật UI ngay lập tức
      setDanhSachPhanCong(prevList => 
        prevList.filter(item => item.maPhanCong !== phanCongToDelete)
      );
      
      // Sau đó tải lại toàn bộ danh sách từ server để đảm bảo đồng bộ
      setTimeout(() => {
        fetchAllAssignments();
      }, 500);
    } catch (error) {
      console.error("Chi tiết lỗi khi hủy phân công:", error);
      setError("Không thể hủy phân công: " + (error.response?.data?.message || error.message));
      toast.error("Không thể hủy phân công");
    } finally {
      setLoading(false);
      // Đóng modal xác nhận và reset mã phân công cần xóa
      setShowDeleteConfirmModal(false);
      setPhanCongToDelete(null);
    }
  };

  const handleAcceptPhanCong = async (maPhanCong) => {
    setLoading(true);
    try {
      await UserService.capNhatTrangThaiPhanCong(maPhanCong, "DADONGY");
      toast.success("Đã chấp nhận phân công");
      fetchAllAssignments();
    } catch (error) {
      setError("Không thể chấp nhận phân công: " + (error.response?.data?.message || error.message));
      toast.error("Không thể chấp nhận phân công");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPhanCong = (maPhanCong) => {
    // Lưu mã phân công cần từ chối và hiển thị modal từ chối
    setPhanCongToReject(maPhanCong);
    setRejectReason(""); // Reset lý do từ chối
    setShowRejectModal(true);
  };

  const confirmRejectPhanCong = async () => {
    if (!phanCongToReject) return;
    
    setLoading(true);
    try {
      // Gọi API cập nhật trạng thái với lý do
      await UserService.capNhatTrangThaiPhanCong(phanCongToReject, "TUCHOI", rejectReason);
      toast.success("Đã từ chối phân công");
      fetchAllAssignments();
    } catch (error) {
      setError("Không thể từ chối phân công: " + (error.response?.data?.message || error.message));
      toast.error("Không thể từ chối phân công");
    } finally {
      setLoading(false);
      // Đóng modal và reset dữ liệu
      setShowRejectModal(false);
      setPhanCongToReject(null);
      setRejectReason("");
    }
  };

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
  };

  const renderTrangThai = (trangThai) => {
    switch (trangThai) {
      case "CHUAXULY":
        return <Badge className="badge-warning">Chưa xử lý</Badge>;
      case "DADONGY":
        return <Badge className="badge-success">Đã đồng ý</Badge>;
      case "TUCHOI":
        return <Badge className="badge-danger">Từ chối</Badge>;
      default:
        return <Badge>Không xác định</Badge>;
    }
  };

  // Fetch danh sách sinh viên trong lớp
  const fetchDanhSachSinhVien = async () => {
    try {
      const response = await UserService.getDanhSachSinhVienLop();
      setDanhSachSinhVien(response.data);
    } catch (error) {
      console.error("Error fetching danh sách sinh viên:", error);
      setError("Lỗi khi tải danh sách sinh viên: " + (error.response?.data?.message || error.message));
    }
  };

  // Función para cargar detalles completos de una asignación
  const handleViewDetail = async (maPhanCong, isOwn = true) => {
    setLoading(true);
    try {
      // Determina qué lista usar según la pestaña activa
      const phanCong = isOwn 
        ? danhSachPhanCong.find(item => item.maPhanCong === maPhanCong) 
        : danhSachPhanCong.find(item => item.maPhanCong === maPhanCong);
      
      if (!phanCong) {
        toast.error("Không tìm thấy thông tin phân công");
        return;
      }

      console.log("Phân công được chọn:", phanCong);
      console.log("Mã TKB cần tìm:", phanCong.maTKB, "Kiểu dữ liệu:", typeof phanCong.maTKB);

      // Si hay un maTKB, obtén detalles adicionales del horario
      let tkbDetails = null;
      if (phanCong.maTKB) {
        try {
          // Intentamos encontrar detalles de TKB en la lista existente
          tkbDetails = danhSachTKB.find(tkb => {
            // Chuyển đổi sang cùng kiểu dữ liệu để so sánh
            const tkbMa = String(tkb.maTKB);
            const phanCongMa = String(phanCong.maTKB);
            console.log(`So sánh: TKB mã ${tkbMa} (${typeof tkb.maTKB}) với Phân công ${phanCongMa} (${typeof phanCong.maTKB})`);
            return tkbMa === phanCongMa;
          });
          
          // Si no tenemos detalles y aún no hemos cargado la lista de TKB
          if (!tkbDetails && danhSachTKB.length === 0) {
            // Sử dụng getAllLichHoc thay vì getLichHocChoThoiKhoaBieu để lấy tất cả TKB không bị lọc
            const responseTKB = await UserService.getAllLichHoc();
            console.log("Danh sách TKB:", responseTKB.data);
            
            // Debug: in ra mã TKB của mỗi phần tử trong danh sách
            responseTKB.data.forEach((tkb, index) => {
              console.log(`TKB ${index}: maTKB = ${tkb.maTKB} (${typeof tkb.maTKB})`);
            });
            
            setDanhSachTKB(responseTKB.data);
            
            // Tìm kiếm với chuyển đổi kiểu
            tkbDetails = responseTKB.data.find(tkb => String(tkb.maTKB) === String(phanCong.maTKB));
            console.log("TKB details:", tkbDetails);
            
            if (!tkbDetails) {
              console.error(`Không tìm thấy TKB với mã ${phanCong.maTKB} trong danh sách ${responseTKB.data.length} TKB`);
            }
          }
        } catch (error) {
          console.error("Error al cargar detalles del horario:", error);
        }
      }

      // Preparar los datos para el modal
      setDetailData({
        ...phanCong,
        tkbDetails
      });
      
      // Abrir el modal de detalles
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error al cargar detalles:", error);
      toast.error("Không thể tải chi tiết phân công");
    } finally {
      setLoading(false);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailData(null);
  };

  const loadStudentStats = async () => {
    setLoadingStats(true);
    try {
      const [responseSV, responsePC] = await Promise.all([
        UserService.getDanhSachSinhVienLop(),
        UserService.layTatCaDanhSachPhanCong()
      ]);

      setDanhSachSinhVien(responseSV.data);
      
      const userInfo = await UserService.getThongTinSinhVien();
      const maSVHienTai = userInfo.data.maSV;
      
      const processedAssignments = responsePC.data.map(item => ({
        ...item,
        isOwner: item.maSVNguoiPhanCong === maSVHienTai,
        canModify: item.maSVNguoiPhanCong === maSVHienTai,
        isForMe: item.maSVNguoiDuocPhanCong === maSVHienTai
      }));
      
      setDanhSachPhanCong(processedAssignments);

      const assignmentCountMap = new Map();
      
      responseSV.data.forEach(sv => {
        assignmentCountMap.set(sv.maSV, {
          maSV: sv.maSV,
          hoTen: sv.hoTen,
          totalAssignments: 0,
          pendingAssignments: 0,
          acceptedAssignments: 0,
          rejectedAssignments: 0
        });
      });
      
      // Đếm số lần phân công cho mỗi sinh viên
      processedAssignments.forEach(assignment => {
        const maSV = assignment.maSVNguoiDuocPhanCong;
        if (assignmentCountMap.has(maSV)) {
          const stats = assignmentCountMap.get(maSV);
          stats.totalAssignments++;
          
          if (assignment.trangThai === "CHUAXULY") {
            stats.pendingAssignments++;
          } else if (assignment.trangThai === "DADONGY") {
            stats.acceptedAssignments++;
          } else if (assignment.trangThai === "TUCHOI") {
            stats.rejectedAssignments++;
          }
          
          assignmentCountMap.set(maSV, stats);
        }
      });
      
      // Chuyển map thành mảng và sắp xếp
      const statsArray = Array.from(assignmentCountMap.values())
        .sort((a, b) => b.totalAssignments - a.totalAssignments);
      
      // Cập nhật state và hiển thị modal
      setStudentStats(statsArray);
      setShowStatsModal(true);
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Không thể tải thống kê phân công");
    } finally {
      setLoadingStats(false);
    }
  };

  const loadStudentStatsQuiet = async () => {
    try {
      if (danhSachSinhVien.length === 0) {
        await fetchDanhSachSinhVien();
      }

      const allAssignments = [...danhSachPhanCong];
      const assignmentCountMap = new Map();
      danhSachSinhVien.forEach(sv => {
        assignmentCountMap.set(sv.maSV, {
          maSV: sv.maSV,
          hoTen: sv.hoTen,
          totalAssignments: 0,
          pendingAssignments: 0,
          acceptedAssignments: 0,
          rejectedAssignments: 0
        });
      });
      
      allAssignments.forEach(assignment => {
        const maSV = assignment.maSVNguoiDuocPhanCong;
        if (assignmentCountMap.has(maSV)) {
          const stats = assignmentCountMap.get(maSV);
          stats.totalAssignments++;
          
          // Đếm theo trạng thái
          if (assignment.trangThai === "CHUAXULY") {
            stats.pendingAssignments++;
          } else if (assignment.trangThai === "DADONGY") {
            stats.acceptedAssignments++;
          } else if (assignment.trangThai === "TUCHOI") {
            stats.rejectedAssignments++;
          }
          
          assignmentCountMap.set(maSV, stats);
        }
      });
      
      // Chuyển map thành mảng và sắp xếp theo tổng số lần phân công (giảm dần)
      const statsArray = Array.from(assignmentCountMap.values())
        .sort((a, b) => b.totalAssignments - a.totalAssignments);
      
      setStudentStats(statsArray);
    } catch (error) {
      console.error("Error silently loading stats:", error);
      // Không hiển thị lỗi cho người dùng
    }
  };

  useEffect(() => {
    // Cuando cambia la pestaña activa, verifica si es necesario ajustar
    if (isCanBo && activeTab === "nhanPhanCong") {
      // Si el usuario es cán bộ lớp y está en la pestaña "nhanPhanCong", 
      // cambiar automáticamente a "phanCong"
      setActiveTab("phanCong");
    }
  }, [isCanBo, activeTab]);

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Quản lý phân công mượn phòng</h5>
              </div>
              <div className="d-flex">
                {isCanBo && vaiTro === "SV" && (
                  <>
                    <Button
                      variant="success"
                      className="ms-2"
                      onClick={openModalPhanCong}
                      disabled={loading}
                    >
                      <FaPlus className="me-1" /> Tạo phân công
                    </Button>
                    <Button
                      variant="info"
                      className="ms-2"
                      onClick={loadStudentStats}
                      disabled={loadingStats}
                    >
                      <FaChartBar className="me-1" /> Thống kê mượn phòng
                    </Button>
                  </>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              {isCanBo && !loading && (
                <Alert variant="info" className="mb-3">
                  <strong>Chế độ cán bộ lớp:</strong> Bạn có thể tạo phân công mới và quản lý các phân công đã tạo.
                </Alert>
              )}
              
              {!isCanBo && vaiTro === "SV" && !loading && (
                <Alert variant="info" className="mb-3">
                  <strong>Chế độ sinh viên:</strong> Bạn có thể xem tất cả các phân công và chỉ có thể tương tác với các phân công dành cho bạn.
                </Alert>
              )}

              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" />
                </div>
              ) : (
                <div>
                  {!isCanBo && vaiTro === "SV" && (
                    <div className="mb-3">
                      <Form.Check
                        type="checkbox"
                        id="highlight-for-me"
                        label="Chỉ hiển thị phân công dành cho tôi"
                        checked={activeTab === "nhanPhanCong"}
                        onChange={() => setActiveTab(activeTab === "phanCong" ? "nhanPhanCong" : "phanCong")}
                      />
                    </div>
                  )}

                  <div className="assignment-table-container">
                    <Table className="assignment-table">
                    <thead>
                      <tr>
                        <th>Người phân công</th>
                        <th>Người được phân công</th>
                        <th>Thời khóa biểu</th>
                        <th>Thời gian phân công</th>
                        <th>Ghi chú</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {danhSachPhanCong.length > 0 ? (
                        danhSachPhanCong
                          .filter(item => {
                            if (isCanBo) return true;
                            return activeTab === "phanCong" || item.isForMe;
                          })
                          .map((item) => (
                            <tr 
                              key={item.maPhanCong} 
                              className={item.isForMe ? "highlight-row" : ""}
                            >
                              <td>{item.tenNguoiPhanCong || "Không có thông tin"}</td>
                              <td>{item.tenNguoiDuocPhanCong || "Không có thông tin"}</td>
                              <td>
                                {item.maTKB ? `Mã TKB: ${item.maTKB}` : "Không có thông tin"}
                              </td>
                              <td>{formatDate(item.thoiGianPhanCong)}</td>
                              <td>{item.ghiChu || "-"}</td>
                              <td>{renderTrangThai(item.trangThai)}</td>
                              <td>
                                <div className="action-buttons">
                                  <button
                                    className="action-btn view-btn"
                                    onClick={() => handleViewDetail(item.maPhanCong)}
                                    disabled={loading}
                                  >
                                    <FaEye />
                                  </button>
                                  
                                  {/* Solo los cán bộ pueden eliminar asignaciones que hayan creado */}
                                  {item.isOwner && isCanBo && (
                                    <button
                                      className="action-btn delete-btn"
                                      onClick={() => handleDeletePhanCong(item.maPhanCong)}
                                      disabled={loading}
                                    >
                                      <FaTrash />
                                    </button>
                                  )}
                                  
                                  {/* Cualquier estudiante puede interactuar con sus propias asignaciones */}
                                  {item.isForMe && item.trangThai === "CHUAXULY" && (
                                    <>
                                      <button
                                        className="action-btn approve-btn"
                                        onClick={() => handleAcceptPhanCong(item.maPhanCong)}
                                        disabled={loading}
                                      >
                                        <FaCheck />
                                      </button>
                                      <button
                                        className="action-btn delete-btn"
                                        onClick={() => handleRejectPhanCong(item.maPhanCong)}
                                        disabled={loading}
                                      >
                                        <FaTimes />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center">
                            Không có phân công nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                    </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal Phân công */}
      <Modal show={showModalPhanCong} onHide={() => setShowModalPhanCong(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Phân công mượn phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Sinh viên được phân công</Form.Label>
              <Form.Select
                name="maSVNguoiDuocPhanCong"
                value={formData.maSVNguoiDuocPhanCong}
                onChange={handleChangeForm}
                disabled={loading}
              >
                <option value="">-- Chọn sinh viên --</option>
                {danhSachSinhVien.map((sv) => (
                  <option key={sv.maSV} value={sv.maSV}>
                    {sv.hoTen} - {sv.maSV}
                  </option>
                ))}
              </Form.Select>
              {formData.maSVNguoiDuocPhanCong && studentStats.length > 0 && (
                <div className="mt-2">
                  <small className="text-info">
                    {(() => {
                      const stats = studentStats.find(s => s.maSV === formData.maSVNguoiDuocPhanCong);
                      if (stats) {
                        return `Sinh viên này đã được phân công ${stats.totalAssignments} lần (Đã đồng ý: ${stats.acceptedAssignments}, Đang chờ: ${stats.pendingAssignments}, Từ chối: ${stats.rejectedAssignments})`;
                      }
                      return 'Chưa có thông tin về số lần phân công của sinh viên này';
                    })()}
                  </small>
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Thời khóa biểu</Form.Label>
              {loadingTKB ? (
                <div className="text-center">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : (
                <>
                  <Alert variant="info" className="mb-2 py-1">
                    <small>
                      <strong>Lưu ý:</strong> Chỉ hiển thị các thời khóa biểu trong tương lai và chưa được phân công hoặc chưa được chấp nhận bởi sinh viên.
                    </small>
                  </Alert>
                  <Form.Select
                    name="maTKB"
                    value={formData.maTKB}
                    onChange={handleChangeForm}
                    disabled={loading}
                  >
                    <option value="">-- Chọn thời khóa biểu --</option>
                    {danhSachTKB.length > 0 ? (
                      danhSachTKB.map((tkb) => {
                        // Format ngày học thành thứ + ngày
                        const ngayHoc = new Date(tkb.ngayHoc);
                        const thuString = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][ngayHoc.getDay()];
                        const formattedDate = `${thuString}, ${ngayHoc.getDate()}/${ngayHoc.getMonth() + 1}/${ngayHoc.getFullYear()}`;
                        
                        return (
                          <option key={tkb.maTKB} value={tkb.maTKB}>
                            {tkb.monHoc.tenMon} - Phòng {tkb.phong.maPhong} - {formattedDate} - Tiết {tkb.tietBatDau}-{tkb.tietKetThuc}
                          </option>
                        );
                      })
                    ) : (
                      <option disabled value="">Không tìm thấy thời khóa biểu khả dụng</option>
                    )}
                  </Form.Select>
                  {danhSachTKB.length === 0 && !loadingTKB && (
                    <Alert variant="warning" className="mt-2 py-1">
                      <small>
                        Hiện không có thời khóa biểu nào khả dụng. Tất cả các thời khóa biểu đã được phân công và chấp nhận bởi sinh viên.
                      </small>
                    </Alert>
                  )}
                </>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="ghiChu"
                value={formData.ghiChu}
                onChange={handleChangeForm}
                placeholder="Nhập ghi chú"
                disabled={loading}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalPhanCong(false)} disabled={loading}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleCreatePhanCong} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Lưu"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Chi tiết phân công */}
      <Modal show={showDetailModal} onHide={closeDetailModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết phân công mượn phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!detailData ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <div>
              <h5 className="mb-3">Thông tin chung</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Mã phân công:</strong> {detailData.maPhanCong}</p>
                  <p><strong>Người phân công:</strong> {detailData.tenNguoiPhanCong || "Không có thông tin"}</p>
                  <p><strong>Người được phân công:</strong> {detailData.tenNguoiDuocPhanCong || "Không có thông tin"}</p>
                  <p><strong>Thời gian phân công:</strong> {formatDate(detailData.thoiGianPhanCong)}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Trạng thái:</strong> {renderTrangThai(detailData.trangThai)}</p>
                  <p><strong>Ghi chú:</strong> {detailData.ghiChu || "Không có ghi chú"}</p>
                </Col>
              </Row>

              <h5 className="mb-3">Thông tin thời khóa biểu</h5>
              {detailData.tkbDetails ? (
                <Row>
                  <Col md={6}>
                    <p><strong>Mã TKB:</strong> {detailData.maTKB}</p>
                    <p><strong>Môn học:</strong> {detailData.tkbDetails.monHoc?.tenMon || "Không có thông tin"}</p>
                    <p><strong>Tiết học:</strong> {detailData.tkbDetails.tietBatDau} - {detailData.tkbDetails.tietKetThuc}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Phòng học:</strong> {detailData.tkbDetails.phong?.maPhong || "Không có thông tin"}</p>
                    <p><strong>Ngày học:</strong> {formatDate(detailData.tkbDetails.ngayHoc)}</p>
                    <p><strong>Tuần:</strong> {detailData.tkbDetails.tuan || "Không có thông tin"}</p>
                  </Col>
                </Row>
              ) : (
                <p className="text-muted">Không tìm thấy thông tin chi tiết về thời khóa biểu</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDetailModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Thống kê mượn phòng của sinh viên */}
      <Modal show={showStatsModal} onHide={() => setShowStatsModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thống kê phân công mượn phòng theo sinh viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingStats ? (
            <div className="text-center py-3">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <p className="text-muted mb-3">
                Bảng thống kê số lần được phân công mượn phòng của mỗi sinh viên trong lớp, giúp cán bộ lớp phân công công bằng.
              </p>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Họ tên</th>
                    <th>Mã sinh viên</th>
                    <th>Tổng số lần</th>
                    <th>Đã đồng ý</th>
                    <th>Đang chờ</th>
                    <th>Đã từ chối</th>
                  </tr>
                </thead>
                <tbody>
                  {studentStats.length > 0 ? (
                    studentStats.map((stats, index) => (
                      <tr key={stats.maSV}>
                        <td>{index + 1}</td>
                        <td>{stats.hoTen}</td>
                        <td>{stats.maSV}</td>
                        <td>
                          <Badge bg={stats.totalAssignments > 0 ? "primary" : "secondary"}>
                            {stats.totalAssignments}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={stats.acceptedAssignments > 0 ? "success" : "secondary"}>
                            {stats.acceptedAssignments}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={stats.pendingAssignments > 0 ? "warning" : "secondary"}>
                            {stats.pendingAssignments}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={stats.rejectedAssignments > 0 ? "danger" : "secondary"}>
                            {stats.rejectedAssignments}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        Không có dữ liệu thống kê
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <Alert variant="info">
                <strong>Gợi ý:</strong> Hãy cân nhắc phân công cho các sinh viên có số lần mượn phòng thấp để đảm bảo sự công bằng.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatsModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Xác nhận xóa phân công */}
      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <FaTrash className="me-2" /> Xác nhận hủy phân công
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {phanCongToDelete && (
            <>
              <p className="mb-1">Bạn có chắc chắn muốn hủy phân công này?</p>
              <hr />
              {danhSachPhanCong.find(item => item.maPhanCong === phanCongToDelete) && (
                <div className="mt-2">
                  <p className="mb-1"><strong>Người được phân công:</strong> {danhSachPhanCong.find(item => item.maPhanCong === phanCongToDelete)?.tenNguoiDuocPhanCong}</p>
                  <p className="mb-1"><strong>Mã thời khóa biểu:</strong> {danhSachPhanCong.find(item => item.maPhanCong === phanCongToDelete)?.maTKB}</p>
                  <p className="text-danger mb-0"><em>Lưu ý: Hành động này không thể hoàn tác!</em></p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDeleteConfirmModal(false)}>
            Hủy bỏ
          </Button>
          <Button variant="danger" onClick={confirmDeletePhanCong} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" /> Đang xử lý...
              </>
            ) : (
              <>
                <FaTrash className="me-1" /> Xác nhận hủy
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Từ chối phân công */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaTimes className="me-2" /> Từ chối phân công
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Lý do từ chối</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối"
                disabled={loading}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button variant="danger" onClick={confirmRejectPhanCong} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" /> Đang xử lý...
              </>
            ) : (
              <>
                <FaTimes className="me-1" /> Xác nhận từ chối
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PhanCongMuonPhongManager; 