import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import UserService from '../services/user.service';
import { formatDateTime } from '../utils/formatUtils';

const YeuCauMuonPhongList = () => {
  const [yeuCauList, setYeuCauList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadYeuCauList();
  }, []);

  const loadYeuCauList = async () => {
    try {
      setLoading(true);
      const response = await UserService.getYeuCauMuonPhongList();
      setYeuCauList(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách yêu cầu:', error);
      setError('Không thể lấy danh sách yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getTrangThaiLabel = (trangThai) => {
    switch (trangThai) {
      case 'DADUYET':
        return <Badge bg="success">Đã duyệt</Badge>;
      case 'DANGXULY':
        return <Badge bg="warning">Đang xử lý</Badge>;
      case 'DATUCHOI':
        return <Badge bg="danger">Đã từ chối</Badge>;
      case 'DAHUY':
        return <Badge bg="secondary">Đã hủy</Badge>;
      default:
        return <Badge bg="info">{trangThai}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h3 className="mb-4">Danh sách yêu cầu mượn phòng</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Mã yêu cầu</th>
            <th>Phòng</th>
            <th>Thời gian mượn</th>
            <th>Thời gian trả</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {yeuCauList.map((yeuCau) => (
            <tr key={yeuCau.maYeuCau}>
              <td>{yeuCau.maYeuCau}</td>
              <td>{yeuCau.phong.maPhong}</td>
              <td>{formatDateTime(yeuCau.thoiGianMuon)}</td>
              <td>{formatDateTime(yeuCau.thoiGianTra)}</td>
              <td>{getTrangThaiLabel(yeuCau.trangThai)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default YeuCauMuonPhongList; 