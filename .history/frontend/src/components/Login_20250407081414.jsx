import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card, Container, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaGraduationCap, FaUser, FaLock } from 'react-icons/fa';
import AuthService from '../services/auth.service';

// Định nghĩa CSS inline để tránh CSS khác ghi đè
const styles = {
  loginPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    width: '100%',
    maxWidth: '100%',
    margin: '0',
    backgroundImage: `url('/backgroundlogin.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  container: {
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '0'
  },
  formContainer: {
    width: '100%',
    maxWidth: '700px',
    margin: '0 auto',
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
    color: '#0d6efd',
    marginBottom: '1.5rem',
    filter: 'drop-shadow(0 0 10px rgba(13, 110, 253, 0.3))'
  },
  heading: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#0d6efd',
    marginBottom: '1.5rem',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  subheading: {
    fontSize: '1.5rem',
    color: '#343a40',
    marginBottom: '2rem',
    fontWeight: '500'
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
    fontSize: '1.2rem',
    color: '#212529',
    marginTop: '2rem',
    textAlign: 'center',
    textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)'
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

                    {message && (
                      <Alert variant="danger" className="mt-4" style={{fontSize: '1.1rem', backgroundColor: 'rgba(220, 53, 69, 0.85)', backdropFilter: 'blur(5px)'}}>
                        {message}
                      </Alert>
                    )}
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
          
          <div className="text-center">
            <p style={styles.footer}>
              Hệ thống quản lý mượn phòng © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;