import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaGraduationCap, FaUser, FaLock, FaFacebookF, FaTwitter, FaInstagram, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import AuthService from '../services/auth.service';
import { toast } from "react-toastify";

// Định nghĩa CSS inline để tránh CSS khác ghi đè
const styles = {
  loginPage: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    position: 'relative',
    zIndex: 1,
    overflow: 'auto'
  },
  backgroundContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url('/backgroundlogin.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    zIndex: -1
  },
  container: {
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '0',
    position: 'relative',
    zIndex: 2
  },
  formContainer: {
    width: '100%',
    maxWidth: '700px',
    margin: '0 auto',
    padding: '0 0 40px 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  card: {
    borderRadius: '15px',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.2)',
    border: 'none',
    overflow: 'hidden',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.5)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.5)'
  },
  cardBody: {
    padding: '50px'
  },
  logo: {
    color: '#ffffff',
    marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
    filter: 'drop-shadow(0 0 10px rgba(0, 110, 255, 0.5))'
  },
  heading: {
    fontSize: 'calc(2rem + 1vw)',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '1.5rem',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 80, 255, 0.4)'
  },
  subheading: {
    fontSize: 'calc(1rem + 0.5vw)',
    color: '#ffffff',
    marginBottom: '2rem',
    fontWeight: '500',
    textShadow: '0 2px 6px rgba(0, 0, 0, 0.5)'
  },
  formControl: {
    padding: '15px 20px',
    fontSize: '1.3rem',
    borderRadius: '10px',
    height: 'auto',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
  },
  label: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#212529'
  },
  button: {
    padding: '18px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    borderRadius: '10px',
    width: '100%',
    boxShadow: '0 4px 15px rgba(13, 110, 253, 0.3)',
    border: 'none'
  },
  footer: {
    fontSize: 'clamp(0.8rem, 1vw, 1rem)',
    color: '#e6e6e6',
    width: '100%',
    textAlign: 'center',
    marginTop: 'clamp(2rem, 5vw, 3rem)',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(10px)',
    padding: 'clamp(15px, 3vw, 25px) 15px',
    borderRadius: '15px',
    boxShadow: '0 -5px 25px rgba(0, 0, 0, 0.1)'
  },
  footerContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  footerText: {
    color: '#e6e6e6',
    margin: '10px 0',
    fontSize: '0.9rem'
  },
  footerIcons: {
    display: 'flex',
    gap: '15px',
    margin: '10px 0'
  },
  footerIcon: {
    color: '#ffffff',
    backgroundColor: 'rgba(13, 110, 253, 0.6)',
    borderRadius: '50%',
    padding: '8px',
    width: '35px',
    height: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  footerLinks: {
    display: 'flex',
    gap: '20px',
    margin: '15px 0',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  footerLink: {
    color: '#e6e6e6',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.3s ease',
    cursor: 'pointer'
  },
  footerDivider: {
    width: '60%',
    margin: '15px auto',
    height: '1px',
    background: 'rgba(255, 255, 255, 0.2)'
  },
  formGroup: {
    marginBottom: '30px'
  }
};

const Login = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const authService = new AuthService();

  // Show toast when message changes
  useEffect(() => {
    if (message) {
      toast.error(message);
    }
  }, [message]);

  // Thiết lập CSS cho body khi component mount
  useEffect(() => {
    // Lưu các style ban đầu để khôi phục khi unmount
    const originalBodyStyle = {
      backgroundColor: document.body.style.backgroundColor,
      overflow: document.body.style.overflow,
      margin: document.body.style.margin,
      padding: document.body.style.padding,
      height: document.body.style.height
    };
    
    const originalHtmlStyle = {
      height: document.documentElement.style.height
    };

    // Áp dụng style mới cho toàn màn hình
    document.body.style.backgroundColor = 'transparent';
    document.body.style.overflow = 'auto';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.height = '100%';
    document.documentElement.style.height = '100%';

    // Clean up function
    return () => {
      // Khôi phục style ban đầu khi component unmount
      document.body.style.backgroundColor = originalBodyStyle.backgroundColor;
      document.body.style.overflow = originalBodyStyle.overflow;
      document.body.style.margin = originalBodyStyle.margin;
      document.body.style.padding = originalBodyStyle.padding;
      document.body.style.height = originalBodyStyle.height;
      document.documentElement.style.height = originalHtmlStyle.height;
    };
  }, []);

  const initialValues = {
    userId: '',
    password: '',
  };

  const validationSchema = Yup.object().shape({
    userId: Yup.string().required('Vui lòng nhập tên đăng nhập!'),
    password: Yup.string().required('Vui lòng nhập mật khẩu!'),
  });

  const handleLogin = (formValue) => {
    const { userId, password } = formValue;
    setMessage('');
    setLoading(true);

    authService.login(userId, password)
      .then(
        (data) => {
          if (data && data.token) {
            // Đảm bảo cập nhật currentUser trước khi điều hướng
            setCurrentUser(data);
            
            // Thêm timeout ngắn để đảm bảo state được cập nhật trước khi điều hướng
            setTimeout(() => {
              // Kiểm tra role và chuyển hướng tương ứng
              const roles = data.roles || [];
              if (roles.includes('ROLE_SV')) {
                navigate('/sinhvien');
              } else if (roles.includes('ROLE_GV')) {
                navigate('/giangvien');
              } else if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_QL')) {
                navigate('/admin');
              } else {
                navigate('/profile');
              }
              
              setLoading(false);
            }, 100);
          } else {
            setMessage("Đăng nhập thành công nhưng không nhận được token");
            setLoading(false);
          }
        },
        (error) => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          setLoading(false);
          setMessage(resMessage);
        }
      );
  };

  return (
    <div style={styles.loginPage}>
      {/* Container nền toàn màn hình */}
      <div style={styles.backgroundContainer}></div>
      
      <div style={styles.container}>
        <div style={styles.formContainer}>
          <div className="text-center">
            <FaGraduationCap size={100} style={styles.logo} />
            <h1 style={styles.heading}>Đăng nhập Hệ thống</h1>
            <p style={styles.subheading}>Vui lòng đăng nhập để tiếp tục</p>
          </div>
          
          <Card style={styles.card}>
            <Card.Body style={styles.cardBody}>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleLogin}
              >
                {({ handleSubmit, handleChange, values, touched, errors }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group style={styles.formGroup} controlId="userId">
                      <Form.Label style={styles.label}>
                        <FaUser className="me-2" /> Tên đăng nhập
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="userId"
                        placeholder="Nhập tên đăng nhập"
                        value={values.userId}
                        onChange={handleChange}
                        isInvalid={touched.userId && !!errors.userId}
                        style={styles.formControl}
                        size="lg"
                      />
                      <Form.Control.Feedback type="invalid" style={{fontSize: '1.1rem'}}>
                        {errors.userId}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group style={styles.formGroup} controlId="password">
                      <Form.Label style={styles.label}>
                        <FaLock className="me-2" /> Mật khẩu
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Nhập mật khẩu"
                        value={values.password}
                        onChange={handleChange}
                        isInvalid={touched.password && !!errors.password}
                        style={styles.formControl}
                        size="lg"
                      />
                      <Form.Control.Feedback type="invalid" style={{fontSize: '1.1rem'}}>
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-grid gap-2 mt-5">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        size="lg"
                        disabled={loading}
                        style={styles.button}
                      >
                        {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
          
          <div style={styles.footer}>
            <div style={styles.footerContainer}>
              <div style={styles.footerIcons}>
                <a href="https://www.facebook.com/kimbang.nguyensy" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>
                  <div style={styles.footerIcon}><FaFacebookF /></div>
                </a>
                <div style={styles.footerIcon}><FaTwitter /></div>
                <div style={styles.footerIcon}><FaInstagram /></div>
              </div>
              
              <div style={styles.footerLinks}>
                <span style={styles.footerLink}>Giới thiệu</span>
                <span style={styles.footerLink}>Liên hệ</span>
                <span style={styles.footerLink}>Trợ giúp</span>
                <span style={styles.footerLink}>Điều khoản</span>
              </div>
              
              <div style={styles.footerDivider}></div>
              
              <div style={styles.footerText}>
                <FaPhoneAlt style={{marginRight: '8px'}} /> Hotline: 0867809347
              </div>
              <div style={styles.footerText}>
                <FaEnvelope style={{marginRight: '8px'}} /> Email: support@muonphong.edu.vn
              </div>
              <div style={styles.footerText}>
                <FaMapMarkerAlt style={{marginRight: '8px'}} /> Địa chỉ: 97 Man Thiện, Hiệp Phú, Thành Phố Thủ Đức
              </div>
              
              <div style={styles.footerDivider}></div>
              
              <p style={styles.footerText}>
                Hệ thống quản lý mượn phòng © {new Date().getFullYear()} - Bản Quyền Thuộc Về Nhóm 7 CNPM PTIT
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;