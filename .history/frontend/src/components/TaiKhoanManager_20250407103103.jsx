import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Form, Modal, Alert, Badge } from "react-bootstrap";
import axios from "axios";
import authHeader from "../services/auth-header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faLock, faUnlock, faUserPlus, faSearch } from "@fortawesome/free-solid-svg-icons";

const API_URL = "http://localhost:8080/api/quanly";

const TaiKhoanManager = (props) => {
  const [taiKhoanList, setTaiKhoanList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTaiKhoan, setCurrentTaiKhoan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    hoTen: "",
    email: "",
    lienHe: "",
    gioiTinh: "Nam",
    vaiTro: "ROLE_SV",
    chuyenNganh: "",
  });

  // Lấy danh sách tài khoản khi component được render
  useEffect(() => {
    fetchTaiKhoanList();
  }, []);

  // Lấy danh sách tài khoản từ API
  const fetchTaiKhoanList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/taikhoan`, { headers: authHeader() });
      setTaiKhoanList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài khoản:", error);
      setMessage("Không thể lấy danh sách tài khoản. Vui lòng thử lại sau.");
      setMessageType("danger");
      setLoading(false);
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

  // Hiển thị modal thêm tài khoản mới
  const handleShowAddModal = () => {
    setFormData({
      userId: "",
      password: "",
      hoTen: "",
      email: "",
      lienHe: "",
      gioiTinh: "Nam",
      vaiTro: "ROLE_SV",
      chuyenNganh: "",
    });
    setShowAddModal(true);
  };

  // Thêm tài khoản mới
  const handleAddTaiKhoan = async () => {
    if (!formData.userId || !formData.password || !formData.hoTen || !formData.email || !formData.vaiTro) {
      setMessage("Vui lòng điền đầy đủ thông tin bắt buộc.");
      setMessageType("danger");
      return;
    }
    console.log("formData", formData);
    try {
      const response = await axios.post(
        `${API_URL}/taikhoan`,
        formData,
        { headers: authHeader() }
      );
      setShowAddModal(false);
      setMessage("Tài khoản đã được tạo thành công!");
      setMessageType("success");
      fetchTaiKhoanList();
      
      // Gọi callback khi tài khoản được tạo thành công
      if (props.onTaiKhoanAdded) {
        props.onTaiKhoanAdded(formData.vaiTro);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Đã có lỗi xảy ra khi tạo tài khoản.");
      setMessageType("danger");
    }
  };

  // Hiển thị modal sửa tài khoản
  const handleShowEditModal = (taiKhoan) => {
    setCurrentTaiKhoan(taiKhoan);
    setFormData({
      userId: taiKhoan.id,
      password: "",
      hoTen: taiKhoan.hoTen,
      email: taiKhoan.email,
      lienHe: taiKhoan.lienHe || "",
      gioiTinh: taiKhoan.gioiTinh,
      vaiTro: taiKhoan.vaiTro,
      chuyenNganh: taiKhoan.chuyenNganh || "",
    });
    setShowEditModal(true);
  };

  // Cập nhật tài khoản
  const handleUpdateTaiKhoan = async () => {
    if (!formData.hoTen || !formData.email) {
      setMessage("Vui lòng điền đầy đủ thông tin bắt buộc.");
      setMessageType("danger");
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/taikhoan/${currentTaiKhoan.id}`,
        formData,
        { headers: authHeader() }
      );
      setShowEditModal(false);
      setMessage("Cập nhật tài khoản thành công!");
      setMessageType("success");
      fetchTaiKhoanList();
      
      // Gọi callback khi tài khoản được cập nhật thành công
      if (props.onTaiKhoanAdded) {
        props.onTaiKhoanAdded(formData.vaiTro);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Đã có lỗi xảy ra khi cập nhật tài khoản.");
      setMessageType("danger");
    }
  };

  // Khóa/Mở khóa tài khoản
  const handleToggleTaiKhoanStatus = async (taiKhoan) => {
    const newStatus = taiKhoan.trangThai === "HoatDong" ? "Khoa" : "HoatDong";
    try {
      await axios.put(
        `${API_URL}/taikhoan/${taiKhoan.id}/trangthai`,
        { trangThai: newStatus },
        { headers: authHeader() }
      );
      setMessage(newStatus === "HoatDong" ? "Tài khoản đã được kích hoạt!" : "Tài khoản đã bị khóa!");
      setMessageType("success");
      fetchTaiKhoanList();
    } catch (error) {
      setMessage(error.response?.data?.message || "Đã có lỗi xảy ra khi thay đổi trạng thái tài khoản.");
      setMessageType("danger");
    }
  };

  // Hiển thị vai trò người dùng
  const renderVaiTro = (vaiTro) => {
    switch (vaiTro) {
      case "ROLE_SV":
        return <Badge bg="primary">Sinh viên</Badge>;
      case "ROLE_GV":
        return <Badge bg="success">Giảng viên</Badge>;
      case "ROLE_QL":
        return <Badge bg="danger">Quản lý</Badge>;
      default:
        return <Badge bg="secondary">{vaiTro}</Badge>;
    }
  };

  // Hiển thị trạng thái tài khoản
  const renderTrangThai = (trangThai) => {
    if (trangThai === "HoatDong") {
      return <Badge bg="success">Hoạt động</Badge>;
    } else {
      return <Badge bg="danger">Khóa</Badge>;
    }
  };

  // Lọc danh sách tài khoản theo từ khóa tìm kiếm
  const filteredTaiKhoan = taiKhoanList.filter(tk =>
    tk.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tk.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tk.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Container fluid>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Quản lý tài khoản</h5>
          <Button variant="success" onClick={handleShowAddModal}>
            <FontAwesomeIcon icon={faUserPlus} /> Thêm tài khoản
          </Button>
        </Card.Header>
        <Card.Body>
          {message && (
            <Alert variant={messageType} onClose={() => setMessage("")} dismissible>
              {message}
            </Alert>
          )}
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-0">
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faSearch} />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm theo tên, email, ID..."
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
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Liên hệ</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
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
                ) : filteredTaiKhoan.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Không có tài khoản nào
                    </td>
                  </tr>
                ) : (
                  filteredTaiKhoan.map((taiKhoan) => (
                    <tr key={taiKhoan.id}>
                      <td>{taiKhoan.id}</td>
                      <td>{taiKhoan.hoTen}</td>
                      <td>{taiKhoan.email}</td>
                      <td>{taiKhoan.lienHe || "N/A"}</td>
                      <td>{renderVaiTro(taiKhoan.vaiTro)}</td>
                      <td>{renderTrangThai(taiKhoan.trangThai)}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleShowEditModal(taiKhoan)}>
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button 
                          variant={taiKhoan.trangThai === "HoatDong" ? "outline-warning" : "outline-success"} 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleToggleTaiKhoanStatus(taiKhoan)}
                        >
                          <FontAwesomeIcon icon={taiKhoan.trangThai === "HoatDong" ? faLock : faUnlock} />
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

      {/* Modal Thêm tài khoản */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thêm tài khoản mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên đăng nhập <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
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
                  <Form.Label>Vai trò <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="vaiTro"
                    value={formData.vaiTro}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="SV">Sinh viên</option>
                    <option value="GV">Giảng viên</option>
                    <option value="QL">Quản lý</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
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

            {formData.vaiTro === "ROLE_GV" && (
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chuyên ngành</Form.Label>
                    <Form.Control
                      type="text"
                      name="chuyenNganh"
                      value={formData.chuyenNganh}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddTaiKhoan}>
            Thêm tài khoản
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Sửa tài khoản */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Sửa tài khoản {currentTaiKhoan?.hoTen}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên đăng nhập</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.userId}
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Để trống nếu không thay đổi"
                  />
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
                  <Form.Label>Vai trò</Form.Label>
                  <Form.Select
                    disabled
                    value={formData.vaiTro}
                  >
                    <option value="SV">Sinh viên</option>
                    <option value="GV">Giảng viên</option>
                    <option value="QL">Quản lý</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giới tính</Form.Label>
                  <Form.Select
                    name="gioiTinh"
                    value={formData.gioiTinh}
                    onChange={handleInputChange}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nu">Nữ</option>
                    <option value="KhongXacDinh">Không xác định</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {formData.vaiTro === "ROLE_GV" && (
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chuyên ngành</Form.Label>
                    <Form.Control
                      type="text"
                      name="chuyenNganh"
                      value={formData.chuyenNganh}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleUpdateTaiKhoan}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TaiKhoanManager; 