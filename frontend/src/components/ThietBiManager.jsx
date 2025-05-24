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
  faEdit,
  faTrash,
  faPlus,
  faSearch,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const API_URL = "http://localhost:8080/api/quanly";

const ThietBiManager = () => {
  const [thietBiList, setThietBiList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentThietBi, setCurrentThietBi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    tenThietBi: "",
    moTa: "",
    trangThai: true,
  });

  // Lấy danh sách thiết bị khi component được render
  useEffect(() => {
    fetchThietBiList();
  }, []);

  // Lấy danh sách thiết bị từ API
  const fetchThietBiList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/thietbi`, {
        headers: authHeader(),
      });
      setThietBiList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thiết bị:", error);
      toast.error("Không thể lấy danh sách thiết bị. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Xử lý thay đổi trên form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Hiển thị modal thêm thiết bị
  const handleShowAddModal = () => {
    setFormData({
      tenThietBi: "",
      moTa: "",
      trangThai: true,
    });
    setShowAddModal(true);
  };

  // Thêm thiết bị mới
  const handleAddThietBi = async () => {
    if (!formData.tenThietBi) {
      toast.error("Vui lòng nhập tên thiết bị.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/thietbi`, formData, {
        headers: authHeader(),
      });
      setShowAddModal(false);
      toast.success("Thiết bị đã được thêm thành công!");
      fetchThietBiList();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Đã có lỗi xảy ra khi thêm thiết bị."
      );
    }
  };

  // Hiển thị modal sửa thiết bị
  const handleShowEditModal = (thietBi) => {
    setCurrentThietBi(thietBi);
    setFormData({
      tenThietBi: thietBi.tenThietBi,
      moTa: thietBi.moTa || "",
      trangThai: thietBi.trangThai,
    });
    setShowEditModal(true);
  };

  // Cập nhật thiết bị
  const handleUpdateThietBi = async () => {
    if (!formData.tenThietBi) {
      toast.error("Vui lòng nhập tên thiết bị.");
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/thietbi/${currentThietBi.maThietBi}`,
        formData,
        { headers: authHeader() }
      );
      setShowEditModal(false);
      toast.success("Cập nhật thiết bị thành công!");
      fetchThietBiList();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Đã có lỗi xảy ra khi cập nhật thiết bị."
      );
    }
  };

  // Hiển thị modal xác nhận xóa
  const handleShowDeleteModal = (thietBi) => {
    setCurrentThietBi(thietBi);
    setShowDeleteModal(true);
  };

  // Xóa thiết bị
  const handleDeleteThietBi = async () => {
    try {
      await axios.delete(`${API_URL}/thietbi/${currentThietBi.maThietBi}`, {
        headers: authHeader(),
      });
      setShowDeleteModal(false);
      toast.success("Thiết bị đã được xóa thành công!");
      fetchThietBiList();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Đã có lỗi xảy ra khi xóa thiết bị."
      );
    }
  };

  // Lọc danh sách thiết bị theo từ khóa tìm kiếm
  const filteredThietBi = thietBiList.filter(
    (tb) =>
      tb.tenThietBi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tb.moTa && tb.moTa.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Container>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Quản lý thiết bị</h5>
          <Button variant="outline-light" onClick={handleShowAddModal}>
            <FontAwesomeIcon icon={faPlus} /> Thêm thiết bị
          </Button>
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
                    placeholder="Tìm kiếm theo tên, mô tả thiết bị..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          <div className="table-scrollable">
            <Table className="align-middle thietbi-table">
              <thead>
                <tr>
                  <th>Mã thiết bị</th>
                  <th>Tên thiết bị</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredThietBi.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      Không có thiết bị nào
                    </td>
                  </tr>
                ) : (
                  filteredThietBi.map((thietBi) => (
                    <tr key={thietBi.maThietBi}>
                      <td>{thietBi.maThietBi}</td>
                      <td>{thietBi.tenThietBi}</td>
                      <td>{thietBi.moTa || "N/A"}</td>
                      <td>
                        {thietBi.trangThai ? (
                          <Badge bg="success">
                            <FontAwesomeIcon icon={faCheckCircle} /> Hoạt động
                          </Badge>
                        ) : (
                          <Badge bg="danger">
                            <FontAwesomeIcon icon={faTimesCircle} /> Hỏng
                          </Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleShowEditModal(thietBi)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleShowDeleteModal(thietBi)}
                        >
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

      {/* Modal Thêm thiết bị */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm thiết bị mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Tên thiết bị <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="tenThietBi"
                value={formData.tenThietBi}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="moTa"
                value={formData.moTa}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Thiết bị đang hoạt động tốt"
                name="trangThai"
                checked={formData.trangThai}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddThietBi}>
            Thêm thiết bị
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Sửa thiết bị */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Sửa thiết bị</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Tên thiết bị <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="tenThietBi"
                value={formData.tenThietBi}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="moTa"
                value={formData.moTa}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Thiết bị đang hoạt động tốt"
                name="trangThai"
                checked={formData.trangThai}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleUpdateThietBi}>
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Xác nhận xóa */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bạn có chắc chắn muốn xóa thiết bị "
            <strong>{currentThietBi?.tenThietBi}</strong>"?
          </p>
          <p className="text-danger">
            Lưu ý: Việc này sẽ xóa thiết bị khỏi tất cả các phòng đang sử dụng
            nó. Hành động này không thể hoàn tác.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteThietBi}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ThietBiManager; 