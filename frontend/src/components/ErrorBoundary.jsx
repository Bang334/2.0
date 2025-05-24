import React, { Component } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import AuthService from '../services/auth.service';
import { toast } from 'react-toastify';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // If the error is related to JWT token, logout the user
    if (error.message && 
        (error.message.includes('token') || 
         error.message.includes('jwt') || 
         error.message.includes('unauthorized'))) {
      console.log("JWT related error detected, logging out");
      AuthService.logout();
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
  }

  handleReload = () => {
    window.location.reload();
  }

  handleRedirectHome = () => {
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Container className="mt-5">
          <Row>
            <Col md={8} className="mx-auto">
              <div className="p-4 bg-danger text-white rounded">
                <h4>Đã xảy ra lỗi!</h4>
                <p>
                  Chúng tôi xin lỗi - hệ thống đang gặp sự cố kỹ thuật.
                </p>
                <hr className="border-white" />
                <div className="d-flex justify-content-between">
                  <Button onClick={this.handleReload} variant="outline-light">
                    Thử lại
                  </Button>
                  <Button onClick={this.handleRedirectHome} variant="light">
                    Về trang chủ
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 