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
      background: 'linear-gradient(135deg, #3498db, #1a5fa2)',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px',
      color: 'white',
      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
      fontFamily: 'Montserrat, sans-serif'
    },
    headerTitle: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: '600',
      fontSize: '1.8rem',
      color: 'white',
      margin: 0
    },
    card: {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: 'none',
      borderRadius: '12px',
      overflow: 'hidden'
    },
    infoRow: {
      padding: '10px 0',
      margin: '0',
      transition: 'all 0.2s ease'
    },
    avatarContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      padding: '30px 20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px 0 0 12px'
    },
    avatarImage: {
      maxWidth: '180px',
      maxHeight: '180px',
      width: 'auto',
      height: 'auto',
      objectFit: 'contain',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      border: '4px solid #ffffff',
      borderRadius: '12px',
      backgroundColor: 'transparent'
    },
    avatarPlaceholder: {
      width: '160px',
      height: '160px',
      margin: '0 auto',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #3498db, #1a5fa2)',
      color: 'white',
      fontFamily: 'Montserrat, sans-serif'
    },
    label: {
      color: '#555',
      fontWeight: '600',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '0.95rem'
    },
    value: {
      color: '#333',
      fontWeight: '500',
      fontFamily: 'Roboto, sans-serif',
      fontSize: '1rem'
    },
    role: {
      fontWeight: '600',
      fontSize: '0.9rem',
      padding: '6px 12px',
      fontFamily: 'Roboto, sans-serif',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      margin: '0 5px 5px'
    },
    sectionTitle: {
      fontFamily: 'Montserrat, sans-serif',
      fontSize: '1.4rem',
      fontWeight: '600',
      color: '#1a5fa2',
      marginBottom: '20px',
      paddingBottom: '10px',
      borderBottom: '2px solid #3498db'
    },
    infoCard: {
      backgroundColor: '#fff',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '15px',
      transition: 'all 0.3s ease',
      border: '1px solid #eaeaea'
    },
    infoCardTitle: {
      color: '#1a5fa2',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '15px',
      paddingBottom: '8px',
      borderBottom: '1px solid #e0e0e0'
    }
  };

  return (
    <Container style={styles.profileContainer}>
      <header style={styles.header}>
        <h3 style={styles.headerTitle}>
          {currentUser?.hoTen || 'User'} <span style={{fontSize: '1rem', fontWeight: 'normal', opacity: '0.9'}}>Profile</span>
        </h3>
      </header>

      <Card style={styles.card} className="mb-4">
        <Card.Body className="p-0">
          <Row className="g-0">
            <Col md={4} className="mb-3 mb-md-0" style={styles.avatarContainer}>
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
              <div className="mt-4 mb-2 text-center">
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
            <Col md={8} className="p-4">
              <h4 style={styles.sectionTitle}>Thông tin người dùng</h4>
              
              <div style={styles.infoCard}>
                <h5 style={styles.infoCardTitle}>Thông tin cá nhân</h5>
                <Row style={styles.infoRow} className="mb-2">
                  <Col md={4} style={styles.label}>Họ và tên:</Col>
                  <Col md={8} style={styles.value}>{currentUser?.hoTen || 'N/A'}</Col>
                </Row>
                
                <Row style={styles.infoRow} className="mb-2">
                  <Col md={4} style={styles.label}>Email:</Col>
                  <Col md={8} style={styles.value}>{currentUser?.email || 'N/A'}</Col>
                </Row>
              </div>
              
              <div style={styles.infoCard}>
                <h5 style={styles.infoCardTitle}>Thông tin tài khoản</h5>
                <Row style={styles.infoRow}>
                  <Col md={4} style={styles.label}>ID tài khoản:</Col>
                  <Col md={8} style={styles.value}>{currentUser?.id || 'N/A'}</Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;