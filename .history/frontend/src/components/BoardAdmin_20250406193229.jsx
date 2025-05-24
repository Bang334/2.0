import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, ListGroup, Tab } from "react-bootstrap";
import TaiKhoanManager from "./TaiKhoanManager";
import PhongManager from "./PhongManager";
import GiangVienManager from "./GiangVienManager";
import SinhVienManager from "./SinhVienManager";
import YeuCauMuonPhongManager from "./YeuCauMuonPhongManager";

const BoardAdmin = () => {
  const [activeKey, setActiveKey] = useState("dashboard");
  const [content, setContent] = useState("");

  useEffect(() => {
    setContent("Quản Lý Content");
  }, []);

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
                    <Row>
                      <Col sm={6} md={3} className="mb-3">
                        <Card className="text-center bg-info text-white">
                          <Card.Body>
                            <h3>42</h3>
                            <div>Phòng học</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col sm={6} md={3} className="mb-3">
                        <Card className="text-center bg-success text-white">
                          <Card.Body>
                            <h3>125</h3>
                            <div>Giảng viên</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col sm={6} md={3} className="mb-3">
                        <Card className="text-center bg-warning text-white">
                          <Card.Body>
                            <h3>1,250</h3>
                            <div>Sinh viên</div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col sm={6} md={3} className="mb-3">
                        <Card className="text-center bg-danger text-white">
                          <Card.Body>
                            <h3>25</h3>
                            <div>Đang mượn</div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
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
                    <Card.Title>Báo cáo & Thống kê</Card.Title>
                    <p className="mb-4">Truy cập các báo cáo thống kê từ các mục quản lý:</p>
                    
                    <div className="list-group">
                      <a 
                        href="#" 
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveKey("quanlyphong");
                          setTimeout(() => {
                            document.getElementById("phong-stats-btn")?.click();
                          }, 100);
                        }}
                      >
                        <div>
                          <h5 className="mb-1">Thống kê phòng học</h5>
                          <p className="mb-1 text-muted">Xem thống kê về phòng học, sức chứa, tình trạng sử dụng</p>
                        </div>
                        <span className="badge bg-primary rounded-pill">→</span>
                      </a>
                      
                      <a 
                        href="#" 
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveKey("quanlygiaovien");
                          setTimeout(() => {
                            document.getElementById("giangvien-stats-btn")?.click();
                          }, 100);
                        }}
                      >
                        <div>
                          <h5 className="mb-1">Thống kê giảng viên</h5>
                          <p className="mb-1 text-muted">Xem thống kê về giảng viên theo khoa, giới tính, tình trạng đăng ký</p>
                        </div>
                        <span className="badge bg-primary rounded-pill">→</span>
                      </a>
                      
                      <a 
                        href="#" 
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveKey("duyetyeucau");
                          setTimeout(() => {
                            document.getElementById("yeucau-stats-btn")?.click();
                          }, 100);
                        }}
                      >
                        <div>
                          <h5 className="mb-1">Thống kê trả phòng</h5>
                          <p className="mb-1 text-muted">Xem thống kê về tình trạng trả phòng, trả trễ, và người mượn</p>
                        </div>
                        <span className="badge bg-primary rounded-pill">→</span>
                      </a>
                    </div>
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