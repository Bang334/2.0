import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Form, Modal, Alert, Badge, ProgressBar } from "react-bootstrap";
import axios from "axios";
import authHeader from "../services/auth-header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTools, faCheck, faTimes, faPlus, faSearch, faChartBar } from "@fortawesome/free-solid-svg-icons";

const API_URL = "http://localhost:8080/api/quanly";

const PhongManager = () => {
  const [phongList, setPhongList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [currentPhong, setCurrentPhong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    maPhong: "",
    loaiPhong: "HOC",
    trangThai: "TRONG",
    sucChua: 0,
    viTri: ""
  });

  // Lấy danh sách phòng học khi component được render
  useEffect(() => {
    fetchPhongList();
  }, []);

  // Lấy danh sách phòng học từ API
  const fetchPhongList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/phong`, { headers: authHeader() });
      setPhongList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng học:", error);
      setMessage("Không thể lấy danh sách phòng học. Vui lòng thử lại sau.");
      setMessageType("danger");
      setLoading(false);
    }
  };

  // Xử lý thay đổi trên form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "sucChua" ? parseInt(value, 10) : value
    });
  };

  // Hiển thị modal thêm phòng học mới
  const handleShowAddModal = () => {
    setFormData({
      maPhong: "",
      loaiPhong: "HOC",
      trangThai: "TRONG",
      sucChua: 0,
      viTri: ""
    });
    setShowAddModal(true);
  };

  // Thêm phòng học mới
  const handleAddPhong = async () => {
    if (!formData.maPhong || !formData.sucChua || !formData.viTri) {
      setMessage("Vui lòng điền đầy đủ thông tin bắt buộc.");
      setMessageType("danger");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/phong`,
        formData,
        { headers: authHeader() }
      );
      setShowAddModal(false);
      setMessage("Phòng học đã được tạo thành công!");
      setMessageType("success");
      fetchPhongList();
    } catch (error) {
      setMessage(error.response?.data?.message || "Đã có lỗi xảy ra khi tạo phòng học.");
      setMessageType("danger");
    }
  };

  // Hiển thị modal sửa phòng học
  const handleShowEditModal = (phong) => {
    setCurrentPhong(phong);
    setFormData({
      maPhong: phong.maPhong,
      loaiPhong: phong.loaiPhong,
      trangThai: phong.trangThai,
      sucChua: phong.sucChua,
      viTri: phong.viTri
    });
    setShowEditModal(true);
  };

  // Cập nhật phòng học
  const handleUpdatePhong = async () => {
    if (!formData.sucChua || !formData.viTri) {
      setMessage("Vui lòng điền đầy đủ thông tin bắt buộc.");
      setMessageType("danger");
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/phong/${currentPhong.maPhong}`,
        formData,
        { headers: authHeader() }
      );
      setShowEditModal(false);
      setMessage("Cập nhật phòng học thành công!");
      setMessageType("success");
      fetchPhongList();
    } catch (error) {
      setMessage(error.response?.data?.message || "Đã có lỗi xảy ra khi cập nhật phòng học.");
      setMessageType("danger");
    }
  };

  // Hiển thị modal xác nhận xóa
  const handleShowDeleteConfirm = (phong) => {
    setCurrentPhong(phong);
    setShowConfirmModal(true);
  };

  // Xóa phòng học
  const handleDeletePhong = async () => {
    try {
      await axios.delete(
        `${API_URL}/phong/${currentPhong.maPhong}`,
        { headers: authHeader() }
      );
      setShowConfirmModal(false);
      setMessage("Phòng học đã được xóa thành công!");
      setMessageType("success");
      fetchPhongList();
    } catch (error) {
      setMessage(error.response?.data?.message || "Đã có lỗi xảy ra khi xóa phòng học.");
      setMessageType("danger");
      setShowConfirmModal(false);
    }
  };

  // Thay đổi trạng thái phòng học
  const handleChangePhongStatus = async (phong, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/phong/${phong.maPhong}/trangthai`,
        { trangThai: newStatus },
        { headers: authHeader() }
      );
      setMessage(`Trạng thái phòng học đã được cập nhật thành ${renderTrangThai(newStatus)}`);
      setMessageType("success");
      fetchPhongList();
    } catch (error) {
      setMessage(error.response?.data?.message || "Đã có lỗi xảy ra khi thay đổi trạng thái phòng học.");
      setMessageType("danger");
    }
  };

  // Hiển thị loại phòng
  const renderLoaiPhong = (loaiPhong) => {
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
    switch (trangThai) {
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

  // Lọc danh sách phòng học theo từ khóa tìm kiếm
  const filteredPhong = phongList.filter(p =>
    p.maPhong.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.viTri.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Tính toán thống kê phòng học
  const calculateRoomStats = () => {
    const total = phongList.length;
    
    // Thống kê theo trạng thái
    const countByStatus = {
      TRONG: phongList.filter(p => p.trangThai === "TRONG").length,
      DANGSUDUNG: phongList.filter(p => p.trangThai === "DANGSUDUNG").length,
      BAOTRI: phongList.filter(p => p.trangThai === "BAOTRI").length
    };
    
    // Thống kê theo loại phòng
    const countByType = {
      HOC: phongList.filter(p => p.loaiPhong === "HOC").length,
      THUCHANH: phongList.filter(p => p.loaiPhong === "THUCHANH").length
    };
    
    // Tính tỷ lệ phần trăm
    const percentByStatus = {
      TRONG: total ? Math.round((countByStatus.TRONG / total) * 100) : 0,
      DANGSUDUNG: total ? Math.round((countByStatus.DANGSUDUNG / total) * 100) : 0,
      BAOTRI: total ? Math.round((countByStatus.BAOTRI / total) * 100) : 0
    };
    
    // Tính tỷ lệ sử dụng
    const utilizationRate = total ? Math.round((countByStatus.DANGSUDUNG / total) * 100) : 0;
    
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
      avgCapacity
    };
  };

  // Hiển thị modal thống kê
  const handleShowStatsModal = () => {
    setShowStatsModal(true);
  };

  return (
    <Container fluid>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Quản lý phòng học</h5>
          <div>
            <Button variant="info" className="me-2" onClick={handleShowStatsModal}>
              <FontAwesomeIcon icon={faChartBar} /> Báo cáo & Thống kê
            </Button>
            <Button variant="success" onClick={handleShowAddModal}>
              <FontAwesomeIcon icon={faPlus} /> Thêm phòng học
            </Button>
          </div>
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
                    placeholder="Tìm kiếm theo mã phòng, vị trí..."
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
                  <th>Mã phòng</th>
                  <th>Loại phòng</th>
                  <th>Sức chứa</th>
                  <th>Vị trí</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPhong.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Không có phòng học nào
                    </td>
                  </tr>
                ) : (
                  filteredPhong.map((phong) => (
                    <tr key={phong.maPhong}>
                      <td>{phong.maPhong}</td>
                      <td>{renderLoaiPhong(phong.loaiPhong)}</td>
                      <td>{phong.sucChua}</td>
                      <td>{phong.viTri}</td>
                      <td>{renderTrangThai(phong.trangThai)}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleShowEditModal(phong)}>
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        
                        {/* Nút đánh dấu trạng thái */}
                        {phong.trangThai !== "TRONG" && (
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleChangePhongStatus(phong, "TRONG")}
                            title="Đánh dấu là trống"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </Button>
                        )}
                        {phong.trangThai !== "DANGSUDUNG" && (
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleChangePhongStatus(phong, "DANGSUDUNG")}
                            title="Đánh dấu là đang sử dụng"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </Button>
                        )}
                        {phong.trangThai !== "BAOTRI" && (
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleChangePhongStatus(phong, "BAOTRI")}
                            title="Đánh dấu là bảo trì"
                          >
                            <FontAwesomeIcon icon={faTools} />
                          </Button>
                        )}
                        
                        {/* Nút xóa */}
                        <Button variant="outline-danger" size="sm" onClick={() => handleShowDeleteConfirm(phong)}>
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

      {/* Modal Thêm phòng học */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Thêm phòng học mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Mã phòng <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="maPhong"
                value={formData.maPhong}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Loại phòng <span className="text-danger">*</span></Form.Label>
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
              <Form.Label>Sức chứa <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="sucChua"
                value={formData.sucChua}
                onChange={handleInputChange}
                min="0"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Vị trí <span className="text-danger">*</span></Form.Label>
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
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddPhong}>
            Thêm phòng học
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Sửa phòng học */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Sửa phòng học {currentPhong?.maPhong}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Mã phòng</Form.Label>
              <Form.Control
                type="text"
                value={formData.maPhong}
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Loại phòng <span className="text-danger">*</span></Form.Label>
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
              <Form.Label>Trạng thái <span className="text-danger">*</span></Form.Label>
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
              <Form.Label>Sức chứa <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="sucChua"
                value={formData.sucChua}
                onChange={handleInputChange}
                min="0"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Vị trí <span className="text-danger">*</span></Form.Label>
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
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
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
          <p>Bạn có chắc chắn muốn xóa phòng học <strong>{currentPhong?.maPhong}</strong>?</p>
          <p className="text-danger">Lưu ý: Hành động này không thể hoàn tác.</p>
          {currentPhong?.trangThai === "DANGSUDUNG" && (
            <Alert variant="warning">
              <strong>Cảnh báo:</strong> Phòng học này đang được sử dụng. Bạn không thể xóa phòng học đang được sử dụng.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeletePhong}
            disabled={currentPhong?.trangThai === "DANGSUDUNG"}
          >
            Xóa phòng học
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Thống kê phòng học */}
      <Modal show={showStatsModal} onHide={() => setShowStatsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Báo cáo & Thống kê phòng học</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
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
                      <h2 className="display-4">{calculateRoomStats().total}</h2>
                      <p className="text-muted">Tổng số phòng</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4} className="text-center">
                  <Card className="h-100">
                    <Card.Body>
                      <h2 className="display-4">{calculateRoomStats().totalCapacity}</h2>
                      <p className="text-muted">Tổng sức chứa</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4} className="text-center">
                  <Card className="h-100">
                    <Card.Body>
                      <h2 className="display-4">{calculateRoomStats().avgCapacity}</h2>
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
                    <td>
                      {renderTrangThai("TRONG")} Trống
                    </td>
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
                    <td>
                      {renderTrangThai("DANGSUDUNG")} Đang sử dụng
                    </td>
                    <td>{calculateRoomStats().countByStatus.DANGSUDUNG}</td>
                    <td>
                      <ProgressBar 
                        now={calculateRoomStats().percentByStatus.DANGSUDUNG} 
                        label={`${calculateRoomStats().percentByStatus.DANGSUDUNG}%`}
                        variant="warning"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {renderTrangThai("BAOTRI")} Bảo trì
                    </td>
                    <td>{calculateRoomStats().countByStatus.BAOTRI}</td>
                    <td>
                      <ProgressBar 
                        now={calculateRoomStats().percentByStatus.BAOTRI} 
                        label={`${calculateRoomStats().percentByStatus.BAOTRI}%`}
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
                    <td>
                      {renderLoaiPhong("HOC")} Phòng học
                    </td>
                    <td>{calculateRoomStats().countByType.HOC}</td>
                  </tr>
                  <tr>
                    <td>
                      {renderLoaiPhong("THUCHANH")} Phòng thực hành
                    </td>
                    <td>{calculateRoomStats().countByType.THUCHANH}</td>
                  </tr>
                </tbody>
              </Table>
              
              <h5 className="mb-3">Tỷ lệ sử dụng phòng học</h5>
              <Card>
                <Card.Body>
                  <h4 className="text-center">{calculateRoomStats().utilizationRate}%</h4>
                  <ProgressBar 
                    now={calculateRoomStats().utilizationRate} 
                    variant={
                      calculateRoomStats().utilizationRate < 30 ? "success" : 
                      calculateRoomStats().utilizationRate < 70 ? "warning" : "danger"
                    }
                    style={{ height: "30px" }}
                  />
                  <div className="text-muted mt-2 text-center">
                    {calculateRoomStats().utilizationRate < 30 ? "Tỷ lệ sử dụng thấp" : 
                     calculateRoomStats().utilizationRate < 70 ? "Tỷ lệ sử dụng trung bình" : "Tỷ lệ sử dụng cao"}
                  </div>
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatsModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PhongManager; 