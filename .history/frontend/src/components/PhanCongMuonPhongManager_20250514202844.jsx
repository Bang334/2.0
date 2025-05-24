import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Alert, Spinner } from "react-bootstrap";
import UserService from "../services/user.service";
import { FaPlus, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
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

  // Khởi tạo đối tượng AuthService
  const authService = new AuthService();
  const user = authService.getCurrentUser();
  const vaiTro = user?.roles && user.roles.includes("ROLE_SV") ? "SV" : "GV";

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "phanCong") {
        const response = await UserService.layDanhSachPhanCongCuaCanBo();
        setDanhSachPhanCong(response.data);
      } else {
        const response = await UserService.layDanhSachPhanCongChoSinhVien();
        setDanhSachPhanCongNhan(response.data);
      }
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
      setSuccess("Đã phân công thành công");
      toast.success("Đã phân công thành công");
      setShowModalPhanCong(false);
      fetchData();
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

  const handleDeletePhanCong = async (maPhanCong) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy phân công này?")) {
      return;
    }

    setLoading(true);
    try {
      await UserService.huyPhanCong(maPhanCong);
      setSuccess("Đã hủy phân công thành công");
      toast.success("Đã hủy phân công thành công");
      fetchData();
    } catch (error) {
      setError("Không thể hủy phân công: " + (error.response?.data?.message || error.message));
      toast.error("Không thể hủy phân công");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPhanCong = async (maPhanCong) => {
    setLoading(true);
    try {
      await UserService.capNhatTrangThaiPhanCong(maPhanCong, "DADONGY");
      setSuccess("Đã chấp nhận phân công");
      toast.success("Đã chấp nhận phân công");
      fetchData();
    } catch (error) {
      setError("Không thể chấp nhận phân công: " + (error.response?.data?.message || error.message));
      toast.error("Không thể chấp nhận phân công");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPhanCong = async (maPhanCong) => {
    setLoading(true);
    try {
      await UserService.capNhatTrangThaiPhanCong(maPhanCong, "TUCHOI");
      setSuccess("Đã từ chối phân công");
      toast.success("Đã từ chối phân công");
      fetchData();
    } catch (error) {
      setError("Không thể từ chối phân công: " + (error.response?.data?.message || error.message));
      toast.error("Không thể từ chối phân công");
    } finally {
      setLoading(false);
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
    setSuccess("");
  };

  const renderTrangThai = (trangThai) => {
    switch (trangThai) {
      case "CHUAXULY":
        return <Badge bg="warning">Chưa xử lý</Badge>;
      case "DADONGY":
        return <Badge bg="success">Đã đồng ý</Badge>;
      case "TUCHOI":
        return <Badge bg="danger">Từ chối</Badge>;
      default:
        return <Badge bg="secondary">Không xác định</Badge>;
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
                <Button
                  variant={activeTab === "phanCong" ? "primary" : "outline-primary"}
                  className="me-2"
                  onClick={() => handleTabChange("phanCong")}
                >
                  Phân công
                </Button>
                <Button
                  variant={activeTab === "nhanPhanCong" ? "primary" : "outline-primary"}
                  onClick={() => handleTabChange("nhanPhanCong")}
                >
                  Phân công được nhận
                </Button>
                {vaiTro === "SV" && activeTab === "phanCong" && (
                  <Button
                    variant="success"
                    className="ms-3"
                    onClick={openModalPhanCong}
                    disabled={loading}
                  >
                    <FaPlus className="me-1" /> Tạo phân công
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" />
                </div>
              ) : activeTab === "phanCong" ? (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Người được phân công</th>
                      <th>Thời khóa biểu</th>
                      <th>Phòng</th>
                      <th>Thời gian</th>
                      <th>Thời gian phân công</th>
                      <th>Ghi chú</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {danhSachPhanCong.length > 0 ? (
                      danhSachPhanCong.map((item) => (
                        <tr key={item.maPhanCong}>
                          <td>{item.nguoiDuocPhanCong.hoTen}</td>
                          <td>
                            {item.thoiKhoaBieu.monHoc.tenMon} - Tiết {item.thoiKhoaBieu.tietBatDau}-{item.thoiKhoaBieu.tietKetThuc}
                          </td>
                          <td>{item.thoiKhoaBieu.phong.maPhong}</td>
                          <td>{formatDate(item.thoiKhoaBieu.ngayHoc)}</td>
                          <td>{formatDate(item.thoiGianPhanCong)}</td>
                          <td>{item.ghiChu || "-"}</td>
                          <td>{renderTrangThai(item.trangThai)}</td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeletePhanCong(item.maPhanCong)}
                              disabled={loading}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          Không có phân công nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Người phân công</th>
                      <th>Thời khóa biểu</th>
                      <th>Phòng</th>
                      <th>Thời gian</th>
                      <th>Thời gian phân công</th>
                      <th>Ghi chú</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {danhSachPhanCongNhan.length > 0 ? (
                      danhSachPhanCongNhan.map((item) => (
                        <tr key={item.maPhanCong}>
                          <td>{item.nguoiPhanCong.hoTen}</td>
                          <td>
                            {item.thoiKhoaBieu.monHoc.tenMon} - Tiết {item.thoiKhoaBieu.tietBatDau}-{item.thoiKhoaBieu.tietKetThuc}
                          </td>
                          <td>{item.thoiKhoaBieu.phong.maPhong}</td>
                          <td>{formatDate(item.thoiKhoaBieu.ngayHoc)}</td>
                          <td>{formatDate(item.thoiGianPhanCong)}</td>
                          <td>{item.ghiChu || "-"}</td>
                          <td>{renderTrangThai(item.trangThai)}</td>
                          <td>
                            {item.trangThai === "CHUAXULY" && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => handleAcceptPhanCong(item.maPhanCong)}
                                  disabled={loading}
                                >
                                  <FaCheck />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleRejectPhanCong(item.maPhanCong)}
                                  disabled={loading}
                                >
                                  <FaTimes />
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          Không có phân công nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
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
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Thời khóa biểu</Form.Label>
              {loadingTKB ? (
                <div className="text-center">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : (
                <Form.Select
                  name="maTKB"
                  value={formData.maTKB}
                  onChange={handleChangeForm}
                  disabled={loading}
                >
                  <option value="">-- Chọn thời khóa biểu --</option>
                  {danhSachTKB.map((tkb) => (
                    <option key={tkb.maTKB} value={tkb.maTKB}>
                      {tkb.monHoc.tenMon} - {tkb.phong.maPhong} - {formatDate(tkb.ngayHoc)} - Tiết {tkb.tietBatDau}-{tkb.tietKetThuc}
                    </option>
                  ))}
                </Form.Select>
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
    </Container>
  );
};

export default PhanCongMuonPhongManager; 