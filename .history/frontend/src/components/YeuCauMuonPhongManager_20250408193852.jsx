import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge, Tabs, Tab, ProgressBar } from "react-bootstrap";
import axios from "axios";
import authHeader from "../services/auth-header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheck, faTimes, faEye, faSearch, faChartBar,
  faFilter, faClipboardCheck, faClipboardList, faClipboardQuestion, faKey
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import 'moment/locale/vi';
import { toast } from "react-toastify";
import UserService from "../services/UserService";

const API_URL = "http://localhost:8080/api/quanly";

const YeuCauMuonPhongManager = () => {
  const [yeuCauList, setYeuCauList] = useState([]);
  const [selectedYeuCau, setSelectedYeuCau] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lyDo, setLyDo] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [returnStats, setReturnStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [daMuonList, setDaMuonList] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Lấy danh sách yêu cầu khi component được render
  useEffect(() => {
    fetchYeuCauList();
    checkDaChoMuon();
    fetchCurrentUser();
  }, []);

  // Tải tất cả yêu cầu
  const fetchYeuCauList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/yeucau`, { headers: authHeader() });
      setYeuCauList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu cầu:", error);
      toast.error("Không thể lấy danh sách yêu cầu. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Hàm kiểm tra các yêu cầu đã được cho mượn
  const checkDaChoMuon = async () => {
    try {
      const response = await axios.get(`${API_URL}/yeucau/dachophep`, { headers: authHeader() });
      const daMuonData = {};
      
      response.data.forEach(maYeuCau => {
        daMuonData[maYeuCau] = true;
      });
      
      setDaMuonList(daMuonData);
    } catch (error) {
      console.error("Lỗi khi kiểm tra yêu cầu đã cho mượn:", error);
    }
  };

  // Lọc yêu cầu theo các tab
  const getFilteredYeuCau = () => {
    let filtered = [...yeuCauList];
    
    // Lọc theo tab đang chọn
    if (activeTab === "pending") {
      filtered = filtered.filter(yc => yc.trangThai === "DANGXULY");
    } else if (activeTab === "approved") {
      filtered = filtered.filter(yc => yc.trangThai === "DADUYET");
    } else if (activeTab === "rejected") {
      filtered = filtered.filter(yc => yc.trangThai === "KHONGDUOCDUYET");
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(yc => 
        (yc.nguoiMuon && yc.nguoiMuon.toLowerCase().includes(searchLower)) ||
        (yc.phong && yc.phong.toLowerCase().includes(searchLower)) ||
        (yc.viTri && yc.viTri.toLowerCase().includes(searchLower)) ||
        (yc.mucDich && yc.mucDich.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  };

  // Xem chi tiết yêu cầu
  const handleViewDetail = async (maYeuCau) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/yeucau/${maYeuCau}`,
        { headers: authHeader() }
      );
      setSelectedYeuCau(response.data);
      setShowDetailModal(true);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết yêu cầu:", error);
      toast.error("Không thể lấy chi tiết yêu cầu. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Hiển thị modal từ chối
  const handleShowRejectModal = (yeuCau) => {
    setSelectedYeuCau(yeuCau);
    setLyDo("");
    setShowRejectModal(true);
  };

  // Duyệt yêu cầu
  const handleApproveRequest = async (maYeuCau) => {
    try {
      const response = await axios.put(
        `${API_URL}/yeucau/duyet/${maYeuCau}`,
        {},
        { headers: authHeader() }
      );
      toast.success("Đã duyệt yêu cầu thành công!");
      fetchYeuCauList();
      
      // Cập nhật thông tin chi tiết nếu đang xem
      if (selectedYeuCau && selectedYeuCau.maYeuCau === maYeuCau) {
        handleViewDetail(maYeuCau);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra khi duyệt yêu cầu.");
    }
  };

  // Từ chối yêu cầu
  const handleRejectRequest = async () => {
    if (!lyDo) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/yeucau/tuchoi/${selectedYeuCau.maYeuCau}`,
        { lyDo },
        { headers: authHeader() }
      );
      setShowRejectModal(false);
      toast.success("Đã từ chối yêu cầu thành công!");
      fetchYeuCauList();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra khi từ chối yêu cầu.");
    }
  };

  // Thêm hàm cho mượn phòng
  const handleChoMuon = async (maYeuCau) => {
    try {
      const response = await axios.put(
        `${API_URL}/yeucau/chomuon/${maYeuCau}`,
        {},
        { headers: authHeader() }
      );
      toast.success("Đã ghi nhận việc cho mượn phòng thành công!");
      
      // Cập nhật danh sách yêu cầu đã cho mượn
      setDaMuonList(prev => ({
        ...prev,
        [maYeuCau]: true
      }));
      
      fetchYeuCauList();
      
      // Cập nhật thông tin chi tiết nếu đang xem
      if (selectedYeuCau && selectedYeuCau.maYeuCau === maYeuCau) {
        handleViewDetail(maYeuCau);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra khi cho mượn phòng.");
    }
  };

  // Hiển thị trạng thái yêu cầu
  const renderTrangThai = (trangThai) => {
    switch (trangThai) {
      case "DANGXULY":
        return <Badge bg="warning">Đang xử lý</Badge>;
      case "DADUYET":
        return <Badge bg="success">Đã duyệt</Badge>;
      case "KHONGDUOCDUYET":
        return <Badge bg="danger">Không được duyệt</Badge>;
      default:
        return <Badge bg="secondary">{trangThai}</Badge>;
    }
  };

  // Format thời gian
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return moment(dateTime).format("DD/MM/YYYY HH:mm");
  };

  // Lấy số lượng yêu cầu theo trạng thái
  const getCountByStatus = (status) => {
    return yeuCauList.filter(yc => yc.trangThai === status).length;
  };

  // Lấy thống kê về việc trả phòng
  const fetchReturnStats = async () => {
    setStatsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/yeucau/thongke-tra-phong`, { headers: authHeader() });
      setReturnStats(response.data);
      setStatsLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê trả phòng:", error);
      setStatsLoading(false);
    }
  };

  // Hiển thị modal thống kê
  const handleShowStatsModal = () => {
    fetchReturnStats();
    setShowStatsModal(true);
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/current`, { headers: authHeader() });
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  const handleHuyYeuCau = async () => {
    try {
      setLoading(true);
      if (currentUser.roles.includes("ROLE_SV")) {
        await UserService.huyYeuCauMuonPhong(selectedYeuCau.maYeuCau);
      } else if (currentUser.roles.includes("ROLE_GV")) {
        await UserService.huyYeuCauMuonPhongGV(selectedYeuCau.maYeuCau);
      }
      toast.success("Hủy yêu cầu thành công");
      setShowHuyModal(false);
      fetchYeuCauList();
    } catch (error) {
      console.error("Error canceling request:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi hủy yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid>
      <Card className="mb-4">
        <Card.Header className="bg-white pb-0">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Quản lý yêu cầu mượn phòng</h5>
            <Button variant="info" onClick={handleShowStatsModal} id="yeucau-stats-btn">
              <FontAwesomeIcon icon={faChartBar} /> Báo cáo thống kê
            </Button>
          </div>
          <Tabs
            activeKey={activeTab}
            onSelect={(key) => setActiveTab(key)}
            className="mb-0"
          >
            <Tab 
              eventKey="all" 
              title={
                <span>
                  <FontAwesomeIcon icon={faClipboardList} className="me-1" />
                  Tất cả ({yeuCauList.length})
                </span>
              }
            />
            <Tab 
              eventKey="pending" 
              title={
                <span>
                  <FontAwesomeIcon icon={faClipboardQuestion} className="me-1" />
                  Đang xử lý ({getCountByStatus("DANGXULY")})
                </span>
              }
            />
            <Tab 
              eventKey="approved" 
              title={
                <span>
                  <FontAwesomeIcon icon={faClipboardCheck} className="me-1" />
                  Đã duyệt ({getCountByStatus("DADUYET")})
                </span>
              }
            />
            <Tab 
              eventKey="rejected" 
              title={
                <span>
                  <FontAwesomeIcon icon={faTimes} className="me-1" />
                  Từ chối ({getCountByStatus("KHONGDUOCDUYET")})
                </span>
              }
            />
          </Tabs>
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
                    placeholder="Tìm kiếm theo người mượn, phòng, vị trí, mục đích..."
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
                  <th>Mã YC</th>
                  <th>Người mượn</th>
                  <th>Phòng</th>
                  <th>Thời gian mượn</th>
                  <th>Thời gian trả</th>
                  {/* <th>Mục đích</th> */}
                  <th>Trạng thái</th>
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
                ) : getFilteredYeuCau().length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      Không có yêu cầu nào
                    </td>
                  </tr>
                ) : (
                  getFilteredYeuCau().map((yeuCau) => (
                    <tr key={yeuCau.maYeuCau}>
                      <td>{yeuCau.maYeuCau}</td>
                      <td>{yeuCau.nguoiMuon}</td>
                      <td>
                        {yeuCau.phong}
                        <div className="small text-muted">{yeuCau.viTri}</div>
                      </td>
                      <td>{formatDateTime(yeuCau.thoiGianMuon)}</td>
                      <td>{formatDateTime(yeuCau.thoiGianTra)}</td>
                      {/* <td>
                        <div style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {yeuCau.mucDich}
                        </div>
                      </td> */}
                      <td>{renderTrangThai(yeuCau.trangThai)}</td>
                      <td>
                        <Button 
                          variant="outline-info" 
                          size="sm" 
                          className="me-1" 
                          title="Xem chi tiết"
                          onClick={() => handleViewDetail(yeuCau.maYeuCau)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                        
                        {yeuCau.trangThai === "DANGXULY" && (
                          <>
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              className="me-1"
                              title="Duyệt yêu cầu"
                              onClick={() => handleApproveRequest(yeuCau.maYeuCau)}
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              title="Từ chối yêu cầu"
                              onClick={() => handleShowRejectModal(yeuCau)}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </Button>
                          </>
                        )}

                        {yeuCau.trangThai === "DADUYET" && !daMuonList[yeuCau.maYeuCau] && (
                          <>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              title="Cho mượn phòng"
                              onClick={() => handleChoMuon(yeuCau.maYeuCau)}
                            >
                              <FontAwesomeIcon icon={faKey} />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal Xem chi tiết yêu cầu */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết yêu cầu mượn phòng #{selectedYeuCau?.maYeuCau}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedYeuCau && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-muted mb-2">Thông tin người mượn</h6>
                  <p className="mb-1"><strong>Họ tên:</strong> {selectedYeuCau.nguoiMuon}</p>
                  <p className="mb-1"><strong>ID:</strong> {selectedYeuCau.idNguoiMuon}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted mb-2">Thông tin phòng</h6>
                  <p className="mb-1"><strong>Mã phòng:</strong> {selectedYeuCau.maPhong}</p>
                  <p className="mb-1"><strong>Vị trí:</strong> {selectedYeuCau.viTri}</p>
                  <p className="mb-1"><strong>Loại phòng:</strong> {selectedYeuCau.loaiPhong}</p>
                </Col>
              </Row>
              
              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-muted mb-2">Thời gian</h6>
                  <p className="mb-1"><strong>Mượn:</strong> {formatDateTime(selectedYeuCau.thoiGianMuon)}</p>
                  <p className="mb-1"><strong>Trả:</strong> {formatDateTime(selectedYeuCau.thoiGianTra)}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted mb-2">Trạng thái</h6>
                  <p className="mb-1">
                    <strong>Trạng thái:</strong> {renderTrangThai(selectedYeuCau.trangThai)}
                  </p>
                  {selectedYeuCau.nguoiDuyet && (
                    <p className="mb-1"><strong>Người duyệt:</strong> {selectedYeuCau.nguoiDuyet}</p>
                  )}
                </Col>
              </Row>
              
              <div className="mb-3">
                <h6 className="text-muted mb-2">Mục đích sử dụng</h6>
                <p>{selectedYeuCau.mucDich}</p>
              </div>
              
              {selectedYeuCau.lyDo && (
                <div className="mb-3">
                  <h6 className="text-muted mb-2">Lý do từ chối</h6>
                  <p className="text-danger">{selectedYeuCau.lyDo}</p>
                </div>
              )}
              
              {selectedYeuCau.trangThai === "DANGXULY" && (
                <div className="d-flex mt-4">
                  <Button 
                    variant="success" 
                    className="me-2"
                    onClick={() => handleApproveRequest(selectedYeuCau.maYeuCau)}
                  >
                    <FontAwesomeIcon icon={faCheck} className="me-1" /> Duyệt yêu cầu
                  </Button>
                  <Button 
                    variant="danger"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleShowRejectModal(selectedYeuCau);
                    }}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-1" /> Từ chối yêu cầu
                  </Button>
                </div>
              )}

              {selectedYeuCau && selectedYeuCau.trangThai === "DADUYET" && !daMuonList[selectedYeuCau.maYeuCau] && (
                <div className="d-flex mt-4">
                  <Button 
                    variant="primary" 
                    onClick={() => handleChoMuon(selectedYeuCau.maYeuCau)}
                  >
                    <FontAwesomeIcon icon={faKey} className="me-1" /> Cho mượn phòng
                  </Button>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Từ chối yêu cầu */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Từ chối yêu cầu mượn phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn sắp từ chối yêu cầu mượn phòng của <strong>{selectedYeuCau?.nguoiMuon}</strong> cho phòng <strong>{selectedYeuCau?.phong}</strong>.</p>
          <Form.Group className="mb-3">
            <Form.Label>Lý do từ chối <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={lyDo}
              onChange={(e) => setLyDo(e.target.value)}
              placeholder="Vui lòng nhập lý do từ chối yêu cầu..."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleRejectRequest}>
            Từ chối yêu cầu
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Thống kê trả phòng */}
      <Modal show={showStatsModal} onHide={() => setShowStatsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Báo cáo thống kê trả phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {statsLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : returnStats ? (
            <>
              <h5 className="mb-3">Thống kê tổng quát</h5>
              <Row className="mb-4">
                <Col md={3} className="text-center">
                  <Card className="h-100">
                    <Card.Body>
                      <h2 className="display-4">{returnStats.generalStats.totalApprovedRequests}</h2>
                      <p className="text-muted">Tổng số yêu cầu đã duyệt</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} className="text-center">
                  <Card className="h-100">
                    <Card.Body>
                      <h2 className="display-4">{returnStats.generalStats.totalDueRequests}</h2>
                      <p className="text-muted">Đã đến hạn trả</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} className="text-center">
                  <Card className="h-100 bg-success text-white">
                    <Card.Body>
                      <h2 className="display-4">{returnStats.generalStats.onTimeCount}</h2>
                      <p>Trả đúng hạn</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3} className="text-center">
                  <Card className="h-100 bg-danger text-white">
                    <Card.Body>
                      <h2 className="display-4">{returnStats.generalStats.lateCount}</h2>
                      <p>Trả trễ hạn</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <h5 className="mb-3">Tỷ lệ trả phòng</h5>
              {returnStats.generalStats.totalDueRequests > 0 ? (
                <Card className="mb-4">
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <div>
                        <Badge bg="success" className="me-1">■</Badge> Đúng hạn
                      </div>
                      <div>
                        <strong>{returnStats.generalStats.onTimePercent}%</strong>
                      </div>
                    </div>
                    <ProgressBar>
                      <ProgressBar variant="success" now={returnStats.generalStats.onTimePercent} key={1} />
                      <ProgressBar variant="danger" now={returnStats.generalStats.latePercent} key={2} />
                    </ProgressBar>
                    <div className="d-flex justify-content-between mt-2">
                      <div>
                        <Badge bg="danger" className="me-1">■</Badge> Trễ hạn
                      </div>
                      <div>
                        <strong>{returnStats.generalStats.latePercent}%</strong>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ) : (
                <Alert variant="info">
                  Chưa có dữ liệu để thống kê tỷ lệ trả phòng.
                </Alert>
              )}

              <Row>
                <Col md={6}>
                  <h5 className="mb-3">Top người hay trả trễ</h5>
                  {returnStats.topLateUsers.length > 0 ? (
                    <Table striped bordered hover className="mb-4">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Người mượn</th>
                          <th>Số lần trễ</th>
                          <th>Tổng mượn</th>
                          <th>% Trễ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returnStats.topLateUsers.map((user, index) => {
                          const latePercent = user.totalRequests > 0 
                            ? Math.round((user.lateReturns / user.totalRequests) * 100) 
                            : 0;
                          return (
                            <tr key={user.idNguoiDung}>
                              <td>{index + 1}</td>
                              <td>{user.hoTen}</td>
                              <td className="text-center">
                                <Badge bg="danger" pill>
                                  {user.lateReturns}
                                </Badge>
                              </td>
                              <td className="text-center">{user.totalRequests}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div style={{ width: "50px" }}>{latePercent}%</div>
                                  <ProgressBar 
                                    variant={
                                      latePercent < 30 ? "success" : 
                                      latePercent < 70 ? "warning" : "danger"
                                    }
                                    now={latePercent} 
                                    style={{ height: "8px", width: "100%" }}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center">
                      <p className="text-muted">Chưa có dữ liệu về người trả trễ.</p>
                    </div>
                  )}
                </Col>
                <Col md={6}>
                  <h5 className="mb-3">Phòng hay bị trả trễ</h5>
                  {returnStats.topLateRooms.length > 0 ? (
                    <Table striped bordered hover className="mb-4">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Phòng</th>
                          <th>Số lần trễ</th>
                          <th>Tổng mượn</th>
                          <th>% Trễ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returnStats.topLateRooms.map((room, index) => {
                          const latePercent = room.totalRequests > 0 
                            ? Math.round((room.lateReturns / room.totalRequests) * 100) 
                            : 0;
                          return (
                            <tr key={room.maPhong}>
                              <td>{index + 1}</td>
                              <td>
                                {room.maPhong}
                                <div className="small text-muted">{room.viTri}</div>
                              </td>
                              <td className="text-center">
                                <Badge bg="danger" pill>
                                  {room.lateReturns}
                                </Badge>
                              </td>
                              <td className="text-center">{room.totalRequests}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div style={{ width: "50px" }}>{latePercent}%</div>
                                  <ProgressBar 
                                    variant={
                                      latePercent < 30 ? "success" : 
                                      latePercent < 70 ? "warning" : "danger"
                                    }
                                    now={latePercent} 
                                    style={{ height: "8px", width: "100%" }}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  ) : (
                    <Alert variant="info">
                      Chưa có dữ liệu về phòng bị trả trễ.
                    </Alert>
                  )}
                </Col>
              </Row>
            </>
          ) : (
            <div className="text-center">
              <p className="text-warning">Không thể tải thống kê. Vui lòng thử lại sau.</p>
            </div>
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

export default YeuCauMuonPhongManager; 