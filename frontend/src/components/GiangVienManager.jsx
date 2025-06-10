import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge, ProgressBar, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import authHeader from "../services/auth-header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSearch, faChartBar, faUserPlus, faExclamationTriangle, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { toast,ToastContainer } from "react-toastify";
import validationService from "../services/validation.service";

const API_URL = "http://localhost:8080/api/quanly";

const GiangVienManager = ({ refreshKey }) => {
  const [giangVienList, setGiangVienList] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [currentGiangVien, setCurrentGiangVien] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddGiangVienModal, setShowAddGiangVienModal] = useState(false);
  const [formData, setFormData] = useState({
    maGV: "",
    hoTen: "",
    email: "",
    lienHe: "",
    gioiTinh: "Nam",
    khoa: "",
  });
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [giangVienAccounts, setGiangVienAccounts] = useState({});

  // Predefined faculty list
  const khoaList = [
    "Viễn thông 2",
    "Kỹ thuật Điện tử 2",
    "Công nghệ Thông tin 2",
    "Quản trị Kinh doanh 2",
    "Cơ bản 2",
  ];

  // State để theo dõi lỗi validation
  const [validationErrors, setValidationErrors] = useState({
    maGV: false,
    email: false,
    lienHe: false,
  });

  // State để theo dõi trùng lặp
  const [duplicateChecks, setDuplicateChecks] = useState({
    maGVExists: false,
    emailExists: false,
    phoneExists: false,
    isChecking: false,
  });

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
      checkGiangVienAccounts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách giảng viên:", error);
      toast.error("Không thể lấy danh sách giảng viên. Vui lòng thử lại sau.", {
        position: "top-center",
        autoClose: 3000,
      });
      setLoading(false);
    }
  };

  // Kiểm tra tài khoản cho từng giảng viên
  const checkGiangVienAccounts = async (giangVienData) => {
    try {
      const response = await axios.get(`${API_URL}/taikhoan`, {
        headers: authHeader(),
      });
      const taiKhoanList = response.data;
      const accountsMap = {};
      giangVienData.forEach(gv => {
        const taiKhoan = taiKhoanList.find(tk => tk.idNguoiDung === gv.idNguoiDung);
        accountsMap[gv.idNguoiDung] = taiKhoan ? true : false;
      });
      console.log("Thông tin tài khoản giảng viên:", accountsMap);
      setGiangVienAccounts(accountsMap);
    } catch (error) {
      console.error("Lỗi khi kiểm tra tài khoản giảng viên:", error);
      toast.error("Không thể kiểm tra tài khoản giảng viên.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
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
      toast.error("Không thể lấy thống kê giảng viên.", {
        position: "top-center",
        autoClose: 3000,
      });
      setStatsLoading(false);
    }
  };

  // Xử lý thay đổi trên form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'maGV') {
      const isValidFormat = !/\s/.test(value);
      setValidationErrors({
        ...validationErrors,
        maGV: !isValidFormat,
      });
      if (isValidFormat && value.length >= 3) {
        checkDuplicateMaGV(value);
      } else {
        setDuplicateChecks((prev) => ({
          ...prev,
          maGVExists: false,
        }));
      }
    } else if (name === 'email') {
      const isValidFormat = value === "" || (validationService.validateEmailFormat(value) && value.endsWith('@gmail.com'));
      setValidationErrors({
        ...validationErrors,
        email: !isValidFormat,
      });
      if (isValidFormat && value.length >= 3) {
        checkDuplicateEmail(value);
      } else {
        setDuplicateChecks((prev) => ({
          ...prev,
          emailExists: false,
        }));
      }
    } else if (name === 'lienHe') {
      const isValidFormat = value === "" || /^(0|\+84)\d{9}$/.test(value);
      setValidationErrors({
        ...validationErrors,
        lienHe: !isValidFormat,
      });
      if (isValidFormat && value.length >= 10) {
        checkDuplicatePhone(value);
      } else {
        setDuplicateChecks((prev) => ({
          ...prev,
          phoneExists: false,
        }));
      }
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  // Kiểm tra mã giảng viên đã tồn tại chưa
  const checkDuplicateMaGV = async (maGV) => {
    if (!maGV) return;
    setDuplicateChecks(prev => ({ ...prev, isChecking: true }));
    try {
      const excludeId = currentGiangVien ? currentGiangVien.idNguoiDung : null;
      const exists = await validationService.checkMaGVExists(maGV.toLowerCase(), excludeId);
      setDuplicateChecks(prev => ({
        ...prev,
        maGVExists: exists,
        isChecking: false,
      }));
    } catch (error) {
      console.error("Lỗi kiểm tra trùng mã giảng viên:", error);
      setDuplicateChecks(prev => ({ ...prev, isChecking: false }));
      toast.error("Lỗi kiểm tra mã giảng viên.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  // Kiểm tra email đã tồn tại chưa
  const checkDuplicateEmail = async (email) => {
    if (!email) return;
    setDuplicateChecks(prev => ({ ...prev, isChecking: true }));
    try {
      const excludeId = currentGiangVien ? currentGiangVien.idNguoiDung : null;
      const exists = await validationService.checkEmailExists(email, excludeId);
      setDuplicateChecks(prev => ({
        ...prev,
        emailExists: exists,
        isChecking: false,
      }));
    } catch (error) {
      console.error("Lỗi kiểm tra trùng email:", error);
      setDuplicateChecks(prev => ({ ...prev, isChecking: false }));
      toast.error("Lỗi kiểm tra email.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  // Kiểm tra số điện thoại đã tồn tại chưa
  const checkDuplicatePhone = async (phone) => {
    if (!phone) return;
    setDuplicateChecks(prev => ({ ...prev, isChecking: true }));
    try {
      const excludeId = currentGiangVien ? currentGiangVien.idNguoiDung : null;
      const exists = await validationService.checkPhoneExists(phone, excludeId);
      setDuplicateChecks(prev => ({
        ...prev,
        phoneExists: exists,
        isChecking: false,
      }));
    } catch (error) {
      console.error("Lỗi kiểm tra trùng số điện thoại:", error);
      setDuplicateChecks(prev => ({ ...prev, isChecking: false }));
      toast.error("Lỗi kiểm tra số điện thoại.", {
        position: "top-center",
        autoClose: 3000,
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
    });
    setValidationErrors({
      maGV: false,
      email: false,
      lienHe: false,
    });
    setDuplicateChecks({
      maGVExists: false,
      emailExists: false,
      phoneExists: false,
      isChecking: false,
    });
    setShowEditModal(true);
  };

  // Cập nhật giảng viên
  const handleUpdateGiangVien = async () => {
    if (!formData.maGV || !formData.hoTen || !formData.email || !formData.khoa || !formData.lienHe) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (validationErrors.maGV) {
      toast.error("Mã giảng viên không được chứa khoảng trắng.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (validationErrors.email) {
      toast.error("Email phải có định dạng hợp lệ và kết thúc bằng @gmail.com.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (formData.lienHe && validationErrors.lienHe) {
      toast.error("Số điện thoại phải có định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (duplicateChecks.maGVExists) {
      toast.error("Mã giảng viên này đã tồn tại.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (duplicateChecks.emailExists) {
      toast.error("Email này đã được sử dụng.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (duplicateChecks.phoneExists) {
      toast.error("Số điện thoại này đã được sử dụng.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      const requestData = {
        ...formData,
        maGV: formData.maGV.toLowerCase(),
      };
      const response = await axios.put(
        `${API_URL}/giangvien/${currentGiangVien.maGV}`,
        requestData,
        { headers: authHeader() }
      );
      setShowEditModal(false);
      toast.success("Cập nhật giảng viên thành công!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
      });
      fetchGiangVienList();
    } catch (error) {
      console.error("Lỗi khi cập nhật giảng viên:", error);
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra khi cập nhật giảng viên.", {
        position: "top-center",
        autoClose: 3000,
      });
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
      toast.success("Giảng viên đã được xóa thành công!", {
        position: "top-center",
        autoClose: 3000,
      });
      fetchGiangVienList();
    } catch (error) {
      console.error("Lỗi khi xóa giảng viên:", error);
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra khi xóa giảng viên.", {
        position: "top-center",
        autoClose: 3000,
      });
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
    });
    setValidationErrors({
      maGV: false,
      email: false,
      lienHe: false,
    });
    setDuplicateChecks({
      maGVExists: false,
      emailExists: false,
      phoneExists: false,
      isChecking: false,
    });
    setShowAddGiangVienModal(true);
  };

  // Thêm giảng viên mới
  const handleAddGiangVien = async () => {
    if (!formData.maGV || !formData.hoTen || !formData.email || !formData.khoa || !formData.lienHe) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (validationErrors.maGV) {
      toast.error("Mã giảng viên không được chứa khoảng trắng.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (validationErrors.email) {
      toast.error("Email phải có định dạng hợp lệ và kết thúc bằng @gmail.com.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (formData.lienHe && validationErrors.lienHe) {
      toast.error("Số điện thoại phải có định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (duplicateChecks.maGVExists) {
      toast.error("Mã giảng viên này đã tồn tại.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (duplicateChecks.emailExists) {
      toast.error("Email này đã được sử dụng.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (duplicateChecks.phoneExists) {
      toast.error("Số điện thoại này đã được sử dụng.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      const requestData = {
        ...formData,
        maGV: formData.maGV.toLowerCase(),
      };
      console.log("Sending data to add teacher:", requestData);
      const response = await axios.post(`${API_URL}/giangvien`, requestData, {
        headers: authHeader(),
      });

      // Create account if phone number is provided
      if (formData.lienHe) {
        const userId = formData.maGV.toLowerCase();
        const password = formData.maGV.toLowerCase() + formData.lienHe.slice(-3);
        try {
          await axios.post(
            `${API_URL}/giangvien/${formData.maGV.toLowerCase()}/taikhoan`,
            { userId, password },
            { headers: authHeader() }
          );
          setGiangVienAccounts(prev => ({
            ...prev,
            [response.data.idNguoiDung]: true,
          }));
        } catch (accountError) {
          console.error("Lỗi khi tạo tài khoản:", accountError);
          toast.error(accountError.response?.data?.message || "Đã có lỗi xảy ra khi tạo tài khoản.", {
            position: "top-center",
            autoClose: 3000,
          });
        }
      }

      setShowAddGiangVienModal(false);
      toast.success(`Giảng viên ${formData.hoTen} đã được tạo thành công!`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      fetchGiangVienList();
    } catch (error) {
      console.error("Lỗi khi thêm giảng viên:", error);
      toast.error(
        error.response?.data?.message || "Đã có lỗi xảy ra khi tạo giảng viên.",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
    }
  };

  // Kiểm tra giảng viên có tài khoản chưa
  const hasTaiKhoan = (giangVien) => {
    return giangVienAccounts[giangVien.idNguoiDung] === true;
  };

  return (
    <Container>
      <ToastContainer/>
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
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Mã GV</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Liên hệ</th>
                  <th>Giới tính</th>
                  <th>Khoa</th>
                  <th>Tài khoản</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredGiangVien.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">Không có giảng viên nào</td>
                  </tr>
                ) : (
                  filteredGiangVien.map((giangVien) => (
                    <tr key={giangVien.maGV}>
                      <td>{giangVien.maGV}</td>
                      <td>{giangVien.hoTen}</td>
                      <td>{giangVien.email}</td>
                      <td>{giangVien.lienHe || "N/A"}</td>
                      <td>{renderGioiTinh(giangVien.gioiTinh)}</td>
                      <td>{giangVien.khoa}</td>
                      <td>
                        {hasTaiKhoan(giangVien) ? (
                          <Badge bg="success">Đã có tài khoản</Badge>
                        ) : (
                          <Badge bg="secondary">Chưa có tài khoản</Badge>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => handleShowEditModal(giangVien)}
                            title="Sửa thông tin"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          {/* <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleShowDeleteConfirm(giangVien)}
                            title="Xóa giảng viên"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button> */}
                        </div>
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
                    <option value="">-- Chọn khoa --</option>
                    {khoaList.map(khoa => (
                      <option key={khoa} value={khoa}>
                        {khoa}
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
 messy code section starts here
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={validationErrors.email || duplicateChecks.emailExists}
                    required
                  />
                  {validationErrors.email && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Email phải kết thúc bằng @gmail.com
                    </Form.Control.Feedback>
                  )}
                  {!validationErrors.email && duplicateChecks.emailExists && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faInfoCircle} /> Email này đã được sử dụng
                    </Form.Control.Feedback>
                  )}
                  {duplicateChecks.isChecking && formData.email && formData.email.length >= 3 && (
                    <div className="mt-1">
                      <Spinner animation="border" size="sm" /> Đang kiểm tra...
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại<span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="lienHe"
                    value={formData.lienHe}
                    onChange={handleInputChange}
                    isInvalid={validationErrors.lienHe || duplicateChecks.phoneExists}
                  />
                  {validationErrors.lienHe && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Số điện thoại phải có định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx
                    </Form.Control.Feedback>
                  )}
                  {!validationErrors.lienHe && duplicateChecks.phoneExists && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faInfoCircle} /> Số điện thoại này đã được sử dụng
                    </Form.Control.Feedback>
                  )}
                  {duplicateChecks.isChecking && formData.lienHe && formData.lienHe.length >= 10 && (
                    <div className="mt-1">
                      <Spinner animation="border" size="sm" /> Đang kiểm tra...
                    </div>
                  )}
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
 Ohm, I got a bit carried away there. Let's clean this up and get back to the main point.

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
                    isInvalid={validationErrors.maGV || duplicateChecks.maGVExists}
                    required
                  />
                  {validationErrors.maGV && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Mã giảng viên không được chứa khoảng trắng
                    </Form.Control.Feedback>
                  )}
                  {!validationErrors.maGV && duplicateChecks.maGVExists && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faInfoCircle} /> Mã giảng viên này đã tồn tại
                    </Form.Control.Feedback>
                  )}
                  {duplicateChecks.isChecking && formData.maGV && formData.maGV.length >= 3 && (
                    <div className="mt-1">
                      <Spinner animation="border" size="sm" /> Đang kiểm tra...
                    </div>
                  )}
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
                    placeholder="Nhập email (phải kết thúc bằng @gmail.com)"
                    isInvalid={validationErrors.email || duplicateChecks.emailExists}
                    required
                  />
                  {validationErrors.email && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Email phải kết thúc bằng @gmail.com
                    </Form.Control.Feedback>
                  )}
                  {!validationErrors.email && duplicateChecks.emailExists && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faInfoCircle} /> Email này đã được sử dụng
                    </Form.Control.Feedback>
                  )}
                  {duplicateChecks.isChecking && formData.email && formData.email.length >= 3 && (
                    <div className="mt-1">
                      <Spinner animation="border" size="sm" /> Đang kiểm tra...
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại<span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="lienHe"
                    value={formData.lienHe}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại (0xxxxxxxxx hoặc +84xxxxxxxxx)"
                    isInvalid={validationErrors.lienHe || duplicateChecks.phoneExists}
                  />
                  {validationErrors.lienHe && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Số điện thoại phải có định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx
                    </Form.Control.Feedback>
                  )}
                  {!validationErrors.lienHe && duplicateChecks.phoneExists && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faInfoCircle} /> Số điện thoại này đã được sử dụng
                    </Form.Control.Feedback>
                  )}
                  {duplicateChecks.isChecking && formData.lienHe && formData.lienHe.length >= 10 && (
                    <div className="mt-1">
                      <Spinner animation="border" size="sm" /> Đang kiểm tra...
                    </div>
                  )}
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
                  <Form.Select
                    name="khoa"
                    value={formData.khoa}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn khoa --</option>
                    {khoaList.map(khoa => (
                      <option key={khoa} value={khoa}>
                        {khoa}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            {/* {formData.lienHe && !validationErrors.lienHe && !duplicateChecks.phoneExists && (
              <Alert variant="info">
                Tài khoản sẽ được tạo với:<br />
                Tên đăng nhập: <strong>{formData.maGV.toLowerCase()}</strong><br />
                Mật khẩu: <strong>{formData.maGV.toLowerCase() + (formData.lienHe?.slice(-3) || 'xxx')}</strong>
              </Alert>
            )} */}
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