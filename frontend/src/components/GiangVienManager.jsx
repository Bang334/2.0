import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge, ProgressBar, Alert } from "react-bootstrap";
import axios from "axios";
import authHeader from "../services/auth-header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSearch, faKey, faChartBar, faUser, faUsers, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const API_URL = "http://localhost:8080/api/quanly";

const GiangVienManager = ({ refreshKey }) => {
  const [giangVienList, setGiangVienList] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [currentGiangVien, setCurrentGiangVien] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTaiKhoanForm, setShowTaiKhoanForm] = useState(false);
  const [khoaList, setKhoaList] = useState([]);
  const [showAddGiangVienModal, setShowAddGiangVienModal] = useState(false);
  const [formData, setFormData] = useState({
    maGV: "",
    hoTen: "",
    email: "",
    lienHe: "",
    gioiTinh: "Nam",
    khoa: "",
    userId: "",
    password: "",
  });
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Lấy danh sách giảng viên khi component được render
  useEffect(() => {
    fetchGiangVienList();
  }, []);

  // Lấy danh sách giảng viên khi refreshKey thay đổi
  useEffect(() => {
    if (refreshKey) {
      console.log("GiangVienManager refreshing due to refreshKey change:", refreshKey);
      fetchGiangVienList();
    }
  }, [refreshKey]);

  // Lấy danh sách giảng viên từ API
  const fetchGiangVienList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/giangvien`, { headers: authHeader() });
      setGiangVienList(response.data);
      
      // Lấy danh sách khoa từ dữ liệu giảng viên
      extractKhoaList(response.data);
      
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách giảng viên:", error);
      toast.error("Không thể lấy danh sách giảng viên. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };
  
  // Trích xuất danh sách khoa từ dữ liệu giảng viên
  const extractKhoaList = (giangVienData) => {
    // Lấy các giá trị khoa duy nhất từ danh sách giảng viên
    const uniqueKhoa = [...new Set(
      giangVienData
        .filter(gv => gv.khoa && gv.khoa.trim() !== '')
        .map(gv => gv.khoa)
    )].sort();
    
    setKhoaList(uniqueKhoa);
  };

  // Lấy thống kê về giảng viên
  const fetchGiangVienStats = async () => {
    setStatsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/giangvien/thongke`, { headers: authHeader() });
      setStatsData(response.data);
      setStatsLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê giảng viên:", error);
      setStatsLoading(false);
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

  // Hiển thị modal sửa giảng viên
  const handleShowEditModal = (giangVien) => {
    setCurrentGiangVien(giangVien);
    setFormData({
      maGV: giangVien.maGV,
      hoTen: giangVien.hoTen,
      email: giangVien.email,
      lienHe: giangVien.lienHe || "",
      gioiTinh: giangVien.gioiTinh,
      khoa: giangVien.khoa,
      password: "" // Password luôn trống khi sửa
    });
    setShowTaiKhoanForm(false);
    setShowEditModal(true);
  };

  // Cập nhật giảng viên
  const handleUpdateGiangVien = async () => {
    if (!formData.hoTen || !formData.email || !formData.khoa) {
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
        `${API_URL}/giangvien/${currentGiangVien.maGV}`,
        requestData,
        { headers: authHeader() }
      );
      setShowEditModal(false);
      toast.success("Cập nhật giảng viên thành công!");
      fetchGiangVienList();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra khi cập nhật giảng viên.");
    }
  };

  // Hiển thị modal xác nhận xóa
  const handleShowDeleteConfirm = (giangVien) => {
    setCurrentGiangVien(giangVien);
    setShowConfirmModal(true);
  };

  // Xóa giảng viên
  const handleDeleteGiangVien = async () => {
    try {
      await axios.delete(
        `${API_URL}/giangvien/${currentGiangVien.maGV}`,
        { headers: authHeader() }
      );
      setShowConfirmModal(false);
      toast.success("Giảng viên đã được xóa thành công!");
      fetchGiangVienList();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra khi xóa giảng viên.");
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
  
  // Hiển thị modal thống kê
  const handleShowStatsModal = () => {
    fetchGiangVienStats();
    setShowStatsModal(true);
  };

  // Lọc danh sách giảng viên theo từ khóa tìm kiếm
  const filteredGiangVien = giangVienList.filter(gv =>
    gv.maGV.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gv.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (gv.khoa && gv.khoa.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Hiển thị modal thêm giảng viên mới
  const handleShowAddGiangVienModal = () => {
    setFormData({
      maGV: "",
      hoTen: "",
      email: "",
      lienHe: "",
      gioiTinh: "Nam",
      khoa: "",
      userId: "",
      password: "",
    });
    setShowTaiKhoanForm(false); // Mặc định ẩn form tài khoản khi mở modal mới
    setShowAddGiangVienModal(true);
  };

  // Thêm giảng viên mới
  const handleAddGiangVien = async () => {
    if (!formData.maGV || !formData.hoTen || !formData.email || !formData.khoa || !formData.userId || !formData.password) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc, bao gồm cả tài khoản.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/giangvien`, formData, {
        headers: authHeader(),
      });
      setShowAddGiangVienModal(false);
      toast.success("Giảng viên đã được tạo thành công!");
      fetchGiangVienList();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Đã có lỗi xảy ra khi tạo giảng viên."
      );
    }
  };

  return (
    <Container >
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Quản lý giảng viên</h5>
          <div>
            <Button variant="outline-light" onClick={handleShowAddGiangVienModal} className="me-2" id="add-giangvien-btn">
              <FontAwesomeIcon icon={faUserPlus} /> Thêm giảng viên mới
            </Button>
            <Button variant="outline-light" onClick={handleShowStatsModal} id="giangvien-stats-btn">
              <FontAwesomeIcon icon={faChartBar} /> Báo cáo thống kê
            </Button>
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
                    placeholder="Tìm kiếm theo mã GV, họ tên, email, khoa..."
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
                  <th>Mã GV</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Liên hệ</th>
                  <th>Giới tính</th>
                  <th>Khoa</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center"><div className="spinner-border spinner-border-sm me-2" role="status"></div>Đang tải...</td>
                  </tr>
                ) : filteredGiangVien.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">Không có giảng viên nào</td>
                  </tr>
                ) : (
                  filteredGiangVien.map((giangVien) => (
                    <tr key={giangVien.maGV}>
                      <td>{giangVien.maGV}</td>
                      <td>{giangVien.hoTen}</td>
                      <td>{giangVien.email}</td>
                      <td>{giangVien.lienHe || "N/A"}</td>
                      <td>{renderGioiTinh(giangVien.gioiTinh)}</td>
                      <td>{giangVien.khoa || "Chưa phân khoa"}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="mb-1" onClick={() => handleShowEditModal(giangVien)}>
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleShowDeleteConfirm(giangVien)}>
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

      {/* Modal Sửa giảng viên */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Sửa giảng viên {currentGiangVien?.hoTen}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã giảng viên</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.maGV}
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Khoa/Chuyên ngành <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="khoa"
                    value={formData.khoa}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn khoa/chuyên ngành --</option>
                    {khoaList.map(khoa => (
                      <option key={khoa} value={khoa}>
                        {khoa}
                      </option>
                    ))}
                    {/* Thêm lựa chọn nhập khoa mới nếu chưa có trong danh sách */}
                    <option value="__NEW__">+ Thêm khoa mới</option>
                  </Form.Select>
                  {formData.khoa === "__NEW__" && (
                    <Form.Control
                      type="text"
                      className="mt-2"
                      name="khoa"
                      placeholder="Nhập tên khoa mới"
                      onChange={(e) => setFormData({
                        ...formData,
                        khoa: e.target.value
                      })}
                      required
                    />
                  )}
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
                    <Col>
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
          <Button variant="primary" onClick={handleUpdateGiangVien}>
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
          <p>Bạn có chắc chắn muốn xóa giảng viên <strong>{currentGiangVien?.hoTen}</strong>?</p>
          <p className="text-danger">Lưu ý: Hành động này không thể hoàn tác và sẽ xóa cả thông tin người dùng và tài khoản.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteGiangVien}>
            Xóa giảng viên
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Thống kê giảng viên */}
      <Modal show={showStatsModal} onHide={() => setShowStatsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Báo cáo & Thống kê giảng viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {statsLoading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <Row className="mb-4">
                <Col md={6} className="text-center">
                  <Card className="h-100">
                    <Card.Body>
                      <h2 className="display-4">{statsData?.tongSo || giangVienList.length}</h2>
                      <p className="text-muted">Tổng số giảng viên</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="text-center">
                  <Card className="h-100">
                    <Card.Body>
                      <h2 className="display-4">{statsData?.soYeuCauMuonPhong || 0}</h2>
                      <p className="text-muted">Số yêu cầu mượn phòng</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <h5 className="mb-3">Phân bố giảng viên theo khoa</h5>
              <Table bordered className="mb-4">
                <thead>
                  <tr>
                    <th>Khoa</th>
                    <th>Số lượng giảng viên</th>
                    <th>Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody>
                  {statsData?.thongKeTheoKhoa ? (
                    Object.entries(statsData.thongKeTheoKhoa).map(([khoa, soLuong]) => {
                      const tyLe = (soLuong / (statsData.tongSo || giangVienList.length)) * 100;
                      return (
                        <tr key={khoa}>
                          <td>{khoa || "Chưa phân khoa"}</td>
                          <td>{soLuong}</td>
                          <td>
                            <ProgressBar 
                              now={tyLe} 
                              label={`${Math.round(tyLe)}%`}
                              variant="info"
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    // Nếu không có dữ liệu từ API, tính toán trực tiếp từ giangVienList
                    (() => {
                      const khoaCount = {};
                      giangVienList.forEach(gv => {
                        const khoa = gv.khoa || "Chưa phân khoa";
                        khoaCount[khoa] = (khoaCount[khoa] || 0) + 1;
                      });
                      
                      return Object.entries(khoaCount).map(([khoa, soLuong]) => {
                        const tyLe = (soLuong / giangVienList.length) * 100;
                        return (
                          <tr key={khoa}>
                            <td>{khoa}</td>
                            <td>{soLuong}</td>
                            <td>
                              <ProgressBar 
                                now={tyLe} 
                                label={`${Math.round(tyLe)}%`}
                                variant="info"
                              />
                            </td>
                          </tr>
                        );
                      });
                    })()
                  )}
                </tbody>
              </Table>
              
              {statsData?.thongKeGioiTinh && (
                <>
                  <h5 className="mb-3">Phân bố giảng viên theo giới tính</h5>
                  <Table bordered className="mb-4">
                    <thead>
                      <tr>
                        <th>Giới tính</th>
                        <th>Số lượng</th>
                        <th>Tỷ lệ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(statsData.thongKeGioiTinh).map(([gioiTinh, soLuong]) => {
                        const tyLe = (soLuong / (statsData.tongSo || giangVienList.length)) * 100;
                        let displayGioiTinh = gioiTinh;
                        switch (gioiTinh) {
                          case "Nam": displayGioiTinh = "Nam"; break;
                          case "Nu": displayGioiTinh = "Nữ"; break;
                          case "KhongXacDinh": displayGioiTinh = "Không xác định"; break;
                          default: displayGioiTinh = gioiTinh;
                        }
                        return (
                          <tr key={gioiTinh}>
                            <td>{displayGioiTinh}</td>
                            <td>{soLuong}</td>
                            <td>
                              <ProgressBar 
                                now={tyLe} 
                                label={`${Math.round(tyLe)}%`}
                                variant={gioiTinh === "Nam" ? "primary" : gioiTinh === "Nu" ? "danger" : "secondary"}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </>
              )}
              
              {statsData?.topMuonPhong && statsData.topMuonPhong.length > 0 && (
                <>
                  <h5 className="mb-3">Top 5 giảng viên mượn phòng nhiều nhất</h5>
                  <Table bordered striped className="mb-4">
                    <thead>
                      <tr>
                        <th>Mã GV</th>
                        <th>Họ tên</th>
                        <th>Khoa</th>
                        <th>Số lần mượn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.topMuonPhong.map((item, index) => (
                        <tr key={item.maGV}>
                          <td>{item.maGV}</td>
                          <td>{item.hoTen}</td>
                          <td>{item.khoa || "Chưa phân khoa"}</td>
                          <td>
                            <Badge bg="primary" pill>{item.soLanMuon}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatsModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Thêm giảng viên mới */}
      <Modal show={showAddGiangVienModal} onHide={() => setShowAddGiangVienModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thêm giảng viên mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã giảng viên <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="maGV"
                    value={formData.maGV}
                    onChange={handleInputChange}
                    placeholder="Nhập mã giảng viên"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="hoTen"
                    value={formData.hoTen}
                    onChange={handleInputChange}
                    placeholder="Nhập họ tên giảng viên"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Nhập email"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Liên hệ</Form.Label>
                  <Form.Control
                    type="text"
                    name="lienHe"
                    value={formData.lienHe}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại hoặc địa chỉ"
                  />
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Khoa <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="khoa"
                    value={formData.khoa}
                    onChange={handleInputChange}
                    placeholder="Nhập khoa"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <hr />
            <Button
              variant="link"
              onClick={handleToggleTaiKhoanForm}
              className="p-0 mb-3 d-flex align-items-center"
            >
              <FontAwesomeIcon icon={faKey} className="me-2" />
              {showTaiKhoanForm ? "Ẩn thông tin tài khoản" : "Thêm thông tin tài khoản"}
            </Button>

            {showTaiKhoanForm && (
              <>
                <Alert variant="info" className="mb-3">
                  Tạo tài khoản người dùng mới cho giảng viên này. Mã người dùng (User ID) và Mật khẩu là bắt buộc.
                </Alert>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên đăng nhập <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="userId"
                        value={formData.userId}
                        onChange={handleInputChange}
                        placeholder="Nhập tên đăng nhập"
                        required={showTaiKhoanForm} // Required only when form is shown
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
                        placeholder="Nhập mật khẩu"
                        required={showTaiKhoanForm} // Required only when form is shown
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddGiangVienModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddGiangVien}>
            Thêm giảng viên
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GiangVienManager; 