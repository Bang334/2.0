import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Modal,
  Badge,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import authHeader from "../services/auth-header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const API_URL = "http://localhost:8080/api/quanly";

const PhongThietBiManager = ({ maPhong, tenPhong, onUpdate }) => {
  const [thietBiList, setThietBiList] = useState([]);
  const [phongThietBiList, setPhongThietBiList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPhongThietBi, setCurrentPhongThietBi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    maPhong: maPhong,
    maThietBi: "",
    soLuong: 1,
    ghiChu: "",
  });

  // Lấy danh sách thiết bị và thiết bị của phòng khi component được render
  useEffect(() => {
    fetchThietBiList();
    fetchPhongThietBiList();
  }, [maPhong]);

  // Lấy danh sách thiết bị từ API
  const fetchThietBiList = async () => {
    try {
      const response = await axios.get(`${API_URL}/thietbi`, {
        headers: authHeader(),
      });
      setThietBiList(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thiết bị:", error);
      toast.error("Không thể lấy danh sách thiết bị. Vui lòng thử lại sau.");
    }
  };

  // Lấy danh sách thiết bị của phòng từ API
  const fetchPhongThietBiList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/phong-thietbi/phong/${maPhong}`, {
        headers: authHeader(),
      });
      setPhongThietBiList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thiết bị của phòng:", error);
      toast.error("Không thể lấy danh sách thiết bị của phòng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Xử lý thay đổi trên form
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseInt(value, 10) : value,
    });
  };

  // Hiển thị modal thêm thiết bị
  const handleShowAddModal = () => {
    setFormData({
      maPhong: maPhong,
      maThietBi: thietBiList.length > 0 ? thietBiList[0].maThietBi : "",
      soLuong: 1,
      ghiChu: "",
    });
    setShowAddModal(true);
  };

  // Thêm thiết bị mới vào phòng
  const handleAddThietBi = async () => {
    if (!formData.maThietBi || !formData.soLuong || formData.soLuong < 1) {
      toast.error("Vui lòng nhập đầy đủ thông tin và số lượng hợp lệ.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/phong-thietbi`, formData, {
        headers: authHeader(),
      });
      setShowAddModal(false);
      toast.success("Thiết bị đã được thêm vào phòng thành công!");
      fetchPhongThietBiList();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Đã có lỗi xảy ra khi thêm thiết bị vào phòng."
      );
    }
  };

  // Hiển thị modal sửa thiết bị
  const handleShowEditModal = (phongThietBi) => {
    setCurrentPhongThietBi(phongThietBi);
    setFormData({
      maPhong: maPhong,
      maThietBi: phongThietBi.maThietBi,
      soLuong: phongThietBi.soLuong,
      ghiChu: phongThietBi.ghiChu || "",
    });
    setShowEditModal(true);
  };

  // Cập nhật thiết bị trong phòng
  const handleUpdateThietBi = async () => {
    if (!formData.soLuong || formData.soLuong < 1) {
      toast.error("Vui lòng nhập số lượng hợp lệ.");
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/phong-thietbi/${currentPhongThietBi.id}`,
        formData,
        { headers: authHeader() }
      );
      setShowEditModal(false);
      toast.success("Cập nhật thiết bị thành công!");
      fetchPhongThietBiList();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Đã có lỗi xảy ra khi cập nhật thiết bị."
      );
    }
  };

  // Hiển thị modal xác nhận xóa
  const handleShowDeleteModal = (phongThietBi) => {
    setCurrentPhongThietBi(phongThietBi);
    setShowDeleteModal(true);
  };

  // Xóa thiết bị khỏi phòng
  const handleDeleteThietBi = async () => {
    try {
      await axios.delete(`${API_URL}/phong-thietbi/${currentPhongThietBi.id}`, {
        headers: authHeader(),
      });
      setShowDeleteModal(false);
      toast.success("Thiết bị đã được xóa khỏi phòng thành công!");
      fetchPhongThietBiList();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Đã có lỗi xảy ra khi xóa thiết bị khỏi phòng."
      );
    }
  };

  // Lấy tên thiết bị từ danh sách thiết bị
  const getThietBiName = (maThietBi) => {
    const thietBi = thietBiList.find((tb) => tb.maThietBi === maThietBi);
    return thietBi ? thietBi.tenThietBi : "N/A";
  };

  return (
    <div>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Quản lý thiết bị của phòng {tenPhong || maPhong}</h5>
          <Button variant="outline-light" onClick={handleShowAddModal}>
            <FontAwesomeIcon icon={faPlus} /> Thêm thiết bị
          </Button>
        </Card.Header>
        <Card.Body>
          {phongThietBiList.length === 0 && !loading ? (
            <Alert variant="info">
              Phòng này chưa có thiết bị nào. Hãy thêm thiết bị vào phòng.
            </Alert>
          ) : (
            <div className="table-scrollable">
              <Table striped hover className="align-middle">
                <thead>
                  <tr>
                    <th style={{ width: "35%" }}>Tên thiết bị</th>
                    <th style={{ width: "15%" }}>Số lượng</th>
                    <th style={{ width: "25%" }}>Trạng thái</th>
                    <th style={{ width: "25%" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    phongThietBiList.map((phongThietBi) => (
                      <tr key={phongThietBi.id}>
                        <td>
                          {phongThietBi.tenThietBi}
                          {phongThietBi.ghiChu && (
                            <div>
                              <small className="text-muted">{phongThietBi.ghiChu}</small>
                            </div>
                          )}
                        </td>
                        <td>{phongThietBi.soLuong}</td>
                        <td>
                          {phongThietBi.trangThaiThietBi ? (
                            <Badge bg="success">
                              <FontAwesomeIcon icon={faCheckCircle} /> Hoạt động tốt
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
                            onClick={() => handleShowEditModal(phongThietBi)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleShowDeleteModal(phongThietBi)}
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
          )}
        </Card.Body>
      </Card>

      {/* Modal Thêm thiết bị vào phòng */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm thiết bị vào phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {thietBiList.length === 0 ? (
            <Alert variant="warning">
              Chưa có thiết bị nào trong hệ thống. Vui lòng thêm thiết bị trước.
            </Alert>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>
                  Thiết bị <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="maThietBi"
                  value={formData.maThietBi}
                  onChange={handleInputChange}
                  required
                >
                  {thietBiList.map((thietBi) => (
                    <option key={thietBi.maThietBi} value={thietBi.maThietBi}>
                      {thietBi.tenThietBi} {!thietBi.trangThai && "(Hỏng)"}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  Số lượng <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  name="soLuong"
                  value={formData.soLuong}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="ghiChu"
                  value={formData.ghiChu}
                  onChange={handleInputChange}
                  placeholder="Ghi chú về thiết bị (nếu có)"
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          {thietBiList.length > 0 && (
            <Button variant="primary" onClick={handleAddThietBi}>
              Thêm vào phòng
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal Sửa thiết bị trong phòng */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật thiết bị</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Thiết bị</Form.Label>
              <Form.Control
                type="text"
                value={currentPhongThietBi?.tenThietBi || ""}
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Số lượng <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                name="soLuong"
                value={formData.soLuong}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="ghiChu"
                value={formData.ghiChu}
                onChange={handleInputChange}
                placeholder="Ghi chú về thiết bị (nếu có)"
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
            <strong>{currentPhongThietBi?.tenThietBi}</strong>" khỏi phòng này?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteThietBi}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PhongThietBiManager; 