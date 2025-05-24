import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Card, Container, Row, Col, ListGroup, Tab, Spinner, Table, ProgressBar, Badge, Button, Modal, Form, Tabs, Accordion, Alert, InputGroup } from "react-bootstrap";
import axios from "axios";
import authHeader from "../services/auth-header";
import TaiKhoanManager from "./TaiKhoanManager";
import PhongManager from "./PhongManager";
import GiangVienManager from "./GiangVienManager";
import SinhVienManager from "./SinhVienManager";
import YeuCauMuonPhongManager from "./YeuCauMuonPhongManager";
import SuCoManager from './SuCoManager';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply, faFlag, faCalendarCheck, faCalendarTimes, faCheckCircle, faTimesCircle, faFilter, faSearch, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import UserService from "../services/user.service";

const API_URL = "http://localhost:8080/api/quanly";

const BoardAdmin = () => {
  const [activeKey, setActiveKey] = useState("dashboard");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [roomFeedbackStats, setRoomFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAllFeedbacksModal, setShowAllFeedbacksModal] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState("");
  const [feedbackSort, setFeedbackSort] = useState("highRating");
  const [refreshKey, setRefreshKey] = useState(0);
  
  // State cho lịch sử mượn phòng
  const [lichSuMuonPhong, setLichSuMuonPhong] = useState([]);
  const [thongKeTraPhong, setThongKeTraPhong] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [thongKeTabKey, setThongKeTabKey] = useState("overall");
  const [dateFilter, setDateFilter] = useState({ tuNgay: '', denNgay: '' });

  useEffect(() => {
    if (activeKey === "dashboard") {
      fetchDashboardStats();
    } else if (activeKey === "baocao") {
      fetchRoomFeedbackStats();
    } else if (activeKey === "lichsumuon") {
      fetchLichSuMuonPhong();
      fetchThongKeTraPhong();
    }
  }, [activeKey]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`, { headers: authHeader() });
      setDashboardStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê dashboard:", error);
      setLoading(false);
    }
  };

  const fetchRoomFeedbackStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/phong/feedback`, { headers: authHeader() });
      setRoomFeedbackStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê phản hồi phòng học:", error);
      setLoading(false);
    }
  };

  // Fetch lịch sử mượn phòng
  const fetchLichSuMuonPhong = async () => {
    setLoading(true);
    try {
      const response = await UserService.getAllLichSuMuonPhong();
      setLichSuMuonPhong(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử mượn phòng:", error);
      toast.error("Không thể tải lịch sử mượn phòng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Fetch thống kê trả phòng
  const fetchThongKeTraPhong = async (tuNgay, denNgay) => {
    setLoading(true);
    try {
      const response = await UserService.getThongKeTraPhong(tuNgay, denNgay);
      setThongKeTraPhong(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê trả phòng:", error);
      toast.error("Không thể tải thống kê trả phòng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Lọc lịch sử mượn phòng
  const filteredLichSu = lichSuMuonPhong.filter(ls => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      (ls.maPhong && ls.maPhong.toLowerCase().includes(term)) ||
      (ls.viTri && ls.viTri.toLowerCase().includes(term)) ||
      (ls.tenNguoiMuon && ls.tenNguoiMuon.toLowerCase().includes(term)) ||
      (ls.mucDich && ls.mucDich.toLowerCase().includes(term))
    );
  });

  // Xử lý lọc theo ngày
  const handleFilterDates = () => {
    fetchThongKeTraPhong(dateFilter.tuNgay, dateFilter.denNgay);
  };

  // Xử lý hiển thị tất cả phản hồi
  const handleShowAllFeedbacks = () => {
    setShowAllFeedbacksModal(true);
  };

  // Lọc danh sách phản hồi
  const getFilteredFeedbacks = () => {
    if (!roomFeedbackStats || !roomFeedbackStats.recentFeedbacks) return [];
    
    // Tạo danh sách tất cả phản hồi (thực tế sẽ được lấy từ API)
    // Ở đây sử dụng recentFeedbacks để demo
    let allFeedbacks = [...roomFeedbackStats.recentFeedbacks];
    
    // Thêm một số phản hồi giả lập để demo tính năng lọc/sắp xếp
    allFeedbacks = [
      ...allFeedbacks,
      // {
      //   maPhong: "P103",
      //   viTri: "Tầng 1, Tòa A",
      //   rating: 3.5,
      //   comment: "Phòng khá ổn, nhưng thiếu một số thiết bị cần thiết.",
      //   userName: "Hoàng Văn D",
      //   daysAgo: 7,
      //   idPhanHoi: 4
      // },
      // {
      //   maPhong: "P205",
      //   viTri: "Tầng 2, Tòa B",
      //   rating: 5.0,
      //   comment: "Phòng rất tuyệt vời, đầy đủ tiện nghi và thoáng mát.",
      //   userName: "Nguyễn Thị E",
      //   daysAgo: 10,
      //   idPhanHoi: 5
      // }
    ];
    
    // Lọc theo từ khóa
    if (feedbackFilter) {
      const filter = feedbackFilter.toLowerCase();
      allFeedbacks = allFeedbacks.filter(
        f => f.maPhong.toLowerCase().includes(filter) || 
             f.viTri.toLowerCase().includes(filter) || 
             f.comment.toLowerCase().includes(filter) || 
             f.userName.toLowerCase().includes(filter)
      );
    }
    
    // Sắp xếp
    switch(feedbackSort) {
      case "highRating":
        return allFeedbacks.sort((a, b) => b.rating - a.rating);
      case "lowRating":
        return allFeedbacks.sort((a, b) => a.rating - b.rating);
      default:
        // Mặc định sắp xếp theo đánh giá cao nhất
        return allFeedbacks.sort((a, b) => b.rating - a.rating);
    }
  };

  // Phản hồi lại đánh giá
  const handleReplyToFeedback = async (feedback) => {
    // Lấy nội dung phản hồi từ người dùng
    const replyContent = prompt("Nhập nội dung phản hồi:", "");
    if (replyContent === null || replyContent.trim() === "") return;
    
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/phong/feedback/${feedback.idPhanHoi}/reply`, 
        { reply: replyContent }, 
        { headers: authHeader() }
      );
      
      toast.success("Đã phản hồi thành công");
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi phản hồi đánh giá:", error);
      toast.error("Có lỗi xảy ra khi phản hồi đánh giá");
      setLoading(false);
    }
  };
  
  // Đánh dấu đánh giá
  const handleFlagFeedback = async (feedback) => {
    if (!window.confirm("Bạn có chắc muốn đánh dấu phản hồi này không?")) return;
    
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/phong/feedback/${feedback.idPhanHoi}/flag`, 
        {}, 
        { headers: authHeader() }
      );
      
      toast.success("Đã đánh dấu phản hồi thành công");
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi đánh dấu phản hồi:", error);
      toast.error("Có lỗi xảy ra khi đánh dấu phản hồi");
      setLoading(false);
    }
  };

  // Xử lý khi tài khoản được thêm mới
  const handleTaiKhoanAdded = (vaiTro) => {
    console.log("Tài khoản mới được tạo với vai trò:", vaiTro);
    // Tăng refreshKey để các component con biết cần cập nhật dữ liệu
    setRefreshKey(prevKey => prevKey + 1);
    
    // Tự động chuyển sang tab tương ứng dựa trên vai trò tài khoản mới
    if (vaiTro === "ROLE_SV" && activeKey === "quanlytaikhoan") {
      setActiveKey("quanlysinhvien");
    } else if (vaiTro === "ROLE_GV" && activeKey === "quanlytaikhoan") {
      setActiveKey("quanlygiaovien");
    }
  };

  return (
    <Container fluid className="mt-4">
      <header className="mb-4">
        <h3>Trang Quản Lý</h3>
      </header>
      <Tab.Container id="admin-tabs" activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
      <Row>
          <Col md={3} className="mb-4">
          <Card>
            <Card.Header className="bg-primary text-white">Chức năng quản lý</Card.Header>
            <ListGroup variant="flush">
                <ListGroup.Item action eventKey="dashboard">Dashboard</ListGroup.Item>
                <ListGroup.Item action eventKey="quanlyphong">Quản lý phòng học</ListGroup.Item>
                <ListGroup.Item action eventKey="quanlygiaovien">Quản lý giảng viên</ListGroup.Item>
                <ListGroup.Item action eventKey="quanlysinhvien">Quản lý sinh viên</ListGroup.Item>
                <ListGroup.Item action eventKey="quanlytaikhoan">Quản lý tài khoản</ListGroup.Item>
                <ListGroup.Item action eventKey="duyetyeucau">Quản lý yêu cầu mượn phòng</ListGroup.Item>
                <ListGroup.Item action eventKey="lichsumuon">Lịch sử mượn phòng</ListGroup.Item>
                <ListGroup.Item action eventKey="baocao">Thống kê phản hồi</ListGroup.Item>
                <ListGroup.Item action eventKey="suco">Quản lý sự cố</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="dashboard">
          <Card>
            <Card.Body>
              <Card.Title>Dashboard Quản Lý</Card.Title>
              <Card.Text>
                Chào mừng đến với trang quản lý hệ thống mượn phòng học. 
                Tại đây bạn có thể quản lý tất cả các khía cạnh của hệ thống.
              </Card.Text>
              <hr />
              <h5>Thống kê hệ thống</h5>
                    
                    {loading ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                      </div>
                    ) : dashboardStats ? (
              <Row>
                <Col sm={6} md={3} className="mb-3">
                  <Card className="text-center bg-info text-white">
                    <Card.Body>
                              <h3>{dashboardStats.totalRooms}</h3>
                      <div>Phòng học</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={6} md={3} className="mb-3">
                  <Card className="text-center bg-success text-white">
                    <Card.Body>
                              <h3>{dashboardStats.totalLecturers}</h3>
                      <div>Giảng viên</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={6} md={3} className="mb-3">
                  <Card className="text-center bg-warning text-white">
                    <Card.Body>
                              <h3>{dashboardStats.totalStudents}</h3>
                      <div>Sinh viên</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={6} md={3} className="mb-3">
                  <Card className="text-center bg-danger text-white">
                    <Card.Body>
                              <h3>{dashboardStats.roomStatusCounts.DANGSUDUNG || 0}</h3>
                      <div>Đang mượn</div>
                    </Card.Body>
                  </Card>
                </Col>
                        <Col sm={6} md={6} className="mb-3">
                          <Card>
                            <Card.Body>
                              <h5 className="mb-3">Trạng thái phòng</h5>
                              {dashboardStats.roomStatusCounts && (
                                <div>
                                  <div className="d-flex justify-content-between mb-2">
                                    <div>Trống:</div>
                                    <div><strong>{dashboardStats.roomStatusCounts.TRONG || 0}</strong></div>
                                  </div>
                                  <div className="d-flex justify-content-between mb-2">
                                    <div>Đang sử dụng:</div>
                                    <div><strong>{dashboardStats.roomStatusCounts.DANGSUDUNG || 0}</strong></div>
                                  </div>
                                  <div className="d-flex justify-content-between mb-2">
                                    <div>Đang bảo trì:</div>
                                    <div><strong>{dashboardStats.roomStatusCounts.BAOTRI || 0}</strong></div>
                                  </div>
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col sm={6} md={6} className="mb-3">
                          <Card>
                            <Card.Body>
                              <h5 className="mb-3">Yêu cầu mượn phòng</h5>
                              <div className="d-flex justify-content-between mb-2">
                                <div>Đang chờ duyệt:</div>
                                <div><strong>{dashboardStats.pendingBookings}</strong></div>
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                <div>Đang sử dụng:</div>
                                <div><strong>{dashboardStats.activeBookings}</strong></div>
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                <div>Tổng người dùng:</div>
                                <div><strong>{dashboardStats.totalUsers}</strong></div>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
              </Row>
                    ) : (
                      <div className="text-center">
                        <p className="text-warning">Không thể tải thống kê. Vui lòng thử lại sau.</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="quanlytaikhoan">
                <TaiKhoanManager onTaiKhoanAdded={handleTaiKhoanAdded} />
              </Tab.Pane>
              <Tab.Pane eventKey="quanlyphong">
                <PhongManager />
              </Tab.Pane>
              <Tab.Pane eventKey="quanlygiaovien">
                <GiangVienManager refreshKey={refreshKey} />
              </Tab.Pane>
              <Tab.Pane eventKey="quanlysinhvien">
                <SinhVienManager refreshKey={refreshKey} />
              </Tab.Pane>
              <Tab.Pane eventKey="duyetyeucau">
                <YeuCauMuonPhongManager />
              </Tab.Pane>
              <Tab.Pane eventKey="baocao">
                <Card>
                  <Card.Body>
                    <Card.Title>Thống kê Phản Hồi</Card.Title>
                    <p className="mb-4">Xem đánh giá và phản hồi của người dùng về phòng học</p>
                    
                    {loading ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                      </div>
                    ) : roomFeedbackStats ? (
                      <>
                        <Row className="mb-4">
                          <Col sm={6} md={4} className="mb-3">
                            <Card className="text-center bg-info text-white">
                              <Card.Body>
                                <h3>{roomFeedbackStats.generalStats.averageRating}/5</h3>
                                <div>Đánh giá trung bình</div>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col sm={6} md={4} className="mb-3">
                            <Card className="text-center bg-success text-white">
                              <Card.Body>
                                <h3>{roomFeedbackStats.generalStats.totalFeedbackCount}</h3>
                                <div>Tổng số phản hồi</div>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col sm={6} md={4} className="mb-3">
                            <Card className="text-center bg-warning text-white">
                              <Card.Body>
                                <h3>{roomFeedbackStats.generalStats.positivePercentage}%</h3>
                                <div>Tỷ lệ đánh giá tích cực</div>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>

                        <h5 className="mb-3">Phòng được đánh giá cao nhất</h5>
                        <Table striped bordered hover className="mb-4">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Phòng</th>
                              <th>Vị trí</th>
                              <th>Điểm trung bình</th>
                              <th>Số phản hồi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {roomFeedbackStats.topRatedRooms.map((room, index) => (
                              <tr key={room.maPhong}>
                                <td>{index + 1}</td>
                                <td>{room.maPhong}</td>
                                <td>{room.viTri}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <strong className="me-2">{room.rating}</strong>
                                    <ProgressBar 
                                      variant="success" 
                                      now={room.rating * 20} 
                                      style={{ height: "8px", width: "100%" }}
                                    />
                                  </div>
                                </td>
                                <td>{room.feedbackCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <h5 className="mb-3">Phòng được đánh giá thấp nhất</h5>
                        <Table striped bordered hover className="mb-4">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Phòng</th>
                              <th>Vị trí</th>
                              <th>Điểm trung bình</th>
                              <th>Số phản hồi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {roomFeedbackStats.lowRatedRooms.map((room, index) => (
                              <tr key={room.maPhong}>
                                <td>{index + 1}</td>
                                <td>{room.maPhong}</td>
                                <td>{room.viTri}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <strong className="me-2">{room.rating}</strong>
                                    <ProgressBar 
                                      variant={room.rating < 3 ? "danger" : "warning"} 
                                      now={room.rating * 20} 
                                      style={{ height: "8px", width: "100%" }}
                                    />
                                  </div>
                                </td>
                                <td>{room.feedbackCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <h5 className="mb-3">Phản hồi gần đây</h5>
                        <div className="list-group mb-3">
                          {roomFeedbackStats.recentFeedbacks.map((feedback, index) => (
                            <div className="list-group-item" key={feedback.idPhanHoi || `feedback-${index}-${feedback.maPhong}`}>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <h6 className="mb-0">
                                  <strong>{feedback.maPhong}</strong> ({feedback.viTri})
                                  <Badge bg={feedback.rating >= 4 ? "success" : feedback.rating >= 3 ? "warning" : "danger"} className="ms-2">
                                    {feedback.rating}
                                  </Badge>
                                </h6>
                                <small className="text-muted">{feedback.daysAgo} ngày trước</small>
                              </div>
                              <p className="mb-1">{feedback.comment}</p>
                              <small className="text-muted">Người phản hồi: {feedback.userName}</small>
                            </div>
                          ))}
                        </div>

                        <div className="text-end">
                          <Button variant="primary" onClick={handleShowAllFeedbacks}>Xem tất cả phản hồi</Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <p className="text-warning">Không thể tải thống kê. Vui lòng thử lại sau.</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="lichsumuon">
                <Card>
                  <Card.Header>
                    <Tabs
                      activeKey={thongKeTabKey} 
                      onSelect={(k) => setThongKeTabKey(k)}
                      className="mb-3"
                    >
                      <Tab eventKey="overall" title="Tổng quan">
                      </Tab>
                      <Tab eventKey="history" title="Chi tiết lịch sử mượn phòng">
                      </Tab>
                    </Tabs>
                  </Card.Header>
                  <Card.Body>
                    {loading ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2">Đang tải dữ liệu...</p>
                      </div>
                    ) : thongKeTabKey === "overall" ? (
                      // Tab thống kê tổng quan
                      <>
                        {thongKeTraPhong ? (
                          <div>
                            <div className="mb-4">
                              <h4 className="mb-3">Thống kê tổng quan</h4>
                              <Row className="mb-4">
                                <Col md={6}>
                                  <Card className="text-center h-100">
                                    <Card.Body>
                                      <h5>Tổng số lượt mượn phòng</h5>
                                      <h2 className="display-4">{thongKeTraPhong.tongSoLuot}</h2>
                                      <div className="d-flex justify-content-around mt-3">
                                        <div>
                                          <h5 className="text-success">
                                            <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
                                            Đúng hạn: {thongKeTraPhong.dungHan}
                                          </h5>
                                          <small>({thongKeTraPhong.phanTramDungHan.toFixed(1)}%)</small>
                                        </div>
                                        <div>
                                          <h5 className="text-danger">
                                            <FontAwesomeIcon icon={faCalendarTimes} className="me-2" />
                                            Trễ hạn: {thongKeTraPhong.treHan}
                                          </h5>
                                          <small>({thongKeTraPhong.phanTramTreHan.toFixed(1)}%)</small>
                                        </div>
                                      </div>
                                    </Card.Body>
                                  </Card>
                                </Col>
                                <Col md={6}>
                                  <Card className="h-100">
                                    <Card.Body>
                                      <h5 className="text-center mb-3">Tỷ lệ trả phòng</h5>
                                      <div className="position-relative" style={{ height: "150px" }}>
                                        <div className="position-absolute top-50 start-50 translate-middle text-center">
                                          <h3>{thongKeTraPhong.phanTramDungHan.toFixed(1)}%</h3>
                                          <small>Đúng hạn</small>
                                        </div>
                                        <ProgressBar style={{ height: "30px" }}>
                                          <ProgressBar variant="success" now={thongKeTraPhong.phanTramDungHan} key={1} />
                                          <ProgressBar variant="danger" now={thongKeTraPhong.phanTramTreHan} key={2} />
                                        </ProgressBar>
                                      </div>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              </Row>
                              
                              <div className="mt-4">
                                <Accordion>
                                  <Accordion.Item eventKey="0">
                                    <Accordion.Header>Thống kê theo người mượn</Accordion.Header>
                                    <Accordion.Body>
                                      <Table striped bordered hover responsive>
                                        <thead>
                                          <tr>
                                            <th>STT</th>
                                            <th>Người mượn</th>
                                            <th>Tổng số lượt</th>
                                            <th>Đúng hạn</th>
                                            <th>Trễ hạn</th>
                                            <th>Tỷ lệ đúng hạn</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {thongKeTraPhong.thongKeTheoNguoiMuon.map((item, index) => {
                                            const tongSoLuot = item.tongSoLuot;
                                            const phanTramDungHan = tongSoLuot > 0 ? (item.dungHan * 100 / tongSoLuot).toFixed(1) : 0;
                                            return (
                                              <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.tenNguoiMuon}</td>
                                                <td className="text-center">{tongSoLuot}</td>
                                                <td className="text-center text-success">{item.dungHan}</td>
                                                <td className="text-center text-danger">{item.treHan}</td>
                                                <td>
                                                  <div className="d-flex align-items-center">
                                                    <div style={{ width: "60px" }}>{phanTramDungHan}%</div>
                                                    <ProgressBar 
                                                      style={{ height: "8px", flex: 1 }}
                                                      variant={phanTramDungHan >= 80 ? "success" : phanTramDungHan >= 50 ? "warning" : "danger"} 
                                                      now={phanTramDungHan} 
                                                    />
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                          {thongKeTraPhong.thongKeTheoNguoiMuon.length === 0 && (
                                            <tr>
                                              <td colSpan="6" className="text-center">Không có dữ liệu</td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </Table>
                                    </Accordion.Body>
                                  </Accordion.Item>
                                  <Accordion.Item eventKey="1">
                                    <Accordion.Header>Thống kê theo phòng</Accordion.Header>
                                    <Accordion.Body>
                                      <Table striped bordered hover responsive>
                                        <thead>
                                          <tr>
                                            <th>STT</th>
                                            <th>Mã phòng</th>
                                            <th>Vị trí</th>
                                            <th>Tổng số lượt</th>
                                            <th>Đúng hạn</th>
                                            <th>Trễ hạn</th>
                                            <th>Tỷ lệ đúng hạn</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {thongKeTraPhong.thongKeTheoPhong.map((item, index) => {
                                            const tongSoLuot = item.tongSoLuot;
                                            const phanTramDungHan = tongSoLuot > 0 ? (item.dungHan * 100 / tongSoLuot).toFixed(1) : 0;
                                            return (
                                              <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.maPhong}</td>
                                                <td>{item.viTri}</td>
                                                <td className="text-center">{tongSoLuot}</td>
                                                <td className="text-center text-success">{item.dungHan}</td>
                                                <td className="text-center text-danger">{item.treHan}</td>
                                                <td>
                                                  <div className="d-flex align-items-center">
                                                    <div style={{ width: "60px" }}>{phanTramDungHan}%</div>
                                                    <ProgressBar 
                                                      style={{ height: "8px", flex: 1 }}
                                                      variant={phanTramDungHan >= 80 ? "success" : phanTramDungHan >= 50 ? "warning" : "danger"} 
                                                      now={phanTramDungHan} 
                                                    />
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                          {thongKeTraPhong.thongKeTheoPhong.length === 0 && (
                                            <tr>
                                              <td colSpan="7" className="text-center">Không có dữ liệu</td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </Table>
                                    </Accordion.Body>
                                  </Accordion.Item>
                                </Accordion>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Alert variant="info">Không có dữ liệu thống kê.</Alert>
                        )}
                      </>
                    ) : (
                      // Tab danh sách chi tiết
                      <>
                        <h4 className="mb-3">Lịch sử mượn phòng</h4>
                        <Row className="mb-3">
                          <Col md={6}>
                            <InputGroup>
                              <InputGroup.Text>
                                <FontAwesomeIcon icon={faSearch} />
                              </InputGroup.Text>
                              <Form.Control
                                placeholder="Tìm kiếm theo phòng, người mượn, mục đích..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </InputGroup>
                          </Col>
                        </Row>
                        
                        {filteredLichSu.length > 0 ? (
                          <Table striped bordered hover responsive>
                            <thead>
                              <tr>
                                <th>Mã phòng</th>
                                <th>Vị trí</th>
                                <th>Người mượn</th>
                                <th>Mục đích</th>
                                <th>Thời gian mượn</th>
                                <th>Thời gian trả dự kiến</th>
                                <th>Thời gian trả thực tế</th>
                                <th>Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredLichSu.map((ls, index) => {
                                // Format dates
                                const thoiGianMuon = new Date(ls.thoiGianMuon).toLocaleString();
                                const thoiGianTraDuKien = new Date(ls.thoiGianTraDuKien).toLocaleString();
                                const thoiGianTraThucTe = ls.thoiGianTraThucTe ? new Date(ls.thoiGianTraThucTe).toLocaleString() : "-";
                                
                                const isDungHan = ls.trangThaiTra === "DungHan";
                                
                                return (
                                  <tr key={index}>
                                    <td>{ls.maPhong}</td>
                                    <td>{ls.viTri}</td>
                                    <td>{ls.tenNguoiMuon}</td>
                                    <td>{ls.mucDich}</td>
                                    <td>{thoiGianMuon}</td>
                                    <td>{thoiGianTraDuKien}</td>
                                    <td>{thoiGianTraThucTe}</td>
                                    <td>
                                      {ls.trangThaiTra === "DungHan" ? (
                                        <Badge bg="success">
                                          <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                          Đúng hạn
                                        </Badge>
                                      ) : (
                                        <Badge bg="danger">
                                          <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                                          Trễ hạn
                                        </Badge>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        ) : (
                          <Alert variant="info">
                            Không tìm thấy lịch sử mượn phòng phù hợp với từ khóa "{searchTerm}".
                          </Alert>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="suco">
                <SuCoManager />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
      
      {/* Modal xem tất cả phản hồi */}
      <Modal 
        show={showAllFeedbacksModal} 
        onHide={() => setShowAllFeedbacksModal(false)} 
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Tất cả phản hồi về phòng học</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm phản hồi..."
                  value={feedbackFilter}
                  onChange={(e) => setFeedbackFilter(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Select
                  value={feedbackSort}
                  onChange={(e) => setFeedbackSort(e.target.value)}
                >
                  <option value="highRating">Đánh giá cao nhất</option>
                  <option value="lowRating">Đánh giá thấp nhất</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          {getFilteredFeedbacks().length > 0 ? (
            <div className="list-group">
              {getFilteredFeedbacks().map((feedback, index) => (
                <div className="list-group-item" key={feedback.idPhanHoi || `all-feedback-${index}`}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">
                      <strong>{feedback.maPhong}</strong> ({feedback.viTri})
                      <Badge 
                        bg={feedback.rating >= 4 ? "success" : feedback.rating >= 3 ? "warning" : "danger"} 
                        className="ms-2"
                      >
                        {feedback.rating}
                      </Badge>
                    </h6>
                    <small className="text-muted">{feedback.daysAgo} ngày trước</small>
                  </div>
                  <p className="mb-2">{feedback.comment}</p>
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">Người phản hồi: {feedback.userName}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-info">Không tìm thấy phản hồi nào phù hợp với điều kiện lọc.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAllFeedbacksModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BoardAdmin; 