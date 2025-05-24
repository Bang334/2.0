import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, ListGroup } from "react-bootstrap";

const BoardAdmin = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    setContent("Quản Lý Content");
  }, []);

  return (
    <Container>
      <header className="jumbotron">
        <h3>Trang Quản Lý</h3>
      </header>
      <Row>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Header className="bg-primary text-white">Chức năng quản lý</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item action href="#quanlyphong">Quản lý phòng học</ListGroup.Item>
              <ListGroup.Item action href="#quanlygiaovien">Quản lý giảng viên</ListGroup.Item>
              <ListGroup.Item action href="#quanlysinhvien">Quản lý sinh viên</ListGroup.Item>
              <ListGroup.Item action href="#quanlytaikhoan">Quản lý tài khoản</ListGroup.Item>
              <ListGroup.Item action href="#baocao">Báo cáo & Thống kê</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
        <Col md={8}>
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
        </Col>
      </Row>
    </Container>
  );
};

export default BoardAdmin; 