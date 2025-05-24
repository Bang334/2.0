import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge, Tabs, Tab, Alert } from "react-bootstrap";
import axios from "axios";
import authHeader from "../services/auth-header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSearch, faKey, faUsers, faSchool } from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = "http://localhost:8080/api/quanly";

const SinhVienManager = ({ refreshKey }) => {
  const [sinhVienList, setSinhVienList] = useState([]);
  const [lopHocList, setLopHocList] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAddLopModal, setShowAddLopModal] = useState(false);
  const [currentSinhVien, setCurrentSinhVien] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTaiKhoanForm, setShowTaiKhoanForm] = useState(false);
  const [formData, setFormData] = useState({
    maSV: "",
    hoTen: "",
    email: "",
    lienHe: "",
    gioiTinh: "Nam",
    maLop: "",
    userId: "",
    password: ""
  });
  const [lopFormData, setLopFormData] = useState({
    maLop: "",
    tenLop: "",
    khoa: "",
    khoaHoc: ""
  });

  // Lấy danh sách sinh viên khi component được render
  useEffect(() => {
    fetchSinhVienList();
    fetchLopHocList();
  }, []);

  // Lấy danh sách sinh viên khi refreshKey thay đổi
  useEffect(() => {
    if (refreshKey) {
      console.log("SinhVienManager refreshing due to refreshKey change:", refreshKey);
      fetchSinhVienList();
      fetchLopHocList();
    }
  }, [refreshKey]);

  // Lấy danh sách sinh viên từ API
  const fetchSinhVienList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/sinhvien`, { headers: authHeader() });
      setSinhVienList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sinh viên:", error);
      toast.error("Không thể lấy danh sách sinh viên. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Lấy danh sách lớp học từ API
  const fetchLopHocList = async () => {
    try {
      // Kiểm tra xem user đã đăng nhập chưa
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        console.log("Không có token xác thực, bỏ qua việc lấy danh sách lớp học");
        return;
      }
      
      const response = await axios.get(`${API_URL}/lophoc`, { headers: authHeader() });
      setLopHocList(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lớp học:", error);
      // Không hiển thị lỗi 401 (Unauthorized) trên giao diện vì có thể user chưa đăng nhập
      if (error.response && error.response.status !== 401) {
        toast.error("Không thể lấy danh sách lớp học. Vui lòng thử lại sau.");
      }
    }
  };

  // Xử lý thay đổi trên form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Xử lý thay đổi trên form lớp học
  const handleLopInputChange = (e) => {
    const { name, value } = e.target;
    setLopFormData({
      ...lopFormData,
      [name]: value
    });
  };

  // Toggle form tài khoản
  const handleToggleTaiKhoanForm = () => {
    setShowTaiKhoanForm(!showTaiKhoanForm);
    if (!showTaiKhoanForm) {
      // Reset trường tài khoản khi hiển thị form
      setFormData({
        ...formData,
        userId: "",
        password: ""
      });
    }
  };

  // Hiển thị modal thêm lớp học mới
  const handleShowAddLopModal = () => {
    setLopFormData({
      maLop: "",
      tenLop: "",
      khoa: "",
      khoaHoc: ""
    });
    setShowAddLopModal(true);
  };

  // Thêm lớp học mới
  const handleAddLopHoc = async () => {
    if (!lopFormData.maLop || !lopFormData.tenLop) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/lophoc`,
        lopFormData,
        { headers: authHeader() }
      );
      setShowAddLopModal(false);
      toast.success("Lớp học đã được tạo thành công!");
      fetchLopHocList();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra khi tạo lớp học.");
    }
  };

  // Hiển thị modal sửa sinh viên
  const handleShowEditModal = (sinhVien) => {
    setCurrentSinhVien(sinhVien);
    setFormData({
      maSV: sinhVien.maSV,
      hoTen: sinhVien.hoTen,
      email: sinhVien.email,
      lienHe: sinhVien.lienHe || "",
      gioiTinh: sinhVien.gioiTinh,
      maLop: sinhVien.maLop || "",
      password: "" // Password luôn trống khi sửa
    });
    setShowTaiKhoanForm(false);
    setShowEditModal(true);
  };

  // Cập nhật sinh viên
  const handleUpdateSinhVien = async () => {
    if (!formData.hoTen || !formData.email) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    try {
      const requestData = { ...formData };
      
      // Nếu mật khẩu trống, không gửi lên server
      if (!requestData.password) {
        delete requestData.password;
      }
      
      // Không cần gửi userId khi cập nhật
      delete requestData.userId;

      const response = await axios.put(
        `${API_URL}/sinhvien/${currentSinhVien.maSV}`,
        requestData,
        { headers: authHeader() }
      );
      setShowEditModal(false);
      toast.success("Cập nhật sinh viên thành công!");
      fetchSinhVienList();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra khi cập nhật sinh viên.");
    }
  };

  // Hiển thị modal xác nhận xóa
  const handleShowDeleteConfirm = (sinhVien) => {
    setCurrentSinhVien(sinhVien);
    setShowConfirmModal(true);
  };

  // Xóa sinh viên
  const handleDeleteSinhVien = async () => {
    try {
      await axios.delete(
        `${API_URL}/sinhvien/${currentSinhVien.maSV}`,
        { headers: authHeader() }
      );
      setShowConfirmModal(false);
      toast.success("Sinh viên đã được xóa thành công!");
      fetchSinhVienList();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra khi xóa sinh viên.");
      setShowConfirmModal(false);
    }
  };

  // Hiển thị giới tính
  const renderGioiTinh = (gioiTinh) => {
    switch (gioiTinh) {
      case "Nam":
        return "Nam";
      case "Nu":
        return "Nữ";
      case "KhongXacDinh":
        return "Không xác định";
      default:
        return gioiTinh;
    }
  };

  // Lọc danh sách sinh viên theo từ khóa tìm kiếm
  const filteredSinhVien = sinhVienList.filter(sv =>
    (sv.maSV && sv.maSV.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sv.hoTen && sv.hoTen.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sv.email && sv.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sv.tenLop && sv.tenLop.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <Container fluid>
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Quản lý sinh viên</h5>
            <div className="mb-3 d-flex justify-content-end gap-2">
              <Button variant="primary" onClick={handleShowAddLopModal}>
                <FontAwesomeIcon icon={faSchool} /> Thêm lớp học
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-0">
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faSearch} />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm theo mã SV, họ tên, email, lớp..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="table-responsive">
            <Table striped hover className="align-middle">
              <thead>
                <tr>
                  <th>Mã SV</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Liên hệ</th>
                  <th>Giới tính</th>
                  <th>Lớp</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSinhVien.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Không có sinh viên nào
                    </td>
                  </tr>
                ) : (
                  filteredSinhVien.map((sinhVien) => (
                    <tr key={sinhVien.maSV}>
                      <td>{sinhVien.maSV}</td>
                      <td>{sinhVien.hoTen}</td>
                      <td>{sinhVien.email}</td>
                      <td>{sinhVien.lienHe || "N/A"}</td>
                      <td>{renderGioiTinh(sinhVien.gioiTinh)}</td>
                      <td>{sinhVien.tenLop || <Badge bg="warning">Chưa phân lớp</Badge>}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleShowEditModal(sinhVien)}>
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleShowDeleteConfirm(sinhVien)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal Thêm lớp học */}
      <Modal show={showAddLopModal} onHide={() => setShowAddLopModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Tạo lớp học mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Mã lớp <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="maLop"
                value={lopFormData.maLop}
                onChange={handleLopInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tên lớp <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="tenLop"
                value={lopFormData.tenLop}
                onChange={handleLopInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Khoa</Form.Label>
              <Form.Control
                type="text"
                name="khoa"
                value={lopFormData.khoa}
                onChange={handleLopInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Khóa học</Form.Label>
              <Form.Control
                type="text"
                name="khoaHoc"
                value={lopFormData.khoaHoc}
                onChange={handleLopInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddLopModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddLopHoc}>
            Tạo lớp học
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Sửa sinh viên */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Sửa sinh viên {currentSinhVien?.hoTen}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã sinh viên</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.maSV}
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Lớp</Form.Label>
                  <Form.Select
                    name="maLop"
                    value={formData.maLop}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Chọn lớp --</option>
                    {lopHocList.map(lop => (
                      <option key={lop.maLop} value={lop.maLop}>
                        {lop.tenLop} ({lop.maLop})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="hoTen"
                    value={formData.hoTen}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="text"
                    name="lienHe"
                    value={formData.lienHe}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giới tính <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="gioiTinh"
                    value={formData.gioiTinh}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nu">Nữ</option>
                    <option value="KhongXacDinh">Không xác định</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Button variant="link" onClick={handleToggleTaiKhoanForm} className="p-0">
                    <FontAwesomeIcon icon={faKey} className="me-1" />
                    {showTaiKhoanForm ? "Ẩn cập nhật mật khẩu" : "Cập nhật mật khẩu"}
                  </Button>
                </Form.Group>
              </Col>
            </Row>

            {showTaiKhoanForm && (
              <Card className="mb-3 bg-light">
                <Card.Body>
                  <Card.Title className="fs-6">Cập nhật mật khẩu</Card.Title>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Mật khẩu mới <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                        <Form.Text className="text-muted">
                          Để trống nếu không muốn thay đổi mật khẩu.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleUpdateSinhVien}>
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
          <p>Bạn có chắc chắn muốn xóa sinh viên <strong>{currentSinhVien?.hoTen}</strong>?</p>
          <p className="text-danger">Lưu ý: Hành động này không thể hoàn tác và sẽ xóa cả thông tin người dùng và tài khoản.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteSinhVien}>
            Xóa sinh viên
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SinhVienManager; 