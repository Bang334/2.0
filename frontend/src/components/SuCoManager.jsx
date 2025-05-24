import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Form,
  Spinner,
} from "react-bootstrap";
import UserService from "../services/user.service";

const SuCoManager = () => {
  const [suCoList, setSuCoList] = useState([]);
  const [filteredSuCo, setFilteredSuCo] = useState([]);
  const [selectedTrangThai, setSelectedTrangThai] = useState("TATCA");
  const [thongKe, setThongKe] = useState({
    tongSoSuCo: 0,
    soLuongTheoTrangThai: {
      ChuaXuLy: 0,
      DangXuLy: 0,
      DaXuLy: 0,
    },
    thongKeTheoPhong: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterSuCo();
  }, [selectedTrangThai, suCoList]);

  useEffect(() => {
    // Thống kê theo phòng dựa trên filteredSuCo
    const thongKeMap = {};
    filteredSuCo.forEach((suCo) => {
      const maPhong = suCo.phong?.maPhong || "Không xác định";
      thongKeMap[maPhong] = (thongKeMap[maPhong] || 0) + 1;
    });

    const thongKeTheoPhong = Object.entries(thongKeMap).map(
      ([maPhong, count]) => ({
        maPhong,
        count,
      })
    );

    setThongKe((prev) => ({
      ...prev,
      thongKeTheoPhong,
    }));
  }, [filteredSuCo]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const suCoResponse = await UserService.getAllSuCo();
      
      // Kiểm tra và đảm bảo dữ liệu là mảng
      const suCoData = Array.isArray(suCoResponse.data) ? suCoResponse.data : [];
      
      setSuCoList(suCoData);

      // Tính thống kê tổng quan
      const thongKeData = {
        tongSoSuCo: suCoData.length,
        soLuongTheoTrangThai: {
          ChuaXuLy: 0,
          DangXuLy: 0,
          DaXuLy: 0,
        },
        thongKeTheoPhong: [],
      };

      // Kiểm tra trước khi dùng forEach
      if (suCoData.length > 0) {
        suCoData.forEach((suCo) => {
          thongKeData.soLuongTheoTrangThai[suCo.trangThai] =
            (thongKeData.soLuongTheoTrangThai[suCo.trangThai] || 0) + 1;
        });
      }

      setThongKe(thongKeData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterSuCo = () => {
    if (selectedTrangThai === "TATCA") {
      setFilteredSuCo(suCoList);
    } else {
      setFilteredSuCo(
        suCoList.filter((suCo) => suCo.trangThai === selectedTrangThai)
      );
    }
  };

  const handleTrangThaiChange = async (id, newTrangThai) => {
    try {
      await UserService.updateTrangThaiSuCo(id, newTrangThai);
      await fetchData();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  const getTrangThaiBadge = (trangThai) => {
    const colors = {
      ChuaXuLy: "warning",
      DangXuLy: "primary",
      DaXuLy: "success",
    };
    return <Badge bg={colors[trangThai] || "secondary"}>{trangThai}</Badge>;
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
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Quản lý sự cố</h2>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>
                Thống kê sự cố phòng (theo bộ lọc hiện tại)
              </Card.Title>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Phòng</th>
                    <th>Số sự cố</th>
                  </tr>
                </thead>
                <tbody>
                  {thongKe.thongKeTheoPhong.map((item, index) => (
                    <tr key={index}>
                      <td>{item.maPhong}</td>
                      <td>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
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
                    <td>{thongKe.tongSoSuCo}</td>
                  </tr>
                  <tr>
                    <td>Chưa xử lý</td>
                    <td>{thongKe.soLuongTheoTrangThai.ChuaXuLy}</td>
                  </tr>
                  <tr>
                    <td>Đang xử lý</td>
                    <td>{thongKe.soLuongTheoTrangThai.DangXuLy}</td>
                  </tr>
                  <tr>
                    <td>Đã xử lý</td>
                    <td>{thongKe.soLuongTheoTrangThai.DaXuLy}</td>
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
            <option value="ChuaXuLy">Chưa xử lý</option>
            <option value="DangXuLy">Đang xử lý</option>
            <option value="DaXuLy">Đã xử lý</option>
          </Form.Select>
        </Col>
      </Row>

      <Row>
        <Col>
          <div className="table-scrollable">
            <Table className="suco-table">
            <thead>
              <tr>
                <th>Mã sự cố</th>
                <th>Mô tả</th>
                <th>Phòng</th>
                <th>Thời gian báo</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuCo.map((suCo) => (
                <tr key={suCo.idSuCo}>
                  <td>{suCo.idSuCo}</td>
                  <td>{suCo.moTa}</td>
                  <td>{suCo.phong?.maPhong}</td>
                  <td>{new Date(suCo.thoiGianBaoCao).toLocaleString()}</td>
                  <td>{getTrangThaiBadge(suCo.trangThai)}</td>
                  <td>
                    {suCo.trangThai === "ChuaXuLy" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          handleTrangThaiChange(suCo.idSuCo, "DangXuLy")
                        }
                      >
                        Tiếp nhận
                      </Button>
                    )}
                    {suCo.trangThai === "DangXuLy" && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() =>
                          handleTrangThaiChange(suCo.idSuCo, "DaXuLy")
                        }
                      >
                        Hoàn thành
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SuCoManager;
