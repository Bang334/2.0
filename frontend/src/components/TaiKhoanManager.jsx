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
} from "react-bootstrap";
import axios from "axios";
import authHeader from "../services/auth-header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faUnlock,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const API_URL = "http://localhost:8080/api/quanly";

const TaiKhoanManager = (props) => {
  const [taiKhoanList, setTaiKhoanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Lấy danh sách tài khoản khi component được render
  useEffect(() => {
    fetchTaiKhoanList();
  }, []);

  // Lấy danh sách tài khoản từ API
  const fetchTaiKhoanList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/taikhoan`, {
        headers: authHeader(),
      });
      setTaiKhoanList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài khoản:", error);
      toast.error("Không thể lấy danh sách tài khoản. Vui lòng thử lại sau.");
      setLoading(false);
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
      toast.success(
        newStatus === "HoatDong"
          ? "Tài khoản đã được kích hoạt!"
          : "Tài khoản đã bị khóa!"
      );
      fetchTaiKhoanList();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Đã có lỗi xảy ra khi thay đổi trạng thái tài khoản."
      );
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
  const filteredTaiKhoan = taiKhoanList.filter(
    (tk) =>
      tk.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tk.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tk.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Quản lý tài khoản</h5>
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
                    placeholder="Tìm kiếm theo tên, email, ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          <div className="table-scrollable">
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
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
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
                        <Button
                          variant={
                            taiKhoan.trangThai === "HoatDong"
                              ? "outline-warning"
                              : "outline-success"
                          }
                          size="sm"
                          className="me-1"
                          onClick={() => handleToggleTaiKhoanStatus(taiKhoan)}
                        >
                          <FontAwesomeIcon
                            icon={
                              taiKhoan.trangThai === "HoatDong"
                                ? faLock
                                : faUnlock
                            }
                          />
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




    </Container>
  );
};

export default TaiKhoanManager;
