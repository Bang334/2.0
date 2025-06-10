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
  Alert,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import authHeader from "../services/auth-header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSearch,
  faUserPlus,
  faUserLock,
  faExclamationTriangle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import validationService from "../services/validation.service";

const API_URL = "http://localhost:8080/api/quanly";

const SinhVienManager = ({ refreshKey }) => {
  const [sinhVienList, setSinhVienList] = useState([]);
  const [lopHocList, setLopHocList] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAddSinhVienModal, setShowAddSinhVienModal] = useState(false);
  const [currentSinhVien, setCurrentSinhVien] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sinhVienAccounts, setSinhVienAccounts] = useState({});

  const [formData, setFormData] = useState({
    maSV: "",
    hoTen: "",
    email: "",
    lienHe: "",
    gioiTinh: "Nam",
    maLop: "",
  });
  
  // State để theo dõi lỗi validation
  const [validationErrors, setValidationErrors] = useState({
    maSV: false,
    hoTen: false,
    email: false,
    lienHe: false
  });
  
  // State để theo dõi trùng lặp
  const [duplicateChecks, setDuplicateChecks] = useState({
    emailExists: false,
    phoneExists: false,
    isChecking: false
  });

  // Lấy danh sách sinh viên khi component được render
  useEffect(() => {
    fetchSinhVienList();
    fetchLopHocList();
  }, []);

  // Lấy danh sách sinh viên khi refreshKey thay đổi
  useEffect(() => {
    if (refreshKey) {
      console.log(
        "SinhVienManager refreshing due to refreshKey change:",
        refreshKey
      );
      fetchSinhVienList();
      fetchLopHocList();
    }
  }, [refreshKey]);

  // Lấy danh sách sinh viên từ API
  const fetchSinhVienList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/sinhvien`, {
        headers: authHeader(),
      });
      console.log("Danh sách sinh viên từ API:", response.data);
      setSinhVienList(response.data);
      
      // Kiểm tra tài khoản cho từng sinh viên
      checkSinhVienAccounts(response.data);
      
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sinh viên:", error);
      toast.error("Không thể lấy danh sách sinh viên. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };
  
  // Kiểm tra tài khoản cho từng sinh viên
  const checkSinhVienAccounts = async (sinhVienData) => {
    try {
      // Lấy danh sách tất cả tài khoản
      const response = await axios.get(`${API_URL}/taikhoan`, {
        headers: authHeader(),
      });
      
      const taiKhoanList = response.data;
      const accountsMap = {};
      
      // Tạo map để kiểm tra nhanh hơn
      sinhVienData.forEach(sv => {
        const taiKhoan = taiKhoanList.find(tk => tk.idNguoiDung === sv.idNguoiDung);
        accountsMap[sv.idNguoiDung] = taiKhoan ? true : false;
      });
      
      console.log("Thông tin tài khoản sinh viên:", accountsMap);
      setSinhVienAccounts(accountsMap);
    } catch (error) {
      console.error("Lỗi khi kiểm tra tài khoản sinh viên:", error);
    }
  };

  // Lấy danh sách lớp học từ API
  const fetchLopHocList = async () => {
    try {
      const response = await axios.get(`${API_URL}/lophoc`, {
        headers: authHeader(),
      });
      setLopHocList(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lớp học:", error);
      if (error.response && error.response.status !== 401) {
        toast.error("Không thể lấy danh sách lớp học. Vui lòng thử lại sau.");
      }
    }
  };

  // Hàm kiểm tra định dạng mã sinh viên
  const validateMaSVFormat = (maSV) => {
    const maSVRegex = /^[NEne]\d{2}[A-Za-z]{4}\d{3}$/;
    return maSVRegex.test(maSV);
  };

  // Hàm kiểm tra định dạng họ tên
  const validateHoTenFormat = (hoTen) => {
    const hoTenRegex = /^[A-Za-zÀ-ỹ\s]+$/;
    return hoTenRegex.test(hoTen);
  };

  // Xử lý thay đổi trên form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };

    // Tự động cập nhật email dựa trên mã sinh viên
    if (name === "maSV") {
      newFormData.email = value ? `${value.toLowerCase()}@student.ptithcm.edu.vn` : "";
    }

    setFormData(newFormData);
    
    // Kiểm tra validation khi người dùng nhập
    if (name === "maSV") {
      const isValidFormat = value === "" || validateMaSVFormat(value);
      setValidationErrors({
        ...validationErrors,
        maSV: !isValidFormat
      });
    } else if (name === "hoTen") {
      const isValidFormat = value === "" || validateHoTenFormat(value);
      setValidationErrors({
        ...validationErrors,
        hoTen: !isValidFormat
      });
    } else if (name === "lienHe") {
      const isValidFormat = value === "" || validationService.validatePhoneFormat(value);
      setValidationErrors({
        ...validationErrors,
        lienHe: !isValidFormat
      });
      
      // Nếu định dạng hợp lệ và đã nhập đủ số, kiểm tra trùng lặp
      if (isValidFormat && value.length >= 10) {
        checkDuplicatePhone(value);
      } else {
        // Reset trạng thái kiểm tra trùng lặp
        setDuplicateChecks(prev => ({
          ...prev,
          phoneExists: false
        }));
      }
    }
  };
  
  // Kiểm tra email đã tồn tại chưa
  const checkDuplicateEmail = async (email) => {
    if (!email) return;
    
    setDuplicateChecks(prev => ({ ...prev, isChecking: true }));
    try {
      const excludeId = currentSinhVien ? currentSinhVien.idNguoiDung : null;
      const exists = await validationService.checkEmailExists(email, excludeId);
      
      setDuplicateChecks(prev => ({
        ...prev,
        emailExists: exists,
        isChecking: false
      }));
    } catch (error) {
      console.error("Lỗi kiểm tra trùng email:", error);
      setDuplicateChecks(prev => ({ ...prev, isChecking: false }));
    }
  };
  
  // Kiểm tra số điện thoại đã tồn tại chưa
  const checkDuplicatePhone = async (phone) => {
    if (!phone) return;
    
    setDuplicateChecks(prev => ({ ...prev, isChecking: true }));
    try {
      const excludeId = currentSinhVien ? currentSinhVien.idNguoiDung : null;
      const exists = await validationService.checkPhoneExists(phone, excludeId);
      
      setDuplicateChecks(prev => ({
        ...prev,
        phoneExists: exists,
        isChecking: false
      }));
    } catch (error) {
      console.error("Lỗi kiểm tra trùng số điện thoại:", error);
      setDuplicateChecks(prev => ({ ...prev, isChecking: false }));
    }
  };

  // Hiển thị modal thêm sinh viên mới
  const handleShowAddSinhVienModal = () => {
    setFormData({
      maSV: "",
      hoTen: "",
      email: "",
      lienHe: "",
      gioiTinh: "Nam",
      maLop: "",
    });
    setValidationErrors({
      maSV: false,
      hoTen: false,
      email: false,
      lienHe: false
    });
    setShowAddSinhVienModal(true);
  };

  // Thêm sinh viên mới
  const handleAddSinhVien = async () => {
    if (!formData.maSV || !formData.hoTen || !formData.gioiTinh|| !formData.lienHe || !formData.maLop) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    // Kiểm tra định dạng mã sinh viên
    if (!validateMaSVFormat(formData.maSV)) {
      toast.error("Mã sinh viên phải có định dạng (VD: N22DCCN181)");
      return;
    }

    // Kiểm tra định dạng họ tên
    if (!validateHoTenFormat(formData.hoTen)) {
      toast.error("Họ tên chỉ được chứa chữ cái và dấu cách, không chứa số hoặc ký tự đặc biệt.");
      return;
    }

    // Kiểm tra định dạng email
    if (!validationService.validateEmailFormat(formData.email)) {
      toast.error("Email không đúng định dạng.");
      return;
    }

    // Kiểm tra định dạng số điện thoại nếu có
    if (formData.lienHe && !validationService.validatePhoneFormat(formData.lienHe)) {
      toast.error("Số điện thoại không đúng định dạng. Vui lòng nhập theo định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx");
      return;
    }
    
    // Kiểm tra trùng lặp email
    if (duplicateChecks.emailExists) {
      toast.error("Email này đã được sử dụng. Vui lòng sử dụng mã sinh viên khác.");
      return;
    }
    
    // Kiểm tra trùng lặp số điện thoại
    if (formData.lienHe && duplicateChecks.phoneExists) {
      toast.error("Số điện thoại này đã được sử dụng. Vui lòng sử dụng số điện thoại khác.");
      return;
    }

    // Tạo thông tin tài khoản
    const username = formData.maSV.toLowerCase();
    let password = "";
    if (formData.lienHe) {
      const lastThreeDigits = formData.lienHe.slice(-3);
      password = `${username}${lastThreeDigits}`;
    } else {
      password = username; // Fallback nếu không có số điện thoại
    }

    // Kiểm tra trùng lặp tên đăng nhập
    try {
      const usernameExists = await validationService.checkUsernameExists(username);
      if (usernameExists) {
        toast.error("Mã sinh viên này đã được sử dụng làm tên đăng nhập.");
        return;
      }
    } catch (error) {
      console.error("Lỗi kiểm tra trùng tên đăng nhập:", error);
      toast.error("Lỗi khi kiểm tra tên đăng nhập.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/sinhvien`, {
        ...formData,
        hoTen: formData.hoTen.toLowerCase(),
        userId: username,
        password: password
      }, {
        headers: authHeader(),
      });
      setShowAddSinhVienModal(false);
      toast.success("Sinh viên đã được tạo thành công!");
      fetchSinhVienList();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Đã có lỗi xảy ra khi tạo sinh viên."
      );
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
    });
    setShowEditModal(true);
  };

  // Cập nhật sinh viên
  const handleUpdateSinhVien = async () => {
    if (!formData.hoTen || !formData.email) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    // Kiểm tra định dạng họ tên
    if (!validateHoTenFormat(formData.hoTen)) {
      toast.error("Họ tên chỉ được chứa chữ cái và dấu cách, không chứa số hoặc ký tự đặc biệt.");
      return;
    }

    // Kiểm tra định dạng email
    if (!validationService.validateEmailFormat(formData.email)) {
      toast.error("Email không đúng định dạng. Vui lòng kiểm tra lại.");
      return;
    }

    // Kiểm tra định dạng số điện thoại nếu có
    if (formData.lienHe && !validationService.validatePhoneFormat(formData.lienHe)) {
      toast.error("Số điện thoại không đúng định dạng. Vui lòng nhập theo định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx");
      return;
    }
    
    // Kiểm tra trùng lặp email
    if (duplicateChecks.emailExists) {
      toast.error("Email này đã được sử dụng. Vui lòng sử dụng email khác.");
      return;
    }
    
    // Kiểm tra trùng lặp số điện thoại
    if (formData.lienHe && duplicateChecks.phoneExists) {
      toast.error("Số điện thoại này đã được sử dụng. Vui lòng sử dụng số điện thoại khác.");
      return;
    }

    try {
      const requestData = { 
        ...formData,
        hoTen: formData.hoTen.toLowerCase()
      };
      const response = await axios.put(
        `${API_URL}/sinhvien/${currentSinhVien.maSV}`,
        requestData,
        { headers: authHeader() }
      );
      setShowEditModal(false);
      toast.success("Cập nhật sinh viên thành công!");
      fetchSinhVienList();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Đã có lỗi xảy ra khi cập nhật sinh viên."
      );
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
      await axios.delete(`${API_URL}/sinhvien/${currentSinhVien.maSV}`, {
        headers: authHeader(),
      });
      setShowConfirmModal(false);
      toast.success("Sinh viên đã được xóa thành công!");
      fetchSinhVienList();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Đã có lỗi xảy ra khi xóa sinh viên."
      );
      setShowConfirmModal(false);
    }
  };

  // Hiển thị modal thêm tài khoản
  const handleShowAddAccountModal = async (sinhVien) => {
    setCurrentSinhVien(sinhVien);
    
    if (!sinhVien.lienHe) {
      toast.error("Sinh viên cần có số điện thoại để tạo tài khoản.");
      return;
    }

    const username = sinhVien.maSV.toLowerCase();
    const lastThreeDigits = sinhVien.lienHe.slice(-3);
    const password = `${username}${lastThreeDigits}`;

    try {
      const usernameExists = await validationService.checkUsernameExists(username);
      if (usernameExists) {
        toast.error("Tên đăng nhập đã tồn tại.");
        return;
      }

      const headers = authHeader();
      if (!headers.Authorization) {
        toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      const response = await axios.post(
        `${API_URL}/sinhvien/${sinhVien.maSV}/taikhoan`,
        { userId: username, password: password },
        { headers }
      );
      
      toast.success("Đã thêm tài khoản cho sinh viên thành công!");
      fetchSinhVienList();
      setSinhVienAccounts(prev => ({
        ...prev,
        [sinhVien.idNguoiDung]: true
      }));
    } catch (error) {
      console.error("Lỗi khi thêm tài khoản:", error);
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
        } else {
          toast.error(error.response.data?.message || "Đã có lỗi xảy ra khi thêm tài khoản.");
        }
      } else if (error.request) {
        toast.error("Không thể kết nối đến máy chủ.");
      } else {
        toast.error("Đã có lỗi xảy ra khi thêm tài khoản.");
      }
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

  // Kiểm tra sinh viên có tài khoản chưa
  const hasSinhVienAccount = (sinhVien) => {
    return sinhVienAccounts[sinhVien.idNguoiDung] === true;
  };

  // Lọc danh sách sinh viên theo từ khóa tìm kiếm
  const filteredSinhVien = sinhVienList.filter(
    (sv) =>
      (sv.maSV && sv.maSV.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sv.hoTen && sv.hoTen.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sv.email && sv.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sv.tenLop && sv.tenLop.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Container>
      <ToastContainer />
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Quản lý sinh viên</h5>
            <Button variant="outline-light" onClick={handleShowAddSinhVienModal}>
              <FontAwesomeIcon icon={faUserPlus} /> Thêm sinh viên
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
                    placeholder="Tìm kiếm theo mã SV, họ tên, email, lớp..."
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
                  <th>Mã SV</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Liên hệ</th>
                  <th>Giới tính</th>
                  <th>Lớp</th>
                  <th>Tài khoản</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSinhVien.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
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
                      <td>
                        {sinhVien.tenLop || (
                          <Badge bg="warning">Chưa phân lớp</Badge>
                        )}
                      </td>
                      <td>
                        {hasSinhVienAccount(sinhVien) ? (
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
                            onClick={() => handleShowEditModal(sinhVien)}
                            title="Sửa thông tin"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          {!hasSinhVienAccount(sinhVien) && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="me-1"
                              onClick={() => handleShowAddAccountModal(sinhVien)}
                              title="Thêm tài khoản"
                            >
                              <FontAwesomeIcon icon={faUserLock} />
                            </Button>
                          )}
                          {/* <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleShowDeleteConfirm(sinhVien)}
                            title="Xóa sinh viên"
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

      {/* Modal Thêm sinh viên mới */}
      <Modal
        show={showAddSinhVienModal}
        onHide={() => setShowAddSinhVienModal(false)}
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm sinh viên mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Mã sinh viên <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="maSV"
                    value={formData.maSV}
                    onChange={handleInputChange}
                    isInvalid={validationErrors.maSV}
                    placeholder="VD: N22DCCN181"
                    required
                  />
                  {validationErrors.maSV && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Mã sinh viên phải có định dạng(VD: N22DCCN181)
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Lớp<span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="maLop"
                    value={formData.maLop}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Chọn lớp --</option>
                    {lopHocList.map((lop) => (
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
                  <Form.Label>
                    Họ tên <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="hoTen"
                    value={formData.hoTen}
                    onChange={handleInputChange}
                    isInvalid={validationErrors.hoTen}
                    required
                  />
                  {validationErrors.hoTen && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Họ tên chỉ được chứa chữ cái và dấu cách
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Email <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    isInvalid={validationErrors.email || duplicateChecks.emailExists}
                    required
                  />
                  {validationErrors.email && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Email không đúng định dạng
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
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Số điện thoại không đúng định dạng (VD: 0912345678)
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
                  <Form.Label>
                    Giới tính <span className="text-danger">*</span>
                  </Form.Label>
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
          <Button variant="secondary" onClick={() => setShowAddSinhVienModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddSinhVien}>
            Thêm sinh viên
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Sửa sinh viên */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Sửa sinh viên {currentSinhVien?.hoTen}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã sinh viên</Form.Label>
                  <Form.Control type="text" value={formData.maSV} disabled />
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
                    {lopHocList.map((lop) => (
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
                  <Form.Label>
                    Họ tên <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="hoTen"
                    value={formData.hoTen}
                    onChange={handleInputChange}
                    isInvalid={validationErrors.hoTen}
                    required
                  />
                  {validationErrors.hoTen && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Họ tên chỉ được chứa chữ cái và dấu cách
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Email <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    isInvalid={validationErrors.email || duplicateChecks.emailExists}
                    required
                  />
                  {validationErrors.email && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Email không đúng định dạng
                    </Form.Control.Feedback>
                  )}
                  {!validationErrors.email && duplicateChecks.emailExists && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faInfoCircle} /> Email này đã được sử dụng
                    </Form.Control.Feedback>
                  )}
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
                    isInvalid={validationErrors.lienHe || duplicateChecks.phoneExists}
                  />
                  {validationErrors.lienHe && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Số điện thoại không đúng định dạng (VD: 0912345678)
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
                  <Form.Label>
                    Giới tính <span className="text-danger">*</span>
                  </Form.Label>
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
          <p>
            Bạn có chắc chắn muốn xóa sinh viên{" "}
            <strong>{currentSinhVien?.hoTen}</strong>?
          </p>
          <p className="text-danger">
            Lưu ý: Hành động này không thể hoàn tác và sẽ xóa cả thông tin người
            dùng và tài khoản.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
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