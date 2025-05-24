import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, Table, Badge, Modal, Nav, Tab } from "react-bootstrap";
import { format } from 'date-fns';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import UserService from "../services/user.service";
import axios from "axios";
import authHeader from "../services/auth-header";
import { API_URL } from "../services/api";

const MuonPhongManager = ({ 
  yeuCauMuonPhong, 
  lichSuMuonPhong,
  danhSachPhong, 
  onError, 
  onSuccess, 
  onRefresh,
  isGiangVien = false
}) => {
  // Form states
  const [muonPhongForm, setMuonPhongForm] = useState({ 
    maPhong: "", 
    thoiGianMuon: null,
    thoiGianTra: null,
    mucDich: "" 
  });
  const [phanHoiForm, setPhanHoiForm] = useState({ maYeuCau: "", danhGia: 5, nhanXet: "" });
  
  // Modal states
  const [showPhanHoiModal, setShowPhanHoiModal] = useState(false);
  const [showSuCoModal, setShowSuCoModal] = useState(false);
  const [showChiTietModal, setShowChiTietModal] = useState(false);
  const [showXacNhanTraModal, setShowXacNhanTraModal] = useState(false);
  const [showXacNhanHuyModal, setShowXacNhanHuyModal] = useState(false);
  const [suCoForm, setSuCoForm] = useState({ maYeuCau: "", maLichSu: null, moTa: "" });
  const [selectedYeuCau, setSelectedYeuCau] = useState(null);
  const [loading, setLoading] = useState(false);
  const [daDanhGiaList, setDaDanhGiaList] = useState({});
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState("requests");

  // Time intervals and filters
  const timeIntervals = 30;

  // Fetch feedback status when component loads or when lichSuMuon changes
  useEffect(() => {
    fetchDanhGiaStatus();
  }, [yeuCauMuonPhong, lichSuMuonPhong]);

  // Fetch status of feedback for all requests
  const fetchDanhGiaStatus = async () => {
    try {
      // Get all request IDs that might need feedback (from both sources)
      const yeucauIDs = yeuCauMuonPhong
        .filter(yc => yc.trangThai === 'DADUYET' && yc.thoiGianTra)
        .map(yc => yc.maYeuCau);
      
      // Make sure lichSuMuonPhong is defined before using it
      const lichsuIDs = lichSuMuonPhong && lichSuMuonPhong.length > 0 ? 
        lichSuMuonPhong.map(ls => ls.maYeuCau) : [];
      
      // Combine both arrays and remove duplicates
      const allRequestIDs = [...new Set([...yeucauIDs, ...lichsuIDs])];
      
      if (allRequestIDs.length === 0) return;
      
      // Use the UserService to check which requests have been evaluated
      let response;
      if (isGiangVien) {
        response = await UserService.kiemTraDanhGiaGV(allRequestIDs);
      } else {
        response = await UserService.kiemTraDanhGia(allRequestIDs);
      }
      
      setDaDanhGiaList(response.data || {});
      
      console.log("Feedback status loaded:", response.data);
    } catch (error) {
      console.error("Error fetching feedback status:", error);
      // Don't show error notification to user for this background check
    }
  };

  // Check if a request has been evaluated
  const isDaDanhGia = (maYeuCau) => {
    return daDanhGiaList[maYeuCau] === true;
  };

  // Utility functions
  const formatDate = (dateString) => dateString ? format(new Date(dateString), 'dd/MM/yyyy HH:mm') : '';

  // Form handler
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMuonPhongForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handlePhanHoiFormChange = (e) => {
    const { name, value } = e.target;
    setPhanHoiForm(prev => ({ ...prev, [name]: value }));
  };

  // Form validation
  const validateBookingTime = () => {
    const now = new Date();
    
    if (!muonPhongForm.thoiGianMuon || !muonPhongForm.thoiGianTra) {
      if (onError) onError("Vui lòng chọn thời gian mượn và trả");
      return false;
    }

    if (muonPhongForm.thoiGianMuon < now) {
      if (onError) onError("Thời gian mượn phải là thời gian trong tương lai");
      return false;
    }

    if (muonPhongForm.thoiGianTra <= muonPhongForm.thoiGianMuon) {
      if (onError) onError("Thời gian trả phải sau thời gian mượn");
      return false;
    }

    // Check if booking and return are on the same day
    if (muonPhongForm.thoiGianMuon.toDateString() !== muonPhongForm.thoiGianTra.toDateString()) {
      if (onError) onError("Thời gian mượn và trả phải trong cùng một ngày");
      return false;
    }

    return true;
  };

  // Filter available times (7:00 AM to 10:00 PM)
  const filterTime = (date) => {
    const hours = date.getHours();
    return hours >= 7 && hours < 22;
  };

  // Filter return times (must be after booking time)
  const filterReturnTime = (date) => {
    if (!muonPhongForm.thoiGianMuon) return false;
    
    const hours = date.getHours();
    if (hours < 7 || hours >= 22) return false;

    const bookingDate = new Date(muonPhongForm.thoiGianMuon);
    return date > bookingDate && date.toDateString() === bookingDate.toDateString();
  };

  // Handle booking time change
  const handleBookingTimeChange = (date) => {
    setMuonPhongForm(prev => ({ 
      ...prev, 
      thoiGianMuon: date,
      // Reset return time if it's before the new booking time
      thoiGianTra: prev.thoiGianTra && date > prev.thoiGianTra ? null : prev.thoiGianTra
    }));
  };

  // Handle form submissions
  const handleMuonPhongSubmit = async (e) => {
    e.preventDefault();
    if (!validateBookingTime()) {
      return;
    }

    try {
      setLoading(true);
      const formData = {
        ...muonPhongForm,
        thoiGianMuon: muonPhongForm.thoiGianMuon.toISOString(),
        thoiGianTra: muonPhongForm.thoiGianTra.toISOString()
      };

      let response;
      if (isGiangVien) {
        response = await UserService.yeuCauMuonPhongGV(formData);
      } else {
        response = await UserService.yeuCauMuonPhong(formData);
      }
      
      if (onSuccess) onSuccess(response.data.message || "Đã gửi yêu cầu mượn phòng thành công!");
      setMuonPhongForm({ maPhong: "", thoiGianMuon: null, thoiGianTra: null, mucDich: "" });
      if (onRefresh) onRefresh();
      setLoading(false);
    } catch (error) {
      if (onError) onError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  const handleTraPhong = async (maYeuCau) => {
    try {
      setLoading(true);
      let response;
      if (isGiangVien) {
        response = await UserService.traPhongHocGV(maYeuCau);
      } else {
        response = await UserService.traPhongHoc(maYeuCau);
      }
      
      if (onSuccess) onSuccess(response.data.message || "Đã trả phòng thành công!");
      if (onRefresh) onRefresh();
      setLoading(false);
    } catch (error) {
      if (onError) onError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  // Function to fetch existing feedback for a request
  const fetchExistingFeedback = async (maYeuCau) => {
    try {
      let response;
      if (isGiangVien) {
        response = await UserService.getPhanHoiGV(parseInt(maYeuCau));
      } else {
        response = await UserService.getPhanHoi(parseInt(maYeuCau));
      }
      
      setExistingFeedback(response.data);
      setPhanHoiForm({ 
        maYeuCau: response.data.maYeuCau,
        maLichSu: response.data.maLichSu, 
        danhGia: response.data.danhGia, 
        nhanXet: response.data.nhanXet || "" 
      });
      setIsEditingFeedback(true);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      handleError("Không thể tải đánh giá đã có. Vui lòng thử lại sau.");
      setIsEditingFeedback(false);
    }
  };

  const openPhanHoiModal = async (yeuCau) => {
    // For lichSuMuonPhong, we need to convert the object to match the expected format
    const formattedYeuCau = activeTab === "history" ? {
      maYeuCau: yeuCau.maYeuCau,
      maLichSu: yeuCau.maLichSu,
      phong: { maPhong: yeuCau.maPhong }
    } : yeuCau;
    
    setSelectedYeuCau(formattedYeuCau);
    
    // Check if already evaluated
    if (isDaDanhGia(yeuCau.maYeuCau)) {
      // Fetch existing feedback and load it
      await fetchExistingFeedback(yeuCau.maYeuCau);
    } else {
      // New feedback
      setPhanHoiForm({ 
        maYeuCau: yeuCau.maYeuCau, 
        maLichSu: yeuCau.maLichSu,
        danhGia: 5, 
        nhanXet: "" 
      });
      setIsEditingFeedback(false);
    }
    
    setShowPhanHoiModal(true);
  };

  const handlePhanHoiSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      let response;
      
      if (isGiangVien) {
        response = await UserService.handlePhanHoiSubmitGV(phanHoiForm, isEditingFeedback);
      } else {
        response = await UserService.handlePhanHoiSubmit(phanHoiForm, isEditingFeedback);
      }
      
      if (onSuccess) {
        if (isEditingFeedback) {
          onSuccess(response.data.message || "Đã cập nhật đánh giá thành công!");
          // Nếu có dữ liệu phản hồi được trả về, cập nhật lại trạng thái
          if (response.data.phanHoi) {
            setExistingFeedback(response.data.phanHoi);
          }
        } else {
          onSuccess(response.data.message || "Đã gửi đánh giá thành công!");
        }
      }
      
      setDaDanhGiaList(prev => ({ ...prev, [phanHoiForm.maYeuCau]: true }));
      setShowPhanHoiModal(false);
      
      // Gọi hàm refreshDanhGiaStatus để cập nhật dữ liệu đánh giá mới
      fetchDanhGiaStatus();
      
      // Gọi hàm refresh để cập nhật UI
      if (onRefresh) onRefresh();
      
      setLoading(false);
    } catch (error) {
      if (onError) onError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  // Error handler
  const handleError = (message) => {
    if (onError) onError(message);
  };

  // Add a new function to handle reporting incidents
  const handleBaoSuCo = (yeuCau) => {
    // Format yeuCau to have consistent structure
    const formattedYeuCau = typeof yeuCau === 'object' ? yeuCau : { maYeuCau: yeuCau };
    setSelectedYeuCau(formattedYeuCau);
    setSuCoForm({
      maYeuCau: formattedYeuCau.maYeuCau,
      moTa: ""
    });
    setShowSuCoModal(true);
  };

  const handleSuCoFormChange = (e) => {
    const { name, value } = e.target;
    setSuCoForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSuCoSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      let response;
      if (isGiangVien) {
        response = await UserService.baoSuCoGV(suCoForm);
      } else {
        response = await UserService.baoSuCo(suCoForm);
      }
      
      if (onSuccess) onSuccess(response.data.message || "Đã gửi báo cáo sự cố thành công!");
      setShowSuCoModal(false);
      setLoading(false);
    } catch (error) {
      if (onError) onError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  // Xem chi tiết yêu cầu mượn phòng
  const handleXemChiTiet = async (yeuCau) => {
    try {
      let response;
      
      if (isGiangVien) {
        response = await UserService.getChiTietYeuCauGV(yeuCau.maYeuCau);
      } else {
        response = await UserService.getChiTietYeuCau(yeuCau.maYeuCau);
      }
      
      setSelectedYeuCau(response.data);
      setShowChiTietModal(true);
    } catch (error) {
      if (onError) onError(error.response?.data?.message || error.message);
    }
  };

  // Xử lý xác nhận trả phòng
  const handleXacNhanTraPhong = (yeuCau) => {
    setSelectedYeuCau(yeuCau);
    setShowXacNhanTraModal(true);
  };

  const confirmTraPhong = () => {
    handleTraPhong(selectedYeuCau.maYeuCau);
    setShowXacNhanTraModal(false);
  };

  // Thêm hàm xử lý hủy yêu cầu
  const handleHuyYeuCau = async () => {
    try {
      setLoading(true);
      const response = await UserService.huyYeuCauMuonPhong(selectedYeuCau.maYeuCau);
      
      if (onSuccess) onSuccess(response.data.message || "Đã hủy yêu cầu mượn phòng thành công!");
      setShowXacNhanHuyModal(false);
      if (onRefresh) onRefresh();
      setLoading(false);
    } catch (error) {
      if (onError) onError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  return (
    <Row className="mt-3">
      <Col md={5}>
        <Card className="mb-4">
          <Card.Header>Đăng ký mượn phòng</Card.Header>
          <Card.Body>
            <Form onSubmit={handleMuonPhongSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Chọn phòng</Form.Label>
                <Form.Select 
                  name="maPhong" 
                  value={muonPhongForm.maPhong} 
                  onChange={handleFormChange} 
                  required
                  disabled={loading}
                >
                  <option value="">-- Chọn phòng --</option>
                  {danhSachPhong.map(phong => (
                    <option key={phong.maPhong} value={phong.maPhong}>
                      {phong.maPhong} - {phong.loaiPhong} (Sức chứa: {phong.sucChua})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thời gian mượn</Form.Label>
                    <DatePicker
                      selected={muonPhongForm.thoiGianMuon}
                      onChange={handleBookingTimeChange}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={timeIntervals}
                      filterTime={filterTime}
                      dateFormat="dd/MM/yyyy HH:mm"
                      minDate={new Date()}
                      placeholderText="Chọn thời gian mượn"
                      className="form-control"
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thời gian trả</Form.Label>
                    <DatePicker
                      selected={muonPhongForm.thoiGianTra}
                      onChange={(date) => setMuonPhongForm(prev => ({ ...prev, thoiGianTra: date }))}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={timeIntervals}
                      filterTime={filterReturnTime}
                      dateFormat="dd/MM/yyyy HH:mm"
                      minDate={muonPhongForm.thoiGianMuon}
                      placeholderText={muonPhongForm.thoiGianMuon ? "Chọn thời gian trả" : "Chọn thời gian mượn trước"}
                      className="form-control"
                      disabled={!muonPhongForm.thoiGianMuon || loading}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Mục đích</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  name="mucDich" 
                  value={muonPhongForm.mucDich} 
                  onChange={handleFormChange} 
                  required 
                  disabled={loading}
                />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi yêu cầu"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
      <Col md={7}>
        <Card>
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Card.Header>
              <Nav variant="tabs" defaultActiveKey={activeTab} className="card-header-tabs">
                <Nav.Item>
                  <Nav.Link eventKey="requests">Yêu cầu mượn phòng</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="history">Lịch sử mượn phòng</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              <Tab.Content>
                <Tab.Pane eventKey="requests">
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Mã YC</th>
                        <th>Phòng</th>
                        <th>Thời gian mượn</th>
                        <th>Thời gian trả</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yeuCauMuonPhong && yeuCauMuonPhong.length > 0 ? 
                        yeuCauMuonPhong
                          .filter(yc => ['DANGXULY', 'DADUYET', 'KHONGDUOCDUYET'].includes(yc.trangThai))
                          .map(yc => (
                          <tr key={yc.maYeuCau}>
                            <td>{yc.maYeuCau}</td>
                            <td>{yc.phong?.maPhong}</td>
                            <td>{formatDate(yc.thoiGianMuon)}</td>
                            <td>{formatDate(yc.thoiGianTra)}</td>
                            <td>
                              <Badge bg={
                                yc.trangThai === 'DADUYET' ? 'success' : 
                                yc.trangThai === 'DANGXULY' ? 'warning' : 
                                'danger'
                              }>
                                {yc.trangThai === 'DANGXULY' ? 'Đang xử lý' :
                                 yc.trangThai === 'DADUYET' ? 'Đã duyệt' :
                                 'Không được duyệt'}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleXemChiTiet(yc)}
                                >
                                  Xem chi tiết
                                </Button>
                                {yc.trangThai != 'KHONGDUOCDUYET' && new Date(yc.thoiGianMuon) > new Date() && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedYeuCau(yc);
                                      setShowXacNhanHuyModal(true);
                                    }}
                                  >
                                    Hủy yêu cầu
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="6" className="text-center">Chưa có yêu cầu mượn phòng</td></tr>
                        )}
                    </tbody>
                  </Table>
                  
                  {/* Trả phòng section */}
                  {yeuCauMuonPhong && yeuCauMuonPhong.filter(yc => yc.trangThai === 'DADUYET' && !yc.thoiGianTra).length > 0 && (
                    <div className="mt-3">
                      <h5>Trả phòng</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {yeuCauMuonPhong
                          .filter(yc => yc.trangThai === 'DADUYET' && !yc.thoiGianTra)
                          .map(yc => (
                            <Button 
                              key={yc.maYeuCau}
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => handleTraPhong(yc.maYeuCau)}
                              disabled={loading}
                              className="mb-2"
                            >
                              Trả phòng {yc.phong?.maPhong} (Mã YC: {yc.maYeuCau})
                            </Button>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </Tab.Pane>
                <Tab.Pane eventKey="history">
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Mã YC</th>
                        <th>Phòng</th>
                        <th>Thời gian mượn</th>
                        <th>Thời gian trả</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lichSuMuonPhong && lichSuMuonPhong.length > 0 ? 
                        lichSuMuonPhong.map(ls => (
                          <tr key={ls.maLichSu}>
                            <td>{ls.maYeuCau}</td>
                            <td>{ls.maPhong}</td>
                            <td>{formatDate(ls.thoiGianMuon)}</td>
                            <td>{formatDate(ls.thoiGianTra)}</td>
                            <td>
                              {!ls.thoiGianTra ? (
                                <Badge bg="warning">Chưa trả</Badge>
                              )
                              :ls.trangThaiTra === "DungHan" ? (
                                <Badge bg="success">Đúng hạn</Badge>
                              ) : ls.trangThaiTra === "TreHan" ? (
                                <Badge bg="danger">Trễ hạn</Badge>
                              ) : (
                                <Badge bg="warning">Chưa trả</Badge>
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                {!ls.thoiGianTra && (
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => handleXacNhanTraPhong(ls)}
                                    disabled={loading}
                                  >
                                    Trả phòng
                                  </Button>
                                )}
                                {isDaDanhGia(ls.maYeuCau) ? (
                                  <Button 
                                    variant="outline-info" 
                                    size="sm" 
                                    onClick={() => openPhanHoiModal(ls)}
                                    disabled={loading}
                                  >
                                    Xem đánh giá
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline-success" 
                                    size="sm" 
                                    onClick={() => openPhanHoiModal(ls)}
                                    disabled={loading}
                                  >
                                    Đánh giá
                                  </Button>
                                )}
                                {/* Chỉ hiển thị nút Báo cáo sự cố cho phòng chưa trả */}
                                {!ls.thoiGianTra && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleBaoSuCo(ls)}
                                    disabled={loading}
                                  >
                                    Sự cố
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="6" className="text-center">Chưa có lịch sử mượn phòng</td></tr>
                        )}
                    </tbody>
                  </Table>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Tab.Container>
        </Card>
      </Col>

      {/* Feedback Modal */}
      <Modal 
        show={showPhanHoiModal} 
        onHide={() => {
          setShowPhanHoiModal(false);
          setIsEditingFeedback(false);
          setExistingFeedback(null);
        }}
        centered
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            {isEditingFeedback ? "Chỉnh sửa đánh giá phòng học" : "Đánh giá phòng học"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form onSubmit={handlePhanHoiSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Phòng</Form.Label>
              <Form.Control 
                type="text" 
                value={selectedYeuCau?.phong?.maPhong || selectedYeuCau?.maPhong || ''} 
                disabled 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Đánh giá (1-5)</Form.Label>
              <Form.Control 
                type="number" 
                min="1" 
                max="5" 
                name="danhGia" 
                value={phanHoiForm.danhGia} 
                onChange={handlePhanHoiFormChange} 
                required 
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nhận xét</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="nhanXet" 
                value={phanHoiForm.nhanXet} 
                onChange={handlePhanHoiFormChange} 
                disabled={loading}
              />
            </Form.Group>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowPhanHoiModal(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : (isEditingFeedback ? 'Cập nhật đánh giá' : 'Gửi đánh giá')}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Incident Report Modal */}
      <Modal 
        show={showSuCoModal} 
        onHide={() => setShowSuCoModal(false)}
        centered
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            Báo cáo sự cố
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form onSubmit={handleSuCoSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Phòng</Form.Label>
              <Form.Control 
                type="text" 
                value={selectedYeuCau?.phong?.maPhong || selectedYeuCau?.maPhong || ''} 
                disabled 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mã yêu cầu</Form.Label>
              <Form.Control 
                type="text" 
                value={selectedYeuCau?.maYeuCau || ''} 
                disabled 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả sự cố <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                name="moTa" 
                value={suCoForm.moTa} 
                onChange={handleSuCoFormChange} 
                required 
                placeholder="Vui lòng mô tả chi tiết sự cố bạn gặp phải..."
                disabled={loading}
              />
            </Form.Group>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowSuCoModal(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Gửi báo cáo'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Chi tiết yêu cầu mượn phòng Modal */}
      <Modal 
        show={showChiTietModal} 
        onHide={() => setShowChiTietModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            Chi tiết yêu cầu mượn phòng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <strong>Mã yêu cầu:</strong> {selectedYeuCau?.maYeuCau}
              </div>
              <div className="mb-3">
                <strong>Phòng:</strong> {selectedYeuCau?.phong} 
                {selectedYeuCau?.phong && ` - ${selectedYeuCau.loaiPhong}`}
                {/* {selectedYeuCau?.phong?.sucChua && ` (Sức chứa: ${selectedYeuCau.phong.sucChua})`} */}
              </div>
              <div className="mb-3">
                <strong>Người mượn:</strong> {selectedYeuCau?.nguoiMuon || ''}
              </div>
              <div className="mb-3">
                <strong>Thời gian mượn:</strong> {selectedYeuCau ? formatDate(selectedYeuCau.thoiGianMuon) : ''}
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <strong>Thời gian trả:</strong> {selectedYeuCau ? formatDate(selectedYeuCau.thoiGianTra) : ''}
              </div>
              <div className="mb-3">
                <strong>Trạng thái:</strong>{' '}
                <Badge bg={
                  selectedYeuCau?.trangThai === 'DADUYET' ? 'success' : 
                  selectedYeuCau?.trangThai === 'DANGXULY' ? 'warning' : 
                  'danger'
                }>
                  {selectedYeuCau?.trangThai === 'DANGXULY' ? 'Đang xử lý' :
                   selectedYeuCau?.trangThai === 'DADUYET' ? 'Đã duyệt' :
                   'Không được duyệt'}
                </Badge>
              </div>
              {selectedYeuCau?.nguoiDuyet && (
              <div className="mb-3">
                <strong>Người duyệt:</strong> {selectedYeuCau.nguoiDuyet || ''}
              </div>
              )}
            </Col>
          </Row>
          <div className="mb-3">
            <strong>Mục đích:</strong>
            <p className="mt-2 p-3 bg-light rounded">
              {selectedYeuCau?.mucDich || 'Không có mục đích được cung cấp.'}
            </p>
          </div>
          <div className="mb-3">
            <strong>Lý do:</strong>
            <p className="mt-2 p-3 bg-light rounded">
              {selectedYeuCau?.lyDo || 'Không có lý do được cung cấp.'}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChiTietModal(false)}>
            Đóng
          </Button>
          {selectedYeuCau?.trangThai === 'DADUYET' && !selectedYeuCau?.thoiGianTra && (
            <Button 
              variant="primary" 
              onClick={() => {
                setShowChiTietModal(false);
                handleTraPhong(selectedYeuCau.maYeuCau);
              }}
              disabled={loading}
            >
              Trả phòng
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal xác nhận trả phòng */}
      <Modal 
        show={showXacNhanTraModal} 
        onHide={() => setShowXacNhanTraModal(false)}
        centered
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            Xác nhận trả phòng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <p>Bạn có chắc chắn muốn trả phòng <strong>{selectedYeuCau?.phong?.maPhong || selectedYeuCau?.maPhong}</strong> không?</p>
          <p>Thời gian trả sẽ được cập nhật là thời gian hiện tại.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowXacNhanTraModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={confirmTraPhong}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận trả phòng'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xác nhận hủy yêu cầu */}
      <Modal 
        show={showXacNhanHuyModal} 
        onHide={() => setShowXacNhanHuyModal(false)}
        centered
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            Xác nhận hủy yêu cầu
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <p>Bạn có chắc chắn muốn hủy yêu cầu mượn phòng <strong>{selectedYeuCau?.phong?.maPhong || selectedYeuCau?.maPhong}</strong> không?</p>
          <p>Thời gian mượn: {selectedYeuCau ? formatDate(selectedYeuCau.thoiGianMuon) : ''}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowXacNhanHuyModal(false)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleHuyYeuCau}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default MuonPhongManager; 