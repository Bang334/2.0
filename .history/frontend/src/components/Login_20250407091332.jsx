import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AuthService from '../services/auth.service';

// Định nghĩa CSS inline cho giao diện mới
const styles = {
  loginPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #3d5af1 0%, #1a2b6d 80%)',
    position: 'relative',
    overflow: 'hidden'
  },
  blueCircle: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3d5af1 0%, #1171d8 100%)',
    top: '50px',
    left: '50px',
    zIndex: 1
  },
  orangeCircle: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff9f43 0%, #ff5e62 100%)',
    bottom: '50px',
    right: '50px',
    zIndex: 1
  },
  formContainer: {
    backgroundColor: '#222',
    borderRadius: '15px',
    padding: '40px',
    width: '400px',
    maxWidth: '90%',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    zIndex: 2
  },
  formTitle: {
    color: 'white',
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '30px',
    textAlign: 'center'
  },
  formControl: {
    padding: '12px 15px',
    fontSize: '16px',
    backgroundColor: '#333',
    border: 'none',
    borderRadius: '5px',
    color: 'white',
    marginBottom: '20px'
  },
  formLabel: {
    color: '#ccc',
    fontSize: '14px',
    marginBottom: '8px'
  },
  loginButton: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '5px',
    background: 'linear-gradient(135deg, #3d5af1 0%, #1171d8 100%)',
    border: 'none',
    marginTop: '15px'
  },
  footer: {
    color: 'white',
    textAlign: 'center',
    marginTop: '30px',
    fontSize: '14px'
  },
  accountText: {
    color: 'white',
    textAlign: 'center',
    fontSize: '14px',
    marginTop: '20px'
  },
  loginLink: {
    color: '#3d5af1',
    fontWeight: '600',
    textDecoration: 'none',
    marginLeft: '5px'
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
      {/* Circle elements for design */}
      <div style={styles.blueCircle}></div>
      <div style={styles.orangeCircle}></div>
      
      <div style={styles.formContainer}>
        <h2 style={styles.formTitle}>Đăng Nhập</h2>
        
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ handleSubmit, handleChange, values, touched, errors }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group controlId="userId">
                <Form.Label style={styles.formLabel}>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="userId"
                  placeholder="Nhập tên đăng nhập"
                  value={values.userId}
                  onChange={handleChange}
                  isInvalid={touched.userId && !!errors.userId}
                  style={styles.formControl}
                />
                <Form.Control.Feedback type="invalid" style={{color: '#ff5e62'}}>
                  {errors.userId}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="password">
                <Form.Label style={styles.formLabel}>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={values.password}
                  onChange={handleChange}
                  isInvalid={touched.password && !!errors.password}
                  style={styles.formControl}
                />
                <Form.Control.Feedback type="invalid" style={{color: '#ff5e62'}}>
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <Button 
                type="submit" 
                style={styles.loginButton}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Sign Up'}
              </Button>

              {message && (
                <Alert variant="danger" className="mt-4" style={{backgroundColor: 'rgba(255, 94, 98, 0.15)', color: '#ff5e62', border: 'none'}}>
                  {message}
                </Alert>
              )}
            </Form>
          )}
        </Formik>
        
        {/* Text at the bottom */}
        <div style={styles.accountText}>
          Have an Account?<span style={styles.loginLink}>Login Here</span>
        </div>
        
        <div style={styles.footer}>
          Hệ thống quản lý mượn phòng © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default Login;