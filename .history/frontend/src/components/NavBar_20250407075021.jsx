import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { FaGraduationCap, FaUserCircle, FaSignOutAlt, FaSignInAlt, FaHome, FaUserCog, FaChalkboardTeacher, FaUser } from 'react-icons/fa';

const NavBar = ({ currentUser, showAdminBoard, showEmployeeBoard, showSinhVienBoard, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <Navbar 
      expand="lg" 
      className={`navbar shadow-sm fixed-top ${scrolled ? 'navbar-scrolled' : ''}`} 
      variant="dark"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <FaGraduationCap size={scrolled ? 24 : 28} className="me-2 brand-icon" />
          <span className="fw-bold brand-text">Hệ thống Quản lý Đào tạo</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/home" className="mx-1">
              <FaHome className="me-1" /> Trang chủ
            </Nav.Link>

            {showAdminBoard && (
              <Nav.Link as={Link} to="/admin" className="mx-1">
                <FaUserCog className="me-1" /> Quản lý
                <Badge bg="light" text="primary" pill className="ms-1">QL</Badge>
              </Nav.Link>
            )}

            {showEmployeeBoard && (
              <Nav.Link as={Link} to="/giangvien" className="mx-1">
                <FaChalkboardTeacher className="me-1" /> Giảng viên
                <Badge bg="light" text="primary" pill className="ms-1">GV</Badge>
              </Nav.Link>
            )}
            
            {showSinhVienBoard && (
              <Nav.Link as={Link} to="/sinhvien" className="mx-1">
                <FaUser className="me-1" /> Sinh viên
                <Badge bg="light" text="primary" pill className="ms-1">SV</Badge>
              </Nav.Link>
            )}
          </Nav>

          {currentUser ? (
            <Nav>
              <Nav.Link as={Link} to="/profile" className="d-flex align-items-center mx-1">
                <FaUserCircle size={18} className="me-1" />
                <span>{currentUser.hoTen || currentUser.userId}</span>
              </Nav.Link>
              <Nav.Link onClick={onLogout} className="mx-1 btn-logout">
                <FaSignOutAlt className="me-1" /> Đăng xuất
              </Nav.Link>
            </Nav>
          ) : (
            <Nav>
              <Nav.Link as={Link} to="/login" className="mx-1 btn-login">
                <FaSignInAlt className="me-1" /> Đăng nhập
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;