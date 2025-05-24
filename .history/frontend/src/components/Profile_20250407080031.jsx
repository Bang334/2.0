import React from 'react';
import { Container, Card, Row, Col, Image, Badge } from 'react-bootstrap';

const Profile = ({ currentUser }) => {
  // Hàm chuyển đổi vai trò từ mã sang tên đầy đủ
  const getRoleName = (role) => {
    switch(role) {
      case 'ROLE_GV': return 'Giảng Viên';
      case 'ROLE_SV': return 'Sinh Viên';
      case 'ROLE_QL': return 'Quản Lý';
      case 'ROLE_ADMIN': return 'Quản Trị Viên';
      default: return role.replace('ROLE_', '');
    }
  };

  const styles = {
    profileContainer: {
      marginTop: '20px',
      marginBottom: '40px'
    },
    header: {
      background: '#f8f9fa',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      borderLeft: '5px solid #0d6efd',
      fontFamily: 'Montserrat, sans-serif'
    },
    card: {
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      border: 'none'
    },
    infoRow: {
      padding: '8px 0',
      borderBottom: '1px solid #f0f0f0'
    },
    avatarContainer: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexDirection: 'column',
      paddingRight: '30px',
      paddingLeft: '20px'
    },
    avatarImage: {
      maxWidth: '220px',
      maxHeight: '220px',
      width: 'auto',
      height: 'auto',
      objectFit: 'contain',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      border: '3px solid #ffffff',
      borderRadius: '0%',
      backgroundColor: 'transparent'
    },
    avatarPlaceholder: {
      width: '180px',
      height: '180px',
      margin: '0 auto',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      borderRadius: '0%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0d6efd',
      color: 'white',
      fontFamily: 'Roboto, sans-serif'
    },
    label: {
      color: '#555',
      fontWeight: '600',
      fontFamily: 'Poppins, sans-serif'
    },
    value: {
      color: '#333',
      fontWeight: '400',
      fontFamily: 'Roboto, sans-serif'
    },
    role: {
      fontWeight: '600',
      fontSize: '0.9rem',
      padding: '5px 10px',
      fontFamily: 'Roboto, sans-serif'
    },
    sectionTitle: {
      fontFamily: 'Montserrat, sans-serif',
      fontSize: '1.4rem',
      fontWeight: '600'
    }
  };

  return (
    <Container style={styles.profileContainer}>
      <header style={styles.header}>
        <h3>
          <strong>{currentUser?.hoTen || 'User'}</strong> Profile
        </h3>
      </header>

      <Card style={styles.card} className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4} className="mb-3" style={styles.avatarContainer}>
              {currentUser?.avatarURL ? (
                <img 
                  src={currentUser.avatarURL} 
                  alt="User Avatar" 
                  style={styles.avatarImage}
                />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  <h1>{currentUser?.hoTen?.charAt(0) || 'U'}</h1>
                </div>
              )}
              <div className="mt-3 mb-2 text-center">
                {currentUser?.roles?.map((role, index) => (
                  <Badge 
                    key={index} 
                    bg="primary" 
                    className="me-1 mb-1"
                    style={styles.role}
                  >
                    {getRoleName(role)}
                  </Badge>
                ))}
              </div>
            </Col>
            <Col md={8}>
              <h4 className="mb-4 pb-2 border-bottom" style={styles.sectionTitle}>Thông tin người dùng</h4>
              
              <Row style={styles.infoRow} className="mb-2">
                <Col md={4} style={styles.label}>Họ và tên:</Col>
                <Col md={8} style={styles.value}>{currentUser?.hoTen || 'N/A'}</Col>
              </Row>
              
              <Row style={styles.infoRow} className="mb-2">
                <Col md={4} style={styles.label}>Email:</Col>
                <Col md={8} style={styles.value}>{currentUser?.email || 'N/A'}</Col>
              </Row>
              
              <Row style={styles.infoRow} className="mb-2">
                <Col md={4} style={styles.label}>ID tài khoản:</Col>
                <Col md={8} style={styles.value}>{currentUser?.id || 'N/A'}</Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;