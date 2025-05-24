import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaGraduationCap, FaCalendarAlt, FaBuilding, FaUsers, FaUserTie } from 'react-icons/fa';

const Home = () => {
  return (
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="mb-5">
        <Col md={12} className="text-center">
          <div className="hero-section py-5">
            <h1 className="display-4 mb-3">Hệ Thống Quản Lý Mượn Phòng</h1>
            <p className="lead mb-4">
              Giải pháp quản lý toàn diện cho các hoạt động đào tạo, lịch học và mượn phòng
            </p>
            <FaGraduationCap size={60} className="text-primary mb-4" />
          </div>
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="mb-5">
        <Col md={12} className="text-center mb-4">
          <h2 className="section-title">Tính năng hệ thống</h2>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 feature-card">
            <Card.Body className="text-center">
              <FaCalendarAlt size={40} className="text-primary mb-3" />
              <Card.Title>Lịch học thông minh</Card.Title>
              <Card.Text>
                Xem lịch học theo tuần, quản lý thời khóa biểu dễ dàng và thuận tiện.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 feature-card">
            <Card.Body className="text-center">
              <FaBuilding size={40} className="text-primary mb-3" />
              <Card.Title>Quản lý phòng học</Card.Title>
              <Card.Text>
                Đăng ký, mượn phòng và theo dõi tình trạng sử dụng phòng học.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 feature-card">
            <Card.Body className="text-center">
              <FaUsers size={40} className="text-primary mb-3" />
              <Card.Title>Quản lý lớp học</Card.Title>
              <Card.Text>
                Xem danh sách sinh viên, quản lý điểm danh và thông tin lớp học.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Login Section */}
      <Row className="mb-5">
        <Col md={8} className="mx-auto">
          <Card className="login-card">
            <Card.Body className="p-4">
              <Row>
                <Col md={6} className="text-center border-end pe-4">
                  <FaUserTie size={50} className="text-primary mb-3" />
                  <h3>Giảng viên</h3>
                  <p>Quản lý lịch dạy, lớp học và mượn phòng một cách hiệu quả</p>
                  <Button variant="primary" href="/login" className="mt-2">Đăng nhập dành cho giảng viên</Button>
                </Col>
                <Col md={6} className="text-center ps-4">
                  <FaUsers size={50} className="text-primary mb-3" />
                  <h3>Sinh viên</h3>
                  <p>Xem lịch học, thông báo và quản lý hoạt động học tập</p>
                  <Button variant="primary" href="/login" className="mt-2">Đăng nhập dành cho sinh viên</Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* About System */}
      <Row>
        <Col md={12}>
          <Card className="about-card">
            <Card.Body>
              <h3 className="text-center mb-4">Về hệ thống</h3>
              <p>Hệ thống quản lý mượn phòng được phát triển nhằm nâng cao hiệu quả quản lý và tổ chức việc sử dụng phòng học, phòng hội thảo, giúp tiết kiệm thời gian và nguồn lực. Hệ thống được xây dựng với công nghệ hiện đại:</p>
              <Row className="mt-4">
                <Col md={6}>
                  <ul className="feature-list">
                    <li>Spring Boot & Spring Security cho phía máy chủ</li>
                    <li>Xác thực bảo mật với JWT</li>
                    <li>Giao diện người dùng với React và Bootstrap</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <ul className="feature-list">
                    <li>Cơ sở dữ liệu MySQL cho lưu trữ an toàn</li>
                    <li>Thiết kế responsive cho mọi thiết bị</li>
                    <li>API RESTful cho tích hợp linh hoạt</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home; 