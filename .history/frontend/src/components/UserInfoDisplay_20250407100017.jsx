import React from "react";
import "../css/UserInfo.css";
import { Card, Row, Col, Badge } from "react-bootstrap";
import { FaUser, FaEnvelope, FaPhone, FaVenusMars, FaGraduationCap, FaBuilding } from 'react-icons/fa';

const UserInfoDisplay = ({ userInfo, userType }) => {
  const isSinhVien = userType === 'sinhvien';
  
  if (!userInfo) {
    return <div>Không có thông tin người dùng</div>;
  }

  // Xử lý trường hợp dữ liệu từ GiangVienController
  if (userInfo.maGV && !userInfo.nguoiDung) {
    // Định dạng dữ liệu từ GiangVienController/SinhVienController
    return (
      <div className="user-info-container">
        <Card className="user-info-card">
          <Card.Header className="user-info-header">
            <h2>Thông tin chi tiết về chủ tài khoản</h2>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4} className="avatar-col">
                {userInfo.avatarURL ? (
                  <img src={`/${userInfo.avatarURL}`} alt="Avatar" className="user-avatar"/>
                ) : (
                  <div className="avatar-placeholder">
                    <span>{(userInfo.hoTen || "").charAt(0)}</span>
                  </div>
                )}
                <div className="user-type">
                  <Badge bg="primary" className="user-type-badge">
                    {isSinhVien ? "Sinh Viên" : "Giảng Viên"}
                  </Badge>
                </div>
              </Col>
              <Col md={8}>
                <div className="info-details">
                  <div className="info-section">
                    <h4 className="section-title">Thông tin cá nhân</h4>
                    <div className="info-item">
                      <div className="info-icon"><FaUser /></div>
                      <div className="info-label">{isSinhVien ? "Mã sinh viên:" : "Mã giảng viên:"}</div>
                      <div className="info-value">{isSinhVien ? userInfo.maSV : userInfo.maGV}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon"><FaUser /></div>
                      <div className="info-label">Họ và tên:</div>
                      <div className="info-value">{userInfo.hoTen || ""}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon"><FaEnvelope /></div>
                      <div className="info-label">Email:</div>
                      <div className="info-value">{userInfo.email || ""}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon"><FaPhone /></div>
                      <div className="info-label">Liên hệ:</div>
                      <div className="info-value">{userInfo.lienHe || ""}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon"><FaVenusMars /></div>
                      <div className="info-label">Giới tính:</div>
                      <div className="info-value">{userInfo.gioiTinh || "Nữ"}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon">{isSinhVien ? <FaGraduationCap /> : <FaBuilding />}</div>
                      <div className="info-label">{isSinhVien ? "Mã lớp:" : "Khoa:"}</div>
                      <div className="info-value">{isSinhVien ? userInfo.maLop : userInfo.khoa}</div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    );
  }
  
  // Xử lý dữ liệu đối tượng từ các API khác (có trường nguoiDung)
  return (
    <div className="user-info-container">
      <Card className="user-info-card">
        <Card.Header className="user-info-header">
          <h2>Thông tin chi tiết về chủ tài khoản</h2>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4} className="avatar-col">
              {userInfo.nguoiDung?.avatarURL ? (
                <img src={`/${userInfo.nguoiDung.avatarURL}`} alt="Avatar" className="user-avatar"/>
              ) : (
                <div className="avatar-placeholder">
                  <span>{(userInfo.nguoiDung?.hoTen || "").charAt(0)}</span>
                </div>
              )}
              <div className="user-type">
                <Badge bg="primary" className="user-type-badge">
                  {isSinhVien ? "Sinh Viên" : "Giảng Viên"}
                </Badge>
              </div>
            </Col>
            <Col md={8}>
              <div className="info-details">
                <div className="info-section">
                  <h4 className="section-title">Thông tin cá nhân</h4>
                  
                  {(isSinhVien && userInfo.maSV) && (
                    <div className="info-item">
                      <div className="info-icon"><FaUser /></div>
                      <div className="info-label">Mã sinh viên:</div>
                      <div className="info-value">{userInfo.maSV}</div>
                    </div>
                  )}
                  
                  {(!isSinhVien && userInfo.maGV) && (
                    <div className="info-item">
                      <div className="info-icon"><FaUser /></div>
                      <div className="info-label">Mã giảng viên:</div>
                      <div className="info-value">{userInfo.maGV}</div>
                    </div>
                  )}
                  
                  <div className="info-item">
                    <div className="info-icon"><FaUser /></div>
                    <div className="info-label">Họ và tên:</div>
                    <div className="info-value">{userInfo.nguoiDung?.hoTen || ""}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon"><FaEnvelope /></div>
                    <div className="info-label">Email:</div>
                    <div className="info-value">{userInfo.nguoiDung?.email || ""}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon"><FaPhone /></div>
                    <div className="info-label">Liên hệ:</div>
                    <div className="info-value">{userInfo.nguoiDung?.lienHe || ""}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon"><FaVenusMars /></div>
                    <div className="info-label">Giới tính:</div>
                    <div className="info-value">{userInfo.nguoiDung?.gioiTinh || "Nữ"}</div>
                  </div>
                  
                  {(isSinhVien && userInfo.lopHoc?.maLop) && (
                    <div className="info-item">
                      <div className="info-icon"><FaGraduationCap /></div>
                      <div className="info-label">Mã lớp:</div>
                      <div className="info-value">{userInfo.lopHoc?.maLop}</div>
                    </div>
                  )}
                  
                  {!isSinhVien && (
                    <div className="info-item">
                      <div className="info-icon"><FaBuilding /></div>
                      <div className="info-label">Bộ môn:</div>
                      <div className="info-value">{userInfo.boMon || userInfo.khoa || ""}</div>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserInfoDisplay; 