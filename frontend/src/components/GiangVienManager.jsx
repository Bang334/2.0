import React, { useState, useEffect, useCallback } from "react";
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
  ProgressBar,
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
  faChartBar,
  faUserPlus,
  faExclamationTriangle,
  faInfoCircle,
  faTimes,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import validationService from "../services/validation.service";
import { debounce } from "lodash";

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
  const [isLoading, setIsLoading] = useState(false);

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

  // Thêm hàm debounce cho việc kiểm tra trùng lặp
  const debouncedCheckDuplicateMaGV = useCallback(
    debounce(async (value) => {
      if (!value) return;
      setDuplicateChecks((prev) => ({ ...prev, isChecking: true }));
      try {
        const excludeId = currentGiangVien
          ? currentGiangVien.idNguoiDung
          : null;
        const exists = await validationService.checkUsernameExists(
          value,
          excludeId
        );
        setDuplicateChecks((prev) => ({
          ...prev,
          maGVExists: exists,
          isChecking: false,
        }));
      } catch (error) {
        console.error("Lỗi kiểm tra trùng mã giảng viên:", error);
        setDuplicateChecks((prev) => ({ ...prev, isChecking: false }));
      }
    }, 500),
    [currentGiangVien]
  );

  const debouncedCheckDuplicateEmail = useCallback(
    debounce(async (value) => {
      if (!value) return;
      setDuplicateChecks((prev) => ({ ...prev, isChecking: true }));
      try {
        const excludeId = currentGiangVien
          ? currentGiangVien.idNguoiDung
          : null;
        const exists = await validationService.checkEmailExists(
          value,
          excludeId
        );
        setDuplicateChecks((prev) => ({
          ...prev,
          emailExists: exists,
          isChecking: false,
        }));
      } catch (error) {
        console.error("Lỗi kiểm tra trùng email:", error);
        setDuplicateChecks((prev) => ({ ...prev, isChecking: false }));
      }
    }, 500),
    [currentGiangVien]
  );

  const debouncedCheckDuplicatePhone = useCallback(
    debounce(async (value) => {
      if (!value) return;
      setDuplicateChecks((prev) => ({ ...prev, isChecking: true }));
      try {
        const excludeId = currentGiangVien
          ? currentGiangVien.idNguoiDung
          : null;
        const exists = await validationService.checkPhoneExists(
          value,
          excludeId
        );
        setDuplicateChecks((prev) => ({
          ...prev,
          phoneExists: exists,
          isChecking: false,
        }));
      } catch (error) {
        console.error("Lỗi kiểm tra trùng số điện thoại:", error);
        setDuplicateChecks((prev) => ({ ...prev, isChecking: false }));
      }
    }, 500),
    [currentGiangVien]
  );

  // Lấy danh sách giảng viên khi component được render
  useEffect(() => {
    fetchGiangVienList();
  }, []);

  // Lấy danh sách giảng viên khi refreshKey thay đổi
  useEffect(() => {
    if (refreshKey) {
      console.log(
        "GiangVienManager refreshing due to refreshKey change:",
        refreshKey
      );
      fetchGiangVienList();
    }
  }, [refreshKey]);

  // Lấy danh sách giảng viên từ API
  const fetchGiangVienList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/giangvien`, {
        headers: authHeader(),
      });
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
      giangVienData.forEach((gv) => {
        const taiKhoan = taiKhoanList.find(
          (tk) => tk.idNguoiDung === gv.idNguoiDung
        );
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
      const response = await axios.get(`${API_URL}/giangvien/thongke`, {
        headers: authHeader(),
      });
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

  // Cập nhật hàm handleInputChange
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "maGV") {
      newValue = value.toLowerCase();
      // Tự động tạo email từ mã giảng viên
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
        email: `${newValue}@lecturer.ptithcm.edu.vn`,
      }));
      return;
    }

    // Không cho phép chỉnh sửa email
    if (name === "email") {
      return;
    }

    // Kiểm tra định dạng số điện thoại
    if (name === "lienHe") {
      // Chỉ cho phép nhập số và dấu +
      newValue = value.replace(/[^0-9+]/g, "");

      // Kiểm tra định dạng
      const phoneRegex = /^(0|\+84)\d{9}$/;
      const isValidFormat = !newValue || phoneRegex.test(newValue);

      setValidationErrors((prev) => ({
        ...prev,
        lienHe: !isValidFormat,
      }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Kiểm tra trùng lặp khi người dùng nhập
    if (name === "maGV" && newValue.length >= 3) {
      checkDuplicate("maGV", newValue);
    } else if (name === "email" && newValue.length >= 3) {
      checkDuplicate("email", newValue);
    } else if (name === "lienHe" && newValue.length >= 10) {
      checkDuplicate("lienHe", newValue);
    }
  };

  // Thêm hàm mới để xử lý khi người dùng nhập mã giảng viên
  const handleMaGVChange = (e) => {
    const { value } = e.target;
    const newMaGV = value.toLowerCase();

    setFormData((prev) => ({
      ...prev,
      maGV: newMaGV,
      email: `${newMaGV}@lecturer.ptithcm.edu.vn`,
    }));

    if (newMaGV.length >= 3) {
      checkDuplicate("maGV", newMaGV);
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
    // Kiểm tra validation trước khi cập nhật
    const errors = {};
    const { maGV, hoTen, email, lienHe, gioiTinh, khoa } = formData;

    // Kiểm tra null hoặc empty
    if (!maGV || maGV.trim() === "") {
      errors.maGV = "Mã giảng viên không được để trống";
    } else if (maGV.length < 3 || maGV.length > 10) {
      errors.maGV = "Mã giảng viên phải từ 3-10 ký tự";
    } else if (/\s/.test(maGV)) {
      errors.maGV = "Mã giảng viên không được chứa khoảng trắng";
    }

    if (!hoTen || hoTen.trim() === "") {
      errors.hoTen = "Họ tên không được để trống";
    } else if (hoTen.length < 2 || hoTen.length > 50) {
      errors.hoTen = "Họ tên phải từ 2-50 ký tự";
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(hoTen)) {
      errors.hoTen = "Họ tên chỉ được chứa chữ cái và dấu cách";
    }

    if (!email || email.trim() === "") {
      errors.email = "Email không được để trống";
    }

    if (!lienHe || lienHe.trim() === "") {
      errors.lienHe = "Số điện thoại không được để trống";
    } else if (!/^(0|\+84)\d{9}$/.test(lienHe)) {
      errors.lienHe =
        "Số điện thoại phải có định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx";
    }

    if (!gioiTinh || gioiTinh.trim() === "") {
      errors.gioiTinh = "Vui lòng chọn giới tính";
    }

    if (!khoa || khoa.trim() === "") {
      errors.khoa = "Vui lòng chọn khoa";
    }

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng kiểm tra lại các thông tin bắt buộc!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    try {
      await axios.put(`${API_URL}/giangvien/${formData.maGV}`, formData, {
        headers: authHeader(),
      });
      setShowEditModal(false);
      toast.success("Cập nhật giảng viên thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      fetchGiangVienList();
    } catch (error) {
      console.error("Lỗi khi cập nhật giảng viên:", error);
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else {
          toast.error(
            error.response.data?.message ||
              "Có lỗi xảy ra khi cập nhật giảng viên!",
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            }
          );
        }
      } else if (error.request) {
        toast.error("Không thể kết nối đến server. Vui lòng thử lại sau.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
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
      await axios.delete(`${API_URL}/giangvien/${currentGiangVien.maGV}`, {
        headers: authHeader(),
      });
      setShowConfirmModal(false);
      toast.success("Giảng viên đã được xóa thành công!", {
        position: "top-center",
        autoClose: 3000,
      });
      fetchGiangVienList();
    } catch (error) {
      console.error("Lỗi khi xóa giảng viên:", error);
      toast.error(
        error.response?.data?.message || "Đã có lỗi xảy ra khi xóa giảng viên.",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
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
  const filteredGiangVien = giangVienList.filter(
    (gv) =>
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
    // Kiểm tra validation trước khi thêm
    const errors = {};
    const { maGV, hoTen, email, lienHe, gioiTinh, khoa } = formData;

    // Kiểm tra null hoặc empty
    if (!maGV || maGV.trim() === "") {
      errors.maGV = "Mã giảng viên không được để trống";
    } else if (maGV.length < 3 || maGV.length > 10) {
      errors.maGV = "Mã giảng viên phải từ 3-10 ký tự";
    } else if (/\s/.test(maGV)) {
      errors.maGV = "Mã giảng viên không được chứa khoảng trắng";
    }

    if (!hoTen || hoTen.trim() === "") {
      errors.hoTen = "Họ tên không được để trống";
    } else if (hoTen.length < 2 || hoTen.length > 50) {
      errors.hoTen = "Họ tên phải từ 2-50 ký tự";
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(hoTen)) {
      errors.hoTen = "Họ tên chỉ được chứa chữ cái và dấu cách";
    }

    if (!email || email.trim() === "") {
      errors.email = "Email không được để trống";
    }

    if (!lienHe || lienHe.trim() === "") {
      errors.lienHe = "Số điện thoại không được để trống";
    } else if (!/^(0|\+84)\d{9}$/.test(lienHe)) {
      errors.lienHe =
        "Số điện thoại phải có định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx";
    }

    if (!gioiTinh || gioiTinh.trim() === "") {
      errors.gioiTinh = "Vui lòng chọn giới tính";
    }

    if (!khoa || khoa.trim() === "") {
      errors.khoa = "Vui lòng chọn khoa";
    }

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng kiểm tra lại các thông tin bắt buộc!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    // Tạo thông tin tài khoản
    const username = formData.maGV.toLowerCase();
    const lastThreeDigits = formData.lienHe.slice(-3);
    const password = `${username}${lastThreeDigits}`;

    // Kiểm tra trùng lặp tên đăng nhập
    try {
      const usernameExists = await validationService.checkUsernameExists(
        username
      );
      if (usernameExists) {
        toast.error("Mã giảng viên này đã được sử dụng làm tên đăng nhập.");
        return;
      }
    } catch (error) {
      console.error("Lỗi kiểm tra trùng tên đăng nhập:", error);
      toast.error("Lỗi khi kiểm tra tên đăng nhập.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/giangvien`,
        {
          ...formData,
          userId: username,
          password: password,
        },
        {
          headers: authHeader(),
        }
      );
      setShowAddGiangVienModal(false);
      toast.success("Giảng viên đã được tạo thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      fetchGiangVienList();
    } catch (error) {
      console.error("Lỗi khi thêm giảng viên:", error);
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else {
          toast.error(
            error.response.data?.message ||
              "Có lỗi xảy ra khi thêm giảng viên!",
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            }
          );
        }
      } else if (error.request) {
        toast.error("Không thể kết nối đến server. Vui lòng thử lại sau.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };

  // Kiểm tra giảng viên có tài khoản chưa
  const hasTaiKhoan = (giangVien) => {
    return giangVienAccounts[giangVien.idNguoiDung] === true;
  };

  // Hàm validation chung
  const validateForm = () => {
    const errors = {};
    const { maGV, hoTen, email, lienHe, gioiTinh, khoa } = formData;

    // Kiểm tra null hoặc empty
    if (!maGV || maGV.trim() === "") {
      errors.maGV = "Mã giảng viên không được để trống";
    } else if (maGV.length < 3 || maGV.length > 10) {
      errors.maGV = "Mã giảng viên phải từ 3-10 ký tự";
    } else if (/\s/.test(maGV)) {
      errors.maGV = "Mã giảng viên không được chứa khoảng trắng";
    }

    if (!hoTen || hoTen.trim() === "") {
      errors.hoTen = "Họ tên không được để trống";
    } else if (hoTen.length < 2 || hoTen.length > 50) {
      errors.hoTen = "Họ tên phải từ 2-50 ký tự";
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(hoTen)) {
      errors.hoTen = "Họ tên chỉ được chứa chữ cái và dấu cách";
    }

    if (!email || email.trim() === "") {
      errors.email = "Email không được để trống";
    }

    if (!lienHe || lienHe.trim() === "") {
      errors.lienHe = "Số điện thoại không được để trống";
    } else if (!/^(0|\+84)\d{9}$/.test(lienHe)) {
      errors.lienHe =
        "Số điện thoại phải có định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx";
    }

    if (!gioiTinh || gioiTinh.trim() === "") {
      errors.gioiTinh = "Vui lòng chọn giới tính";
    }

    if (!khoa || khoa.trim() === "") {
      errors.khoa = "Vui lòng chọn khoa";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <Container>
      <ToastContainer />
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Quản lý giảng viên</h5>
          <div>
            <Button
              variant="outline-light"
              onClick={handleShowAddGiangVienModal}
              className="me-2"
              id="add-giangvien-btn"
            >
              <FontAwesomeIcon icon={faUserPlus} /> Thêm giảng viên mới
            </Button>
            <Button
              variant="outline-light"
              onClick={handleShowStatsModal}
              id="giangvien-stats-btn"
            >
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
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredGiangVien.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      Không có giảng viên nào
                    </td>
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
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-primary">
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Sửa thông tin giảng viên
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Mã giảng viên <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="maGV"
                    value={formData.maGV}
                    onChange={handleInputChange}
                    placeholder="Nhập mã giảng viên (3-10 ký tự)"
                    isInvalid={validationErrors.maGV}
                    className="shadow-sm"
                    readOnly
                  />
                  {validationErrors.maGV && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} />{" "}
                      {validationErrors.maGV}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Họ tên <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="hoTen"
                    value={formData.hoTen}
                    onChange={handleInputChange}
                    placeholder="Nhập họ tên (2-50 ký tự)"
                    isInvalid={validationErrors.hoTen}
                    className="shadow-sm"
                  />
                  {validationErrors.hoTen && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} />{" "}
                      {validationErrors.hoTen}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Email <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email sẽ được tự động tạo từ mã giảng viên"
                    isInvalid={validationErrors.email}
                    className="shadow-sm"
                    readOnly
                  />
                  {validationErrors.email && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} />{" "}
                      {validationErrors.email}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Số điện thoại <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="lienHe"
                    value={formData.lienHe}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại (0xxxxxxxxx hoặc +84xxxxxxxxx)"
                    isInvalid={validationErrors.lienHe}
                    className="shadow-sm"
                  />
                  {validationErrors.lienHe && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} />{" "}
                      {validationErrors.lienHe}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Giới tính <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="gioiTinh"
                    value={formData.gioiTinh}
                    onChange={handleInputChange}
                    isInvalid={validationErrors.gioiTinh}
                    className="shadow-sm"
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nu">Nữ</option>
                    <option value="KhongXacDinh">Không xác định</option>
                  </Form.Select>
                  {validationErrors.gioiTinh && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} />{" "}
                      {validationErrors.gioiTinh}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Khoa <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="khoa"
                    value={formData.khoa}
                    onChange={handleInputChange}
                    isInvalid={validationErrors.khoa}
                    className="shadow-sm"
                  >
                    <option value="">-- Chọn khoa --</option>
                    {khoaList.map((khoa) => (
                      <option key={khoa} value={khoa}>
                        {khoa}
                      </option>
                    ))}
                  </Form.Select>
                  {validationErrors.khoa && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} />{" "}
                      {validationErrors.khoa}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Hủy
          </Button>
          <Button variant="primary" onClick={handleUpdateGiangVien}>
            <FontAwesomeIcon icon={faSave} className="me-2" />
            Lưu thay đổi
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
            Bạn có chắc chắn muốn xóa giảng viên{" "}
            <strong>{currentGiangVien?.hoTen}</strong>?
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
          <Button variant="danger" onClick={handleDeleteGiangVien}>
            Xóa giảng viên
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Thống kê giảng viên */}
      <Modal
        show={showStatsModal}
        onHide={() => setShowStatsModal(false)}
        size="lg"
      >
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
                      <h2 className="display-4">
                        {statsData?.tongSo || giangVienList.length}
                      </h2>
                      <p className="text-muted">Tổng số giảng viên</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="text-center">
                  <Card className="h-100">
                    <Card.Body>
                      <h2 className="display-4">
                        {statsData?.soYeuCauMuonPhong || 0}
                      </h2>
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
                  {statsData?.thongKeTheoKhoa
                    ? Object.entries(statsData.thongKeTheoKhoa).map(
                        ([khoa, soLuong]) => {
                          const tyLe =
                            (soLuong /
                              (statsData.tongSo || giangVienList.length)) *
                            100;
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
                        }
                      )
                    : (() => {
                        const khoaCount = {};
                        giangVienList.forEach((gv) => {
                          const khoa = gv.khoa || "Chưa phân khoa";
                          khoaCount[khoa] = (khoaCount[khoa] || 0) + 1;
                        });
                        return Object.entries(khoaCount).map(
                          ([khoa, soLuong]) => {
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
                          }
                        );
                      })()}
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
                      {Object.entries(statsData.thongKeGioiTinh).map(
                        ([gioiTinh, soLuong]) => {
                          const tyLe =
                            (soLuong /
                              (statsData.tongSo || giangVienList.length)) *
                            100;
                          let displayGioiTinh = gioiTinh;
                          switch (gioiTinh) {
                            case "Nam":
                              displayGioiTinh = "Nam";
                              break;
                            case "Nu":
                              displayGioiTinh = "Nữ";
                              break;
                            case "KhongXacDinh":
                              displayGioiTinh = "Không xác định";
                              break;
                            default:
                              displayGioiTinh = gioiTinh;
                          }
                          return (
                            <tr key={gioiTinh}>
                              <td>{displayGioiTinh}</td>
                              <td>{soLuong}</td>
                              <td>
                                <ProgressBar
                                  now={tyLe}
                                  label={`${Math.round(tyLe)}%`}
                                  variant={
                                    gioiTinh === "Nam"
                                      ? "primary"
                                      : gioiTinh === "Nu"
                                      ? "danger"
                                      : "secondary"
                                  }
                                />
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </Table>
                </>
              )}
              {statsData?.topMuonPhong && statsData.topMuonPhong.length > 0 && (
                <>
                  <h5 className="mb-3">
                    Top 5 giảng viên mượn phòng nhiều nhất
                  </h5>
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
                            <Badge bg="primary" pill>
                              {item.soLanMuon}
                            </Badge>
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
      <Modal
        show={showAddGiangVienModal}
        onHide={() => setShowAddGiangVienModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-primary">
            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
            Thêm giảng viên mới
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Mã giảng viên <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="maGV"
                    value={formData.maGV}
                    onChange={handleMaGVChange}
                    placeholder="Nhập mã giảng viên (3-10 ký tự)"
                    isInvalid={
                      validationErrors.maGV || duplicateChecks.maGVExists
                    }
                    className="shadow-sm"
                  />
                  {validationErrors.maGV && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Mã giảng
                      viên không được chứa khoảng trắng
                    </Form.Control.Feedback>
                  )}
                  {!validationErrors.maGV && duplicateChecks.maGVExists && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faInfoCircle} /> Mã giảng viên này
                      đã tồn tại
                    </Form.Control.Feedback>
                  )}
                  {duplicateChecks.isChecking &&
                    formData.maGV &&
                    formData.maGV.length >= 3 && (
                      <div className="mt-1">
                        <Spinner animation="border" size="sm" /> Đang kiểm
                        tra...
                      </div>
                    )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Họ tên <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="hoTen"
                    value={formData.hoTen}
                    onChange={handleInputChange}
                    placeholder="Nhập họ tên (2-50 ký tự)"
                    isInvalid={validationErrors.hoTen}
                    className="shadow-sm"
                  />
                  <Form.Control.Feedback type="invalid">
                    <FontAwesomeIcon icon={faExclamationTriangle} /> Họ tên phải
                    từ 2-50 ký tự, chỉ bao gồm chữ cái và dấu cách
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Email <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email sẽ được tự động tạo từ mã giảng viên"
                    isInvalid={
                      validationErrors.email || duplicateChecks.emailExists
                    }
                    className="shadow-sm"
                    readOnly
                  />
                  {validationErrors.email && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Email
                      phải kết thúc bằng @lecturer.ptithcm.edu.vn
                    </Form.Control.Feedback>
                  )}
                  {!validationErrors.email && duplicateChecks.emailExists && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faInfoCircle} /> Email này đã được
                      sử dụng
                    </Form.Control.Feedback>
                  )}
                  {duplicateChecks.isChecking &&
                    formData.email &&
                    formData.email.length >= 3 && (
                      <div className="mt-1">
                        <Spinner animation="border" size="sm" /> Đang kiểm
                        tra...
                      </div>
                    )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Số điện thoại <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="lienHe"
                    value={formData.lienHe}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại (0xxxxxxxxx hoặc +84xxxxxxxxx)"
                    isInvalid={
                      validationErrors.lienHe || duplicateChecks.phoneExists
                    }
                    className="shadow-sm"
                  />
                  {validationErrors.lienHe && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faExclamationTriangle} /> Số điện
                      thoại phải có định dạng 0xxxxxxxxx hoặc +84xxxxxxxxx
                    </Form.Control.Feedback>
                  )}
                  {!validationErrors.lienHe && duplicateChecks.phoneExists && (
                    <Form.Control.Feedback type="invalid">
                      <FontAwesomeIcon icon={faInfoCircle} /> Số điện thoại này
                      đã được sử dụng
                    </Form.Control.Feedback>
                  )}
                  {duplicateChecks.isChecking &&
                    formData.lienHe &&
                    formData.lienHe.length >= 10 && (
                      <div className="mt-1">
                        <Spinner animation="border" size="sm" /> Đang kiểm
                        tra...
                      </div>
                    )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Giới tính <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="gioiTinh"
                    value={formData.gioiTinh}
                    onChange={handleInputChange}
                    isInvalid={validationErrors.gioiTinh}
                    className="shadow-sm"
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nu">Nữ</option>
                    <option value="KhongXacDinh">Không xác định</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    <FontAwesomeIcon icon={faExclamationTriangle} /> Vui lòng
                    chọn giới tính
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Khoa <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="khoa"
                    value={formData.khoa}
                    onChange={handleInputChange}
                    isInvalid={validationErrors.khoa}
                    className="shadow-sm"
                  >
                    <option value="">-- Chọn khoa --</option>
                    {khoaList.map((khoa) => (
                      <option key={khoa} value={khoa}>
                        {khoa}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    <FontAwesomeIcon icon={faExclamationTriangle} /> Vui lòng
                    chọn khoa
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button
            variant="secondary"
            onClick={() => setShowAddGiangVienModal(false)}
          >
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleAddGiangVien}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Đang xử lý...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Thêm giảng viên
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GiangVienManager;
