import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, ListGroup, Tab, Spinner, Table, ProgressBar, Badge, Button } from "react-bootstrap";
import axios from "axios";
import authHeader from "../services/auth-header";
import TaiKhoanManager from "./TaiKhoanManager";
import PhongManager from "./PhongManager";
import GiangVienManager from "./GiangVienManager";
import SinhVienManager from "./SinhVienManager";
import YeuCauMuonPhongManager from "./YeuCauMuonPhongManager";

const API_URL = "http://localhost:8080/api/quanly";

const BoardAdmin = () => {
  const [activeKey, setActiveKey] = useState("dashboard");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeKey === "dashboard") {
      fetchDashboardStats();
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
                <ListGroup.Item action eventKey="duyetyeucau">Duyệt yêu cầu mượn phòng</ListGroup.Item>
                <ListGroup.Item action eventKey="baocao">Báo cáo & Thống kê</ListGroup.Item>
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
                              <h3>{dashboardStats.activeBookings}</h3>
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
                      <div className="alert alert-warning">
                        Không thể tải thống kê. Vui lòng thử lại sau.
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="quanlytaikhoan">
                <TaiKhoanManager />
              </Tab.Pane>
              <Tab.Pane eventKey="quanlyphong">
                <PhongManager />
              </Tab.Pane>
              <Tab.Pane eventKey="quanlygiaovien">
                <GiangVienManager />
              </Tab.Pane>
              <Tab.Pane eventKey="quanlysinhvien">
                <SinhVienManager />
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
                    ) : (
                      <>
                        <Row className="mb-4">
                          <Col sm={6} md={4} className="mb-3">
                            <Card className="text-center bg-info text-white">
                              <Card.Body>
                                <h3>4.2/5</h3>
                                <div>Đánh giá trung bình</div>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col sm={6} md={4} className="mb-3">
                            <Card className="text-center bg-success text-white">
                              <Card.Body>
                                <h3>120</h3>
                                <div>Tổng số phản hồi</div>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col sm={6} md={4} className="mb-3">
                            <Card className="text-center bg-warning text-white">
                              <Card.Body>
                                <h3>78%</h3>
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
                            <tr>
                              <td>1</td>
                              <td>P201</td>
                              <td>Tầng 2, Tòa A</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <strong className="me-2">4.9</strong>
                                  <ProgressBar 
                                    variant="success" 
                                    now={98} 
                                    style={{ height: "8px", width: "100%" }}
                                  />
                                </div>
                              </td>
                              <td>24</td>
                            </tr>
                            <tr>
                              <td>2</td>
                              <td>P305</td>
                              <td>Tầng 3, Tòa B</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <strong className="me-2">4.7</strong>
                                  <ProgressBar 
                                    variant="success" 
                                    now={94} 
                                    style={{ height: "8px", width: "100%" }}
                                  />
                                </div>
                              </td>
                              <td>18</td>
                            </tr>
                            <tr>
                              <td>3</td>
                              <td>P101</td>
                              <td>Tầng 1, Tòa A</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <strong className="me-2">4.5</strong>
                                  <ProgressBar 
                                    variant="success" 
                                    now={90} 
                                    style={{ height: "8px", width: "100%" }}
                                  />
                                </div>
                              </td>
                              <td>32</td>
                            </tr>
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
                            <tr>
                              <td>1</td>
                              <td>P401</td>
                              <td>Tầng 4, Tòa C</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <strong className="me-2">2.1</strong>
                                  <ProgressBar 
                                    variant="danger" 
                                    now={42} 
                                    style={{ height: "8px", width: "100%" }}
                                  />
                                </div>
                              </td>
                              <td>16</td>
                            </tr>
                            <tr>
                              <td>2</td>
                              <td>P105</td>
                              <td>Tầng 1, Tòa D</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <strong className="me-2">2.8</strong>
                                  <ProgressBar 
                                    variant="warning" 
                                    now={56} 
                                    style={{ height: "8px", width: "100%" }}
                                  />
                                </div>
                              </td>
                              <td>13</td>
                            </tr>
                            <tr>
                              <td>3</td>
                              <td>P202</td>
                              <td>Tầng 2, Tòa B</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <strong className="me-2">3.2</strong>
                                  <ProgressBar 
                                    variant="warning" 
                                    now={64} 
                                    style={{ height: "8px", width: "100%" }}
                                  />
                                </div>
                              </td>
                              <td>17</td>
                            </tr>
                          </tbody>
                        </Table>

                        <h5 className="mb-3">Phản hồi gần đây</h5>
                        <div className="list-group mb-3">
                          <div className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h6 className="mb-0">
                                <strong>P201</strong> (Tầng 2, Tòa A)
                                <Badge bg="success" className="ms-2">5.0</Badge>
                              </h6>
                              <small className="text-muted">2 ngày trước</small>
                            </div>
                            <p className="mb-1">Phòng rất rộng, thoáng mát và được trang bị đầy đủ thiết bị hiện đại.</p>
                            <small className="text-muted">Người phản hồi: Nguyễn Văn A</small>
                          </div>
                          <div className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h6 className="mb-0">
                                <strong>P401</strong> (Tầng 4, Tòa C)
                                <Badge bg="danger" className="ms-2">1.5</Badge>
                              </h6>
                              <small className="text-muted">3 ngày trước</small>
                            </div>
                            <p className="mb-1">Điều hòa bị hỏng, phòng rất nóng. Thiết bị đã cũ và không hoạt động tốt.</p>
                            <small className="text-muted">Người phản hồi: Trần Thị B</small>
                          </div>
                          <div className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h6 className="mb-0">
                                <strong>P305</strong> (Tầng 3, Tòa B)
                                <Badge bg="success" className="ms-2">4.5</Badge>
                              </h6>
                              <small className="text-muted">5 ngày trước</small>
                            </div>
                            <p className="mb-1">Phòng học tốt, âm thanh rõ ràng, ánh sáng đầy đủ. Rất phù hợp cho các buổi thuyết trình.</p>
                            <small className="text-muted">Người phản hồi: Lê Văn C</small>
                          </div>
                        </div>

                        <div className="text-end">
                          <Button variant="primary">Xem tất cả phản hồi</Button>
                        </div>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default BoardAdmin; 