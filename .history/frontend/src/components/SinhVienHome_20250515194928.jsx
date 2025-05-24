import React, { useState, useEffect } from 'react';
import { Container, Nav, Tab, Badge } from 'react-bootstrap';
import UserService from '../services/user.service';

const SinhVienHome = () => {
  const [activeTab, setActiveTab] = useState('thongtin');
  const [pendingAssignments, setPendingAssignments] = useState(0);

  useEffect(() => {
    // Kiểm tra số lượng phân công chưa xử lý
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
    <Container fluid>
      <Nav variant="tabs" className="nav-tabs">
        <Nav.Item>
          <Nav.Link 
            className={activeTab === 'thongtin' ? 'active' : ''} 
            onClick={() => setActiveTab('thongtin')}
          >
            Thông tin cá nhân
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            className={activeTab === 'thongbao' ? 'active' : ''} 
            onClick={() => setActiveTab('thongbao')}
          >
            Thông báo
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            className={activeTab === 'lichhoc' ? 'active' : ''} 
            onClick={() => setActiveTab('lichhoc')}
          >
            Lịch học
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            className={activeTab === 'muonphong' ? 'active' : ''} 
            onClick={() => setActiveTab('muonphong')}
          >
            Mượn phòng
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            className={activeTab === 'phancong' ? 'active' : ''} 
            onClick={() => setActiveTab('phancong')}
          >
            Phân công mượn phòng
            {pendingAssignments > 0 && (
              <Badge 
                bg="danger" 
                pill
                className="ms-2"
              >
                {pendingAssignments}
              </Badge>
            )}
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Tab.Content>
        {/* Nội dung các tab */}
      </Tab.Content>
    </Container>
  );
};

export default SinhVienHome; 