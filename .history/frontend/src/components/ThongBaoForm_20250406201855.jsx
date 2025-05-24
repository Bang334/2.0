import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert, Row, Col, InputGroup, Tabs, Tab } from "react-bootstrap";
import UserService from "../services/user.service";

const ThongBaoForm = ({ isGiangVien = false, onSuccess, onError, onSendComplete }) => {
  const [formData, setFormData] = useState({
    tieuDe: "",
    noiDung: "",
    danhSachNguoiNhan: [],
    guiChoLop: false,
    maLop: "",
  });
  const [danhSachNguoiNhan, setDanhSachNguoiNhan] = useState([]);
  const [danhSachLop, setDanhSachLop] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("nguoinhan");
  const [searchTerm, setSearchTerm] = useState("");
  const [loaiNguoiNhan, setLoaiNguoiNhan] = useState("all"); // "all", "giangvien", "sinhvien"

  useEffect(() => {
    fetchDanhSachNguoiNhan();
    fetchDanhSachLop();
  }, [isGiangVien]);

  const fetchDanhSachNguoiNhan = async () => {
    try {
      setLoadingData(true);
      setError("");
      
      // Lấy thông tin người dùng hiện tại
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const currentUserId = currentUser?.idNguoiDung || currentUser?.id;
      
      // Gọi API lấy danh sách người nhận
      const response = isGiangVien 
        ? await UserService.getDanhSachNguoiNhanGV() 
        : await UserService.getDanhSachNguoiNhan();
        
      console.log("Response người nhận:", response.data);
      
      // Tạo một mảng danh sách người dùng trống
      let userList = [];
      console.log("Response người nhận111:", response.data);
      // Nếu dữ liệu trả về chứa mảng giangViens và sinhViens
      if (response.data && typeof response.data === 'object') {
        // Truy cập trực tiếp vào thuộc tính chứa danh sách giảng viên
        // if (response.data.giangViens && Array.isArray(response.data.giangViens)) {
        //   userList = [...userList, ...response.data.giangViens.map(gv => ({
        //     idNguoiDung: gv.id,
        //     hoTen: gv.ten,
        //     vaiTro: "Giảng viên"
        //   }))];
        // }
        
        // // Truy cập trực tiếp vào thuộc tính chứa danh sách sinh viên
        // if (response.data.sinhViens && Array.isArray(response.data.sinhViens)) {
        //   userList = [...userList, ...response.data.sinhViens.map(sv => ({
        //     idNguoiDung: sv.id,
        //     hoTen: sv.ten,
        //     vaiTro: "Sinh viên",
        //     maLop: sv.maLop || ""
        //   }))];
        // }
        
        // Nếu có danh sách allUsers thì sử dụng
        if (response.data && Array.isArray(response.data)) {
          userList = [...userList, ...response.data.map(user => ({
            idNguoiDung: user.id,
            hoTen: user.ten,
            vaiTro: user.vaiTro || "Không xác định",
            maLop: user.maLop || ""
          }))];
        }
      } 
      else if (Array.isArray(response.data)) {
        // Nếu API trả về mảng trực tiếp
        userList = response.data.map(user => ({
          idNguoiDung: user.idNguoiDung,
          hoTen: user.hoTen,
          vaiTro: user.vaiTro || "Không xác định",
          maLop: user.maLop || ""
        }));
      }
      // const filteredUsers = userList.filter(user => 
      //   user.idNguoiDung !== currentUserId && // không phải người dùng hiện tại
      //   (user.vaiTro === "Sinh viên" || user.vaiTro === "Giảng viên") // chỉ SV và GV
      // );
      
      // Loại bỏ trùng lặp nếu có
      const uniqueUsers = Array.from(
        new Map(filteredUsers.map(user => [user.idNguoiDung, user])).values()
      );
      
      console.log("Danh sách người nhận đã xử lý:", uniqueUsers);
      setDanhSachNguoiNhan(uniqueUsers);
      setLoadingData(false);
    } catch (err) {
      console.error("Error fetching recipient list:", err);
      setError("Không thể tải danh sách người nhận: " + (err.message || ""));
      setDanhSachNguoiNhan([]);
      setLoadingData(false);
    }
  };

  const fetchDanhSachLop = async () => {
    try {
      setLoadingData(true);
      const response = isGiangVien 
        ? await UserService.getDanhSachLopHocGV() 
        : await UserService.getDanhSachLop();
        
      console.log("Response lớp học:", response);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error("Lỗi: Dữ liệu lớp học không phải là mảng:", response.data);
        setDanhSachLop([]);
        setError(prevError => prevError || "Dữ liệu lớp học không hợp lệ");
        setLoadingData(false);
        return;
      }
      
      // Đảm bảo mỗi lớp có mã lớp duy nhất
      const enhancedLopData = response.data.map((lop, index) => ({
        ...lop,
        maLop: lop.maLop || lop.id || `lop-${index}`,
        tenLop: lop.tenLop || lop.ten || lop.maLop || `Lớp ${index+1}`
      }));
      
      setDanhSachLop(enhancedLopData);
      setLoadingData(false);
    } catch (err) {
      console.error("Error fetching class list:", err);
      setError(prevError => prevError || "Không thể tải danh sách lớp. " + (err.message || ""));
      setDanhSachLop([]);
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNguoiNhanChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }

    setFormData({
      ...formData,
      danhSachNguoiNhan: selectedValues,
    });
  };

  const handleLopChange = (e) => {
    setFormData({
      ...formData,
      maLop: e.target.value,
      guiChoLop: !!e.target.value
    });
  };

  const handleFilterChange = (e) => {
    setLoaiNguoiNhan(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredNguoiNhan = danhSachNguoiNhan.filter(nguoiNhan => {
    // Lọc theo loại người nhận
    if (loaiNguoiNhan !== "all") {
      if (loaiNguoiNhan === "giangvien" && nguoiNhan.vaiTro !== "Giảng viên") return false;
      if (loaiNguoiNhan === "sinhvien" && nguoiNhan.vaiTro !== "Sinh viên") return false;
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (nguoiNhan.hoTen || "").toLowerCase().includes(searchLower) ||
        (nguoiNhan.idNguoiDung || "").toLowerCase().includes(searchLower) ||
        (nguoiNhan.maLop || "").toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    // Kiểm tra dữ liệu đầu vào
    if (!formData.tieuDe || !formData.noiDung) {
      setError("Vui lòng điền đầy đủ tiêu đề và nội dung thông báo");
      return;
    }
    
    if (activeTab === "nguoinhan" && formData.danhSachNguoiNhan.length === 0) {
      setError("Vui lòng chọn ít nhất một người nhận");
      return;
    }
    
    if (activeTab === "lophoc" && !formData.maLop) {
      setError("Vui lòng chọn lớp học");
      return;
    }

    // Lấy thông tin người dùng hiện tại
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const userIdNguoiDung = currentUser?.idNguoiDung;
    
    // Loại bỏ người dùng hiện tại khỏi danh sách người nhận (không thể gửi cho chính mình)
    let danhSachNguoiNhanFiltered = formData.danhSachNguoiNhan;
    if (userIdNguoiDung && activeTab === "nguoinhan") {
      danhSachNguoiNhanFiltered = formData.danhSachNguoiNhan.filter(id => id !== userIdNguoiDung);
      
      if (danhSachNguoiNhanFiltered.length === 0) {
        setError("Không thể gửi thông báo cho chính mình");
        return;
      }
      
      if (danhSachNguoiNhanFiltered.length !== formData.danhSachNguoiNhan.length) {
        console.log("Đã loại bỏ người dùng hiện tại khỏi danh sách người nhận");
      }
    }

    // Chuẩn bị dữ liệu gửi đi
    const requestData = {
      tieuDe: formData.tieuDe,
      noiDung: formData.noiDung,
      danhSachNguoiNhan: activeTab === "nguoinhan" ? danhSachNguoiNhanFiltered : [],
      guiChoLop: activeTab === "lophoc",
      maLop: activeTab === "lophoc" ? formData.maLop : ""
    };

    try {
      setLoading(true);
      const response = isGiangVien 
        ? await UserService.guiThongBaoGV(requestData) 
        : await UserService.guiThongBao(requestData);
      
      setMessage(response.data.message || "Gửi thông báo thành công");
      if (onSuccess) onSuccess(response.data.message || "Gửi thông báo thành công");
      
      // Reset form
      setFormData({
        tieuDe: "",
        noiDung: "",
        danhSachNguoiNhan: [],
        guiChoLop: false,
        maLop: "",
      });
      
      setLoading(false);
      
      // Gọi callback để cập nhật danh sách thông báo đã gửi
      if (onSendComplete) onSendComplete();
    } catch (err) {
      console.error("Error sending notification:", err);
      setError(err.response?.data?.message || "Không thể gửi thông báo");
      if (onError) onError(err.response?.data?.message || "Không thể gửi thông báo");
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Body>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="nguoinhan" title="Gửi cho người nhận">
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Lọc theo vai trò</Form.Label>
                    <Form.Select
                      value={loaiNguoiNhan}
                      onChange={handleFilterChange}
                    >
                      <option value="all">Tất cả</option>
                      <option value="giangvien">Chỉ giảng viên</option>
                      <option value="sinhvien">Chỉ sinh viên</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Tìm kiếm</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Tìm theo tên, mã, lớp..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                      {searchTerm && (
                        <Button 
                          variant="outline-secondary"
                          onClick={() => setSearchTerm("")}
                        >
                          X
                        </Button>
                      )}
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Chọn người nhận</Form.Label>
                {loadingData ? (
                  <div className="text-center p-3">Đang tải danh sách người nhận...</div>
                ) : (
                  <Form.Control
                    as="select"
                    multiple
                    size={10}
                    name="danhSachNguoiNhan"
                    value={formData.danhSachNguoiNhan}
                    onChange={handleNguoiNhanChange}
                    required={activeTab === "nguoinhan"}
                  >
                    {filteredNguoiNhan.length > 0 ? (
                      filteredNguoiNhan.map((nguoiNhan) => (
                        // Đảm bảo mỗi người nhận có một key duy nhất
                        <option 
                          key={nguoiNhan.idNguoiDung || `user-${nguoiNhan.hoTen}-${Math.random().toString(36).substr(2, 9)}`} 
                          value={nguoiNhan.idNguoiDung}
                        >
                          {nguoiNhan.hoTen} - {nguoiNhan.vaiTro} {nguoiNhan.maLop ? `(Lớp: ${nguoiNhan.maLop})` : ''}
                        </option>
                      ))
                    ) : (
                      <option key="no-recipients" disabled>Không có người nhận nào phù hợp</option>
                    )}
                  </Form.Control>
                )}
                <Form.Text className="text-muted">
                  {filteredNguoiNhan.length} người nhận được hiển thị. Giữ phím Ctrl (Windows) hoặc Command (Mac) để chọn nhiều người nhận.
                </Form.Text>
              </Form.Group>
            </Tab>
            
            <Tab eventKey="lophoc" title="Gửi cho lớp">
              <Form.Group className="mb-3">
                <Form.Label>Chọn lớp</Form.Label>
                {loadingData ? (
                  <div className="text-center p-3">Đang tải danh sách lớp...</div>
                ) : (
                  <Form.Select
                    name="maLop"
                    value={formData.maLop}
                    onChange={handleLopChange}
                    required={activeTab === "lophoc"}
                  >
                    <option value="">-- Chọn lớp học --</option>
                    {danhSachLop.length > 0 ? (
                      danhSachLop.map((lop) => (
                        // Đảm bảo mỗi lớp có key duy nhất
                        <option 
                          key={lop.maLop || `lop-${Math.random().toString(36).substr(2, 9)}`} 
                          value={lop.maLop}
                        >
                          {lop.tenLop || lop.maLop}
                        </option>
                      ))
                    ) : (
                      <option key="no-classes" disabled>Không có lớp học nào</option>
                    )}
                  </Form.Select>
                )}
                <Form.Text className="text-muted">
                  Thông báo sẽ được gửi đến tất cả sinh viên thuộc lớp này
                </Form.Text>
              </Form.Group>
            </Tab>
          </Tabs>
          
          <Form.Group className="mb-3">
            <Form.Label>Tiêu đề</Form.Label>
            <Form.Control
              type="text"
              name="tieuDe"
              value={formData.tieuDe}
              onChange={handleInputChange}
              placeholder="Nhập tiêu đề thông báo"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Nội dung</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              name="noiDung"
              value={formData.noiDung}
              onChange={handleInputChange}
              placeholder="Nhập nội dung thông báo"
              required
            />
          </Form.Group>
          
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi thông báo"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ThongBaoForm; 