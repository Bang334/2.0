import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Spinner } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import UserService from '../services/user.service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SuCoManager = () => {
  const [suCoList, setSuCoList] = useState([]);
  const [filteredSuCo, setFilteredSuCo] = useState([]);
  const [selectedTrangThai, setSelectedTrangThai] = useState('TATCA');
  const [thongKe, setThongKe] = useState({
    tongSoSuCo: 0,
    soLuongTheoTrangThai: {
      CHOXULY: 0,
      DANGXULY: 0,
      DAXULY: 0,
      HUY: 0
    },
    thongKeTheoThang: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterSuCo();
  }, [selectedTrangThai, suCoList]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [suCoResponse, thongKeResponse] = await Promise.all([
        UserService.getAllSuCo(),
        UserService.getThongKeSuCo()
      ]);
      setSuCoList(suCoResponse.data);
      setThongKe(thongKeResponse.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSuCo = () => {
    if (selectedTrangThai === 'TATCA') {
      setFilteredSuCo(suCoList);
    } else {
      setFilteredSuCo(suCoList.filter(suCo => suCo.trangThai === selectedTrangThai));
    }
  };

  const handleTrangThaiChange = async (id, newTrangThai) => {
    try {
      await UserService.updateTrangThaiSuCo(id, newTrangThai);
      await fetchData();
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
    }
  };

  const getTrangThaiBadge = (trangThai) => {
    const colors = {
      'CHOXULY': 'warning',
      'DANGXULY': 'primary',
      'DAXULY': 'success',
      'HUY': 'danger'
    };
    return <Badge bg={colors[trangThai] || 'secondary'}>{trangThai}</Badge>;
  };

  const chartData = {
    labels: thongKe?.thongKeTheoThang.map(item => item.thang) || [],
    datasets: [
      {
        label: 'Số sự cố',
        data: thongKe?.thongKeTheoThang.map(item => item.soLuong) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>Quản lý sự cố</h2>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Thống kê sự cố theo tháng</Card.Title>
              <Line data={chartData} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Tổng quan</Card.Title>
              <Table striped bordered hover size="sm">
                <tbody>
                  <tr>
                    <td>Tổng số sự cố</td>
                    <td>{thongKe?.tongSoSuCo}</td>
                  </tr>
                  <tr>
                    <td>Đang chờ xử lý</td>
                    <td>{thongKe?.soLuongTheoTrangThai.CHOXULY}</td>
                  </tr>
                  <tr>
                    <td>Đang xử lý</td>
                    <td>{thongKe?.soLuongTheoTrangThai.DANGXULY}</td>
                  </tr>
                  <tr>
                    <td>Đã xử lý</td>
                    <td>{thongKe?.soLuongTheoTrangThai.DAXULY}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Select 
            value={selectedTrangThai}
            onChange={(e) => setSelectedTrangThai(e.target.value)}
          >
            <option value="TATCA">Tất cả</option>
            <option value="CHOXULY">Chờ xử lý</option>
            <option value="DANGXULY">Đang xử lý</option>
            <option value="DAXULY">Đã xử lý</option>
            <option value="HUY">Hủy</option>
          </Form.Select>
        </Col>
      </Row>

      <Row>
        <Col>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Mã sự cố</th>
                <th>Loại sự cố</th>
                <th>Mô tả</th>
                <th>Phòng</th>
                <th>Người báo</th>
                <th>Thời gian báo</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuCo.map((suCo) => (
                <tr key={suCo.id}>
                  <td>{suCo.id}</td>
                  <td>{suCo.loaiSuCo}</td>
                  <td>{suCo.moTa}</td>
                  <td>{suCo.phong?.tenPhong}</td>
                  <td>{suCo.nguoiBao?.hoTen}</td>
                  <td>{new Date(suCo.thoiGianBao).toLocaleString()}</td>
                  <td>{getTrangThaiBadge(suCo.trangThai)}</td>
                  <td>
                    {suCo.trangThai === 'CHOXULY' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleTrangThaiChange(suCo.id, 'DANGXULY')}
                      >
                        Tiếp nhận
                      </Button>
                    )}
                    {suCo.trangThai === 'DANGXULY' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleTrangThaiChange(suCo.id, 'DAXULY')}
                      >
                        Hoàn thành
                      </Button>
                    )}
                    {(suCo.trangThai === 'CHOXULY' || suCo.trangThai === 'DANGXULY') && (
                      <Button
                        variant="danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleTrangThaiChange(suCo.id, 'HUY')}
                      >
                        Hủy
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default SuCoManager;