import React, { useState, useEffect } from "react";
import { Row, Col, Card, Table, Form, Button, Modal, Alert, Badge } from "react-bootstrap";
import { format } from 'date-fns';
import UserService from "../services/user.service";

const PhanCongMuonPhongManager = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Danh sách dữ liệu
  const [danhSachPhanCongCuaCanBo, setDanhSachPhanCongCuaCanBo] = useState([]);
  const [danhSachPhanCongChoSinhVien, setDanhSachPhanCongChoSinhVien] = useState([]);
  const [danhSachSinhVien, setDanhSachSinhVien] = useState([]);
  const [danhSachThoiKhoaBieu, setDanhSachThoiKhoaBieu] = useState([]);
  
  // Form và modal states
  const [showFormPhanCong, setShowFormPhanCong] = useState(false);
  const [showConfirmHuy, setShowConfirmHuy] = useState(false);
  const [selectedPhanCong, setSelectedPhanCong] = useState(null);
  const [formData, setFormData] = useState({
    maSVNguoiDuocPhanCong: "",
    maTKB: "",
    ghiChu: ""
  });
  
  // Kiểm tra vai trò cán bộ
  const [isCanBo, setIsCanBo] = useState(false);
  
  useEffect(() => {
    loadData();
    checkCanBoRole();
  }, []);
  
  const checkCanBoRole = async () => {
    try {
      const response = await UserService.getUserProfile();
      if (response.data && response.data.sinhVien && response.data.sinhVien.vaiTro === "CANBO") {
        setIsCanBo(true);
      }
    } catch (error) {
      console.error("Error checking role:", error);
    }
  };
  
  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Lấy danh sách phân công cho sinh viên
      const phanCongChoSVResponse = await UserService.layDanhSachPhanCongChoSinhVien();
      setDanhSachPhanCongChoSinhVien(phanCongChoSVResponse.data);
      
      // Kiểm tra và lấy danh sách phân công của cán bộ nếu là cán bộ
      if (isCanBo) {
        const phanCongCanBoResponse = await UserService.layDanhSachPhanCongCuaCanBo();
        setDanhSachPhanCongCuaCanBo(phanCongCanBoResponse.data);
      }
      
      // Lấy danh sách sinh viên và thời khóa biểu (giả định có API tương ứng)
      const sinhVienResponse = await UserService.getListSinhVien();
      setDanhSachSinhVien(sinhVienResponse.data);
      
      const tkbResponse = await UserService.getListThoiKhoaBieu();
      setDanhSachThoiKhoaBieu(tkbResponse.data);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Lỗi khi tải dữ liệu: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmitPhanCong = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await UserService.taoPhanCong(
        formData.maSVNguoiDuocPhanCong,
        formData.maTKB,
        formData.ghiChu
      );
      
      setSuccess("Phân công mượn phòng thành công");
      setShowFormPhanCong(false);
      // Reset form
      setFormData({
        maSVNguoiDuocPhanCong: "",
        maTKB: "",
        ghiChu: ""
      });
      
      // Reload data
      loadData();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setError("Lỗi khi phân công: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const confirmHuyPhanCong = (phanCong) => {
    setSelectedPhanCong(phanCong);
    setShowConfirmHuy(true);
  };
  
  const handleHuyPhanCong = async () => {
    if (!selectedPhanCong) return;
    
    setLoading(true);
    setError("");
    
    try {
      await UserService.huyPhanCong(selectedPhanCong.maPhanCong);
      setSuccess("Đã hủy phân công thành công");
      setShowConfirmHuy(false);
      
      // Reload data
      loadData();
    } catch (error) {
      console.error("Error canceling assignment:", error);
      setError("Lỗi khi hủy phân công: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleCapNhatTrangThai = async (maPhanCong, trangThai) => {
    setLoading(true);
    setError("");
    
    try {
      await UserService.capNhatTrangThaiPhanCong(maPhanCong, trangThai);
      setSuccess("Đã cập nhật trạng thái phân công thành công");
      
      // Reload data
      loadData();
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Lỗi khi cập nhật trạng thái: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };
  
  // Lấy thông tin thời khóa biểu
  const getThoiKhoaBieuInfo = (maTKB) => {
    const tkb = danhSachThoiKhoaBieu.find(t => t.maTKB === maTKB);
    if (!tkb) return { tenMonHoc: "N/A", maPhong: "N/A", thoiGianBatDau: null, thoiGianKetThuc: null };
    
    return {
      tenMonHoc: tkb.monHoc.tenMon,
      maPhong: tkb.phong.maPhong,
      thoiGianBatDau: tkb.thoiGianBatDau,
      thoiGianKetThuc: tkb.thoiGianKetThuc
    };
  };
  
  // Format trạng thái
  const renderTrangThai = (trangThai) => {
    switch (trangThai) {
      case "CHOMUON":
        return <Badge bg="warning">Chờ mượn</Badge>;
      case "DAMUON":
        return <Badge bg="success">Đã mượn</Badge>;
      case "HUY":
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">{trangThai}</Badge>;
    }
  };
  
  return (
    <div className="container mt-4">
      <h2>Quản Lý Phân Công Mượn Phòng</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      {isCanBo && (
        <Card className="mb-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h4>Phân Công Của Tôi</h4>
              <Button 
                variant="primary" 
                onClick={() => setShowFormPhanCong(true)}
              >
                Tạo Phân Công Mới
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center">Đang tải...</div>
            ) : danhSachPhanCongCuaCanBo.length === 0 ? (
              <div className="text-center">Chưa có phân công nào</div>
            ) : (
              <Table responsive striped bordered hover>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Sinh Viên Được Phân Công</th>
                    <th>Mã TKB</th>
                    <th>Môn Học</th>
                    <th>Phòng</th>
                    <th>Thời Gian</th>
                    <th>Trạng Thái</th>
                    <th>Ghi Chú</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {danhSachPhanCongCuaCanBo.map((phanCong, index) => {
                    const tkbInfo = getThoiKhoaBieuInfo(phanCong.maTKB);
                    return (
                      <tr key={phanCong.maPhanCong}>
                        <td>{index + 1}</td>
                        <td>{phanCong.tenNguoiDuocPhanCong} ({phanCong.maSVNguoiDuocPhanCong})</td>
                        <td>{phanCong.maTKB}</td>
                        <td>{tkbInfo.tenMonHoc}</td>
                        <td>{tkbInfo.maPhong}</td>
                        <td>
                          {formatDate(tkbInfo.thoiGianBatDau)} - {formatDate(tkbInfo.thoiGianKetThuc)}
                        </td>
                        <td>{renderTrangThai(phanCong.trangThai)}</td>
                        <td>{phanCong.ghiChu}</td>
                        <td>
                          {phanCong.trangThai === "CHOMUON" && (
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => confirmHuyPhanCong(phanCong)}
                            >
                              Hủy
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}
      
      <Card>
        <Card.Header>
          <h4>Phân Công Cho Tôi</h4>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center">Đang tải...</div>
          ) : danhSachPhanCongChoSinhVien.length === 0 ? (
            <div className="text-center">Chưa có phân công nào</div>
          ) : (
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Người Phân Công</th>
                  <th>Mã TKB</th>
                  <th>Môn Học</th>
                  <th>Phòng</th>
                  <th>Thời Gian</th>
                  <th>Trạng Thái</th>
                  <th>Ghi Chú</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {danhSachPhanCongChoSinhVien.map((phanCong, index) => {
                  const tkbInfo = getThoiKhoaBieuInfo(phanCong.maTKB);
                  return (
                    <tr key={phanCong.maPhanCong}>
                      <td>{index + 1}</td>
                      <td>{phanCong.tenNguoiPhanCong} ({phanCong.maSVNguoiPhanCong})</td>
                      <td>{phanCong.maTKB}</td>
                      <td>{tkbInfo.tenMonHoc}</td>
                      <td>{tkbInfo.maPhong}</td>
                      <td>
                        {formatDate(tkbInfo.thoiGianBatDau)} - {formatDate(tkbInfo.thoiGianKetThuc)}
                      </td>
                      <td>{renderTrangThai(phanCong.trangThai)}</td>
                      <td>{phanCong.ghiChu}</td>
                      <td>
                        {phanCong.trangThai === "CHOMUON" && (
                          <Button 
                            variant="success" 
                            size="sm" 
                            onClick={() => handleCapNhatTrangThai(phanCong.maPhanCong, "DAMUON")}
                          >
                            Xác Nhận Mượn
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal Form Phân Công */}
      <Modal show={showFormPhanCong} onHide={() => setShowFormPhanCong(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tạo Phân Công Mượn Phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitPhanCong}>
            <Form.Group className="mb-3">
              <Form.Label>Sinh Viên Được Phân Công</Form.Label>
              <Form.Select 
                name="maSVNguoiDuocPhanCong"
                value={formData.maSVNguoiDuocPhanCong}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Chọn Sinh Viên --</option>
                {danhSachSinhVien.map(sv => (
                  <option key={sv.maSV} value={sv.maSV}>
                    {sv.nguoiDung.hoTen} ({sv.maSV})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Thời Khóa Biểu</Form.Label>
              <Form.Select 
                name="maTKB"
                value={formData.maTKB}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Chọn Thời Khóa Biểu --</option>
                {danhSachThoiKhoaBieu.map(tkb => {
                  const tkbLabel = `${tkb.monHoc.tenMon} - Phòng ${tkb.phong.maPhong} - ${formatDate(tkb.thoiGianBatDau)}`;
                  return (
                    <option key={tkb.maTKB} value={tkb.maTKB}>
                      {tkbLabel}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Ghi Chú</Form.Label>
              <Form.Control
                as="textarea"
                name="ghiChu"
                value={formData.ghiChu}
                onChange={handleInputChange}
                rows={3}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowFormPhanCong(false)}>
                Hủy
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Đang Xử Lý..." : "Tạo Phân Công"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Modal Xác Nhận Hủy */}
      <Modal show={showConfirmHuy} onHide={() => setShowConfirmHuy(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác Nhận Hủy Phân Công</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn hủy phân công này?</p>
          {selectedPhanCong && (
            <div>
              <p><strong>Sinh viên:</strong> {selectedPhanCong.tenNguoiDuocPhanCong}</p>
              <p><strong>Mã TKB:</strong> {selectedPhanCong.maTKB}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmHuy(false)}>
            Không
          </Button>
          <Button variant="danger" onClick={handleHuyPhanCong} disabled={loading}>
            {loading ? "Đang Xử Lý..." : "Xác Nhận Hủy"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PhanCongMuonPhongManager; 