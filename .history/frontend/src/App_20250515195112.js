import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Nav, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import các components
import ThongTinCaNhan from './components/ThongTinCaNhan';
import ThongBao from './components/ThongBao';
import LichHoc from './components/LichHoc';
import MuonPhong from './components/MuonPhong';
import PhanCongMuonPhong from './components/PhanCongMuonPhongManager';
import UserService from './services/user.service';

function App() {
  const [pendingAssignments, setPendingAssignments] = useState(0);

  useEffect(() => {
    const checkPendingAssignments = async () => {
      try {
        const response = await UserService.layDanhSachPhanCongChoSinhVien();
        const pendingCount = response.data.filter(item => item.trangThai === "CHUAXULY").length;
        setPendingAssignments(pendingCount);
      } catch (error) {
        console.error("Error checking pending assignments:", error);
      }
    };

    checkPendingAssignments();
  }, []);

  return (
    <Router>
      <div>
        <Nav className="justify-content-center mb-4">
          <Nav.Item>
            <Nav.Link as={Link} to="/thongtin">Thông tin cá nhân</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to="/thongbao">Thông báo</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to="/lichhoc">Lịch học</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to="/muonphong">Mượn phòng</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to="/phancong" className="d-flex align-items-center">
              Phân công mượn phòng
              {pendingAssignments > 0 && (
                <Badge bg="danger" pill className="ms-2">
                  {pendingAssignments}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Routes>
          <Route path="/thongtin" element={<ThongTinCaNhan />} />
          <Route path="/thongbao" element={<ThongBao />} />
          <Route path="/lichhoc" element={<LichHoc />} />
          <Route path="/muonphong" element={<MuonPhong />} />
          <Route path="/phancong" element={<PhanCongMuonPhong />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 