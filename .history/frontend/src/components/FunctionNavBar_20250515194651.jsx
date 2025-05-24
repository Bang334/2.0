import React, { useState, useEffect } from 'react';
import { Nav, Badge } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const FunctionNavBar = () => {
  const [pendingAssignments, setPendingAssignments] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Lắng nghe sự kiện cập nhật số lượng phân công chưa xử lý
    const handlePendingUpdate = (event) => {
      setPendingAssignments(event.detail);
    };

    window.addEventListener('pendingAssignmentsUpdated', handlePendingUpdate);

    return () => {
      window.removeEventListener('pendingAssignmentsUpdated', handlePendingUpdate);
    };
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Nav className="function-nav mb-4">
      <Nav.Link 
        as={Link} 
        to="/profile" 
        className={`function-nav-item ${isActive('/profile') ? 'active' : ''}`}
      >
        Thông tin cá nhân
      </Nav.Link>
      <Nav.Link 
        as={Link} 
        to="/thongbao" 
        className={`function-nav-item ${isActive('/thongbao') ? 'active' : ''}`}
      >
        Thông báo
      </Nav.Link>
      <Nav.Link 
        as={Link} 
        to="/lichhoc" 
        className={`function-nav-item ${isActive('/lichhoc') ? 'active' : ''}`}
      >
        Lịch học
      </Nav.Link>
      <Nav.Link 
        as={Link} 
        to="/muonphong" 
        className={`function-nav-item ${isActive('/muonphong') ? 'active' : ''}`}
      >
        Mượn phòng
      </Nav.Link>
      <Nav.Link 
        as={Link} 
        to="/phancong" 
        className={`function-nav-item ${isActive('/phancong') ? 'active' : ''} d-flex align-items-center`}
      >
        Phân công mượn phòng
        {pendingAssignments > 0 && (
          <Badge 
            bg="danger" 
            className="ms-2"
            style={{ 
              borderRadius: '50%',
              padding: '0.4em 0.6em'
            }}
          >
            {pendingAssignments}
          </Badge>
        )}
      </Nav.Link>
    </Nav>
  );
};

export default FunctionNavBar;

// Thêm CSS vào file styles của bạn
/*
.function-nav {
  background-color: #f8f9fa;
  padding: 0.5rem;
  border-radius: 0.25rem;
  display: flex;
  justify-content: space-between;
}

.function-nav-item {
  color: #495057;
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.function-nav-item:hover {
  background-color: #e9ecef;
  color: #212529;
}

.function-nav-item.active {
  background-color: #0d6efd;
  color: white;
}
*/ 