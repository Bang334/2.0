import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaGraduationCap, FaUserCircle, FaSignOutAlt, FaSignInAlt, FaHome, FaUserCog, FaChalkboardTeacher, FaUser } from 'react-icons/fa';

const NavBar = ({ currentUser, showAdminBoard, showEmployeeBoard, showSinhVienBoard, onLogout }) => {
  return (
    <Navbar expand="lg" className="navbar" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FaGraduationCap size={24} className="me-2" />
          Hệ thống Quản lý Đào tạo
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/home">
              <FaHome className="me-1" /> Trang chủ
            </Nav.Link>

            {showAdminBoard && (
              <Nav.Link as={Link} to="/admin">
                <FaUserCog className="me-1" /> Quản lý
              </Nav.Link>
            )}

            {showEmployeeBoard && (
              <Nav.Link as={Link} to="/giangvien">
                <FaChalkboardTeacher className="me-1" /> Giảng viên
              </Nav.Link>
            )}
            
            {showSinhVienBoard && (
              <Nav.Link as={Link} to="/sinhvien">
                <FaUser className="me-1" /> Sinh viên
              </Nav.Link>
            )}
          </Nav>

          {currentUser ? (
            <Nav>
              <Nav.Link as={Link} to="/profile">
                <FaUserCircle className="me-1" />
                {currentUser.hoTen || currentUser.userId}
              </Nav.Link>
              <Nav.Link onClick={onLogout}>
                <FaSignOutAlt className="me-1" /> Đăng xuất
              </Nav.Link>
            </Nav>
          ) : (
            <Nav>
              <Nav.Link as={Link} to="/login">
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