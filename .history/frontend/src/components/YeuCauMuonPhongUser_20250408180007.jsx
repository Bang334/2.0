import React, { useState, useEffect } from "react";
import { Container, Table, Button, Modal, Badge, Spinner } from "react-bootstrap";
import UserService from "../services/user.service";
import { toast } from "react-toastify";
import moment from "moment";
import 'moment/locale/vi';

function YeuCauMuonPhongUser() {
  const [yeuCauList, setYeuCauList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedYeuCau, setSelectedYeuCau] = useState(null);

  useEffect(() => {
    fetchYeuCauList();
  }, []);

  const fetchYeuCauList = async () => {
    try {
      setLoading(true);
      // Kiểm tra role của người dùng để gọi API phù hợp
      const user = JSON.parse(localStorage.getItem("user"));
      let response;
      if (user.roles.includes("ROLE_SV")) {
        response = await UserService.getYeuCauMuonPhong();
      } else if (user.roles.includes("ROLE_GV")) {
        response = await UserService.getYeuCauMuonPhongGV();
      }
      setYeuCauList(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleHuyYeuCau = async () => {
    try {
      await UserService.huyYeuCauMuonPhong(selectedYeuCau.maYeuCau);
      toast.success('Đã hủy yêu cầu mượn phòng thành công');
      setShowConfirmModal(false);
      fetchYeuCauList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi hủy yêu cầu');
    }
  };

  const getTrangThaiBadge = (trangThai) => {
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

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return moment(dateTime).format("DD/MM/YYYY HH:mm");
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải danh sách yêu cầu...</p>
      </div>
    );
  }

  return (
    <Container fluid>
      <h2 className="mb-4">Danh sách yêu cầu mượn phòng</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Mã yêu cầu</th>
            <th>Phòng</th>
            <th>Thời gian mượn</th>
            <th>Thời gian trả</th>
            <th>Mục đích</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {yeuCauList.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">Không có yêu cầu nào</td>
            </tr>
          ) : (
            yeuCauList.map((yeuCau) => (
              <tr key={yeuCau.maYeuCau}>
                <td>{yeuCau.maYeuCau}</td>
                <td>{yeuCau.phong}</td>
                <td>{formatDateTime(yeuCau.thoiGianMuon)}</td>
                <td>{formatDateTime(yeuCau.thoiGianTra)}</td>
                <td>{yeuCau.mucDich}</td>
                <td>{getTrangThaiBadge(yeuCau.trangThai)}</td>
                <td>
                  {yeuCau.trangThai === "DANGXULY" && new Date() < new Date(yeuCau.thoiGianMuon) && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setSelectedYeuCau(yeuCau);
                        setShowConfirmModal(true);
                      }}
                    >
                      Hủy yêu cầu
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận hủy yêu cầu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn hủy yêu cầu mượn phòng này không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleHuyYeuCau}>
            Xác nhận hủy
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default YeuCauMuonPhongUser; 