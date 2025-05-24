import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, ListGroup, Table, Badge } from "react-bootstrap";

const BoardUser = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    setContent("Sinh Viên Content");
  }, []);

  return (
    <Container>
      <header className="jumbotron">
        <h3>Trang Sinh Viên</h3>
      </header>
      <Row>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Header className="bg-info text-white">Dịch vụ sinh viên</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item action href="#lichhoc">Lịch học</ListGroup.Item>
              <ListGroup.Item action href="#lichmop">Lịch mở phòng</ListGroup.Item>
              <ListGroup.Item action href="#timphong">Tìm phòng trống</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Lịch học hôm nay</Card.Title>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Môn học</th>
                    <th>Phòng</th>
                    <th>Giảng viên</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>07:30 - 09:30</td>
                    <td>Cấu trúc dữ liệu và giải thuật</td>
                    <td>A101</td>
                    <td>Nguyễn Văn A</td>
                  </tr>
                  <tr>
                    <td>09:45 - 11:45</td>
                    <td>Lập trình Web</td>
                    <td>B205</td>
                    <td>Trần Thị B</td>
                  </tr>
                  <tr>
                    <td>13:30 - 15:30</td>
                    <td>Phát triển phần mềm</td>
                    <td>C103</td>
                    <td>Lê Văn C</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body>
              <Card.Title>Phòng học trống</Card.Title>
              <Card.Subtitle className="mb-3 text-muted">Có thể sử dụng cho tự học hoặc thảo luận nhóm</Card.Subtitle>
              
              <Row className="mb-3">
                {["A105", "A107", "B201", "C102"].map((room, index) => (
                  <Col xs={6} md={3} key={index} className="mb-2">
                    <Card className="text-center">
                      <Card.Body>
                        <h5>{room}</h5>
                        <Badge bg="success">Trống</Badge>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
              
              <Card.Link href="#timphong">Xem tất cả phòng trống</Card.Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BoardUser; 