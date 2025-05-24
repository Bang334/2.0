import React from "react";
import "../css/UserInfo.css";

const UserInfoDisplay = ({ userInfo, userType }) => {
  const isSinhVien = userType === 'sinhvien';
  
  if (!userInfo) {
    return <div>Không có thông tin người dùng</div>;
  }

  // Xử lý trường hợp dữ liệu từ GiangVienController
  if (userInfo.maGV && !userInfo.nguoiDung) {
    // Định dạng dữ liệu từ GiangVienController/SinhVienController
    return (
      <div className="user-info">
        <div className="info-container">
          <h2 className="header-info-container">Thông tin chi tiết về chủ tài khoản:</h2>
          <div className="flex-info-container">
            <div style={{ width: '100%' }}>
              {isSinhVien ? (
                <p className="info-style">Mã sinh viên: <span className="spacing0">{userInfo.maSV || ''}</span></p>
              ) : (
                <p className="info-style">Mã giảng viên: <span className="spacing0">{userInfo.maGV || ''}</span></p>
              )}
              <p className="info-style">Tên: <span className="spacing1">{userInfo.hoTen || ''}</span></p>
              <p className="info-style">Email: <span className="spacing2">{userInfo.email || ''}</span></p>
              <p className="info-style">Liên hệ: <span className="spacing3">{userInfo.lienHe || ''}</span></p>
              <p className="info-style">Giới tính: <span className="spacing4">{userInfo.gioiTinh || 'Nữ'}</span></p>
              {isSinhVien ? (
                <p className="info-style">Mã lớp: <span className="spacing5">{userInfo.maLop || ''}</span></p>
              ) : (
                <p className="info-style">Khoa: <span className="spacing5">{userInfo.khoa || ''}</span></p>
              )}
            </div>
            <div>
              {userInfo.avatarURL && (
                <img src={`/${userInfo.avatarURL}`} alt="Avatar" className="user-avatar"/>
              )}
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', height: '100px' }}>
          <img 
            src="https://png.pngtree.com/png-clipart/20240115/original/pngtree-crystal-ball-highly-transparent-spherical-ai-element-three-dimensional-buckle-free-png-image_14115172.png" 
            className="bouncing-ball2 ball1" 
            alt="Bouncing Ball 1" 
          />
          <img 
            src="https://png.pngtree.com/png-clipart/20240610/original/pngtree-magic-sphere-beautiful-glitter-crystal-ball-fantasy-png-image_15298983.png" 
            className="bouncing-ball1 ball2" 
            alt="Bouncing Ball 2" 
          />
        </div>
      </div>
    );
  }
  
  // Xử lý dữ liệu đối tượng từ các API khác (có trường nguoiDung)
  return (
    <div className="user-info">
      <div className="info-container">
        <h2 className="header-info-container">Thông tin chi tiết về chủ tài khoản:</h2>
        <div className="flex-info-container">
          <div style={{ width: '100%' }}>
            {isSinhVien && userInfo.maSV && (
              <p className="info-style">Mã sinh viên: <span className="spacing0">{userInfo.maSV}</span></p>
            )}
            {!isSinhVien && userInfo.maGV && (
              <p className="info-style">Mã giảng viên: <span className="spacing0">{userInfo.maGV}</span></p>
            )}
            <p className="info-style">Tên: <span className="spacing1">{userInfo.nguoiDung?.hoTen || ''}</span></p>
            <p className="info-style">Email: <span className="spacing2">{userInfo.nguoiDung?.email || ''}</span></p>
            <p className="info-style">Liên hệ: <span className="spacing3">{userInfo.nguoiDung?.lienHe || ''}</span></p>
            <p className="info-style">Giới tính: <span className="spacing4">{userInfo.nguoiDung?.gioiTinh || 'Nữ'}</span></p>
            {isSinhVien && userInfo.lopHoc?.maLop && (
              <p className="info-style">Mã lớp: <span className="spacing5">{userInfo.lopHoc?.maLop || ''}</span></p>
            )}
            {!isSinhVien && (
              <p className="info-style">Bộ môn: <span className="spacing5">{userInfo.boMon || userInfo.khoa || ''}</span></p>
            )}
          </div>
          <div>
            {userInfo.nguoiDung?.avatarURL && (
              <img src={`/${userInfo.nguoiDung.avatarURL}`} alt="Avatar" className="user-avatar"/>
            )}
          </div>
        </div>
      </div>
      <div style={{ position: 'relative', height: '100px' }}>
        <img 
          src="https://png.pngtree.com/png-clipart/20240115/original/pngtree-crystal-ball-highly-transparent-spherical-ai-element-three-dimensional-buckle-free-png-image_14115172.png" 
          className="bouncing-ball2 ball1" 
          alt="Bouncing Ball 1" 
        />
        <img 
          src="https://png.pngtree.com/png-clipart/20240610/original/pngtree-magic-sphere-beautiful-glitter-crystal-ball-fantasy-png-image_15298983.png" 
          className="bouncing-ball1 ball2" 
          alt="Bouncing Ball 2" 
        />
      </div>
    </div>
  );
};

export default UserInfoDisplay; 