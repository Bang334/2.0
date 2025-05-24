# Hệ Thống Quản Lý Mượn Phòng Học

## Tổng Quan
Hệ thống quản lý mượn phòng học là một ứng dụng web cho phép sinh viên và giảng viên đăng ký mượn phòng học, quản lý việc sử dụng phòng và theo dõi lịch sử mượn phòng. Hệ thống được phát triển với mục đích tối ưu hóa việc quản lý và sử dụng phòng học trong trường đại học.

## Công Nghệ Sử Dụng
### Backend
- Java Spring Boot 3.x
- Spring Security với JWT (JSON Web Token)
- Spring Data JPA cho truy cập database
- MySQL Database 8.x
- Maven cho quản lý dependencies
- Lombok cho giảm boilerplate code
- ModelMapper cho mapping object

### Frontend
- React.js 18.x
- React Bootstrap 5.x cho UI components
- Axios cho HTTP requests
- React Router 6.x cho routing
- React Toastify cho thông báo
- Chart.js cho biểu đồ thống kê
- Moment.js cho xử lý datetime
- Font Awesome cho icons

## Chức Năng Chi Tiết

### 1. Quản Lý Tài Khoản
#### Đăng Ký và Đăng Nhập
- Đăng ký tài khoản với thông tin cơ bản (họ tên, email, mật khẩu)
- Đăng nhập bằng username và password
- Phân quyền người dùng:
  - ROLE_SV: Sinh viên
  - ROLE_GV: Giảng viên
  - ROLE_QL: Quản lý
- Tự động tạo mã người dùng theo định dạng:
  - SV001, SV002,... cho sinh viên
  - GV001, GV002,... cho giảng viên
  - QL001, QL002,... cho quản lý

#### Quản Lý Tài Khoản
- Kích hoạt/khóa tài khoản
- Cập nhật thông tin cá nhân
- Đổi mật khẩu
- Xem lịch sử đăng nhập

### 2. Quản Lý Phòng Học
#### Thông Tin Phòng
- Mã phòng (ví dụ: P001, P002)
- Tên phòng
- Sức chứa (số người tối đa)
- Mô tả (thiết bị, đặc điểm)
- Trạng thái:
  - TRONG: Phòng trống
  - DANGSUDUNG: Đang được sử dụng
  - BAOTRI: Đang bảo trì

#### Quản Lý Phòng
- Thêm phòng mới
- Cập nhật thông tin phòng
- Xóa phòng (chỉ khi không có lịch sử sử dụng)
- Tìm kiếm phòng theo:
  - Mã phòng
  - Tên phòng
  - Trạng thái
  - Sức chứa

### 3. Đăng Ký Mượn Phòng
#### Tạo Yêu Cầu
- Chọn phòng muốn mượn
- Chọn thời gian mượn:
  - Ngày mượn
  - Giờ bắt đầu
  - Giờ kết thúc
- Nhập mục đích sử dụng
- Kiểm tra xung đột lịch:
  - Phòng đã được đặt trong khoảng thời gian đó
  - Phòng đang bảo trì
  - Thời gian mượn không hợp lệ

#### Quản Lý Yêu Cầu
- Xem danh sách yêu cầu:
  - Đang xử lý
  - Đã duyệt
  - Bị từ chối
- Hủy yêu cầu:
  - Chỉ được hủy trước thời gian mượn
  - Tự động gửi thông báo cho quản lý

### 4. Quản Lý Yêu Cầu (Quản Lý)
#### Duyệt Yêu Cầu
- Xem chi tiết yêu cầu:
  - Thông tin người mượn
  - Thông tin phòng
  - Thời gian mượn
  - Mục đích sử dụng
- Duyệt yêu cầu:
  - Cập nhật trạng thái phòng
  - Gửi thông báo cho người mượn
- Từ chối yêu cầu:
  - Nhập lý do từ chối
  - Gửi thông báo cho người mượn

### 5. Thông Báo
#### Gửi Thông Báo
- Thông báo tự động:
  - Khi yêu cầu được duyệt/từ chối
  - Khi phòng bị hủy
  - Khi phòng bảo trì
- Thông báo thủ công:
  - Gửi cho cá nhân
  - Gửi cho nhóm người dùng
  - Gửi cho tất cả

#### Quản Lý Thông Báo
- Đánh dấu đã đọc
- Xem lịch sử thông báo

### 6. Phản Hồi và Sự Cố
#### Phản Hồi
- Gửi phản hồi về phòng:
  - Đánh giá chất lượng
  - Báo cáo vấn đề
  - Đề xuất cải thiện
- Xem phản hồi:
  - Theo phòng
  - Theo thời gian
  - Theo trạng thái

#### Sự Cố
- Báo cáo sự cố:
  - Mô tả sự cố
  - Mức độ nghiêm trọng
- Xử lý sự cố:
  - Cập nhật trạng thái
  - Ghi chú xử lý

### 7. Thống Kê và Báo Cáo
#### Thống Kê Phòng
- Tần suất sử dụng:
- Tỷ lệ sử dụng:
  - Phòng được sử dụng nhiều nhất
  - Phòng ít được sử dụng

#### Thống Kê Yêu Cầu
- Số lượng yêu cầu:
  - Đã duyệt
  - Bị từ chối
  - Đang xử lý
- Tỷ lệ duyệt/từ chối

#### Báo Cáo
- Xuất báo cáo:
  - Theo thời gian
  - Theo phòng
  - Theo người dùng

## Lưu Ý Quan Trọng

### Bảo Mật
#### Xác Thực và Phân Quyền
- JWT token có thời hạn 3 phút
- Refresh token để gia hạn
- Kiểm tra quyền cho từng API endpoint
- Mã hóa mật khẩu bằng BCrypt

#### Bảo Vệ Dữ Liệu
- Validate input data
- XSS protection
- CSRF protection
- SQL injection prevention

### Xử Lý Lỗi
#### Kiểm Tra Đầu Vào
- Validate thời gian mượn:
  - Không trùng với thời gian khác
  - Không trong thời gian bảo trì
- Kiểm tra trạng thái phòng
- Kiểm tra quyền người dùng

#### Xử Lý Ngoại Lệ
- Custom exception handling
- Log lỗi chi tiết
- Thông báo lỗi thân thiện
- Rollback transaction khi cần

### Giao Diện Người Dùng
#### Responsive Design
- Bootstrap grid system
- Media queries
- Flexible layouts

#### UX/UI
- Toast notifications
- Loading indicators
- Error messages
- Success confirmations

## Cài Đặt và Chạy

### Backend
1. Cài đặt Java 17
2. Cài đặt MySQL 8.x
3. Tạo database:
   ```sql
   CREATE DATABASE qlmuonphong;
   ```
4. Cập nhật `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/qlmuonphong
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```
5. Chạy lệnh:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

### Frontend
1. Cài đặt Node.js 18.x
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Cấu hình API URL trong `.env`:
   ```
   VITE_API_URL=http://localhost:8080/api
   ```
4. Chạy development server:
   ```bash
   npm run dev
   ```

## Cấu Trúc Thư Mục

### Backend
```
src/
├── main/
│   ├── java/
│   │   └── com/example/backend/
│   │       ├── config/         # Spring configuration
│   │       │   ├── SecurityConfig.java
│   │       │   ├── WebConfig.java
│   │       │   └── CorsConfig.java
│   │       ├── controllers/    # API endpoints
│   │       │   ├── AuthController.java
│   │       │   ├── PhongController.java
│   │       │   └── YeuCauMuonPhongController.java
│   │       ├── model/         # Entity classes
│   │       │   ├── Phong.java
│   │       │   ├── YeuCauMuonPhong.java
│   │       │   └── User.java
│   │       ├── repository/    # JPA repositories
│   │       │   ├── PhongRepository.java
│   │       │   └── YeuCauMuonPhongRepository.java
│   │       ├── security/      # Security
│   │       │   ├── JwtUtils.java
│   │       │   └── UserDetailsImpl.java
│   │       └── service/       # Business logic
│   │           ├── PhongService.java
│   │           └── YeuCauMuonPhongService.java
│   └── resources/
│       └── application.properties
```

### Frontend
```
src/
├── components/     # React components
│   ├── auth/      # Authentication components
│   ├── phong/     # Room management components
│   └── yeucau/    # Request management components
├── services/      # API services
│   ├── auth.service.js
│   └── user.service.js
├── utils/         # Utility functions
│   ├── auth-header.js
│   └── date-utils.js
└── App.jsx        # Main application
```

## API Endpoints

### Authentication
- POST /api/auth/signin
  - Request: {username, password}
  - Response: {token, type, id, username, roles}
- POST /api/auth/signup
  - Request: {username, email, password, roles}
  - Response: {message}

### Phòng Học
- GET /api/phong
  - Response: List<Phong>
- GET /api/phong/{maPhong}
  - Response: Phong
- POST /api/phong
  - Request: {maPhong, tenPhong, sucChua, moTa}
  - Response: Phong
- PUT /api/phong/{maPhong}
  - Request: {tenPhong, sucChua, moTa, trangThai}
  - Response: Phong
- DELETE /api/phong/{maPhong}
  - Response: {message}

### Yêu Cầu Mượn Phòng
- POST /api/yeucaumuon/gui
  - Request: {maPhong, thoiGianMuon, thoiGianTra, mucDich}
  - Response: YeuCauMuonPhong
- GET /api/yeucaumuon
  - Response: List<YeuCauMuonPhong>
- PUT /api/yeucaumuon/duyet/{maYeuCau}
  - Response: {message}
- PUT /api/yeucaumuon/tuchoi/{maYeuCau}
  - Request: {lyDo}
  - Response: {message}
- DELETE /api/yeucaumuon/huy/{maYeuCau}
  - Response: {message}

### Thông Báo
- GET /api/thongbao/nhan
  - Response: List<ThongBao>
- GET /api/thongbao/gui
  - Response: List<ThongBao>
- POST /api/thongbao/gui
  - Request: {tieuDe, noiDung, nguoiNhan}
  - Response: ThongBao
- PUT /api/thongbao/{id}/daDoc
  - Response: {message}

## Tương Lai
### Kế Hoạch Phát Triển
1. Đặt phòng tự động:
   - Tích hợp với lịch học
   - Tự động đề xuất phòng trống
   - Đặt lịch định kỳ

2. Tích hợp điểm danh:
   - QR code check-in
   - Face recognition
   - Thống kê điểm danh

3. Đánh giá phòng học:
   - Rating system
   - Feedback form
   - Quality metrics

4. Tối ưu hóa:
   - Performance monitoring
   - Error tracking
   - User analytics
   - A/B testing

### Cải Tiến
1. Mobile app
2. Real-time notifications
3. AI-powered room suggestions
4. Advanced analytics dashboard 

# Stored Procedures và Triggers cho Hệ Thống Quản Lý Mượn Phòng

## 1. Stored Procedures cho Sinh Viên

### 1.1. Đăng nhập và xác thực
```sql
DELIMITER //

CREATE PROCEDURE sp_SinhVien_DangNhap(
    IN p_userId VARCHAR(50),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_idNguoiDung VARCHAR(36);
    DECLARE v_matKhauHash VARCHAR(255);
    DECLARE v_trangThai VARCHAR(20);
    
    -- Lấy thông tin đăng nhập
    SELECT 
        u.MatKhau, 
        u.TrangThai, 
        nd.IDNguoiDung 
    INTO 
        v_matKhauHash, 
        v_trangThai, 
        v_idNguoiDung
    FROM 
        TaiKhoan u
    JOIN 
        NguoiDung nd ON u.ID = nd.IDTaiKhoan
    JOIN 
        VaiTro vt ON nd.IDVaiTro = vt.IDVaiTro
    WHERE 
        u.ID = p_userId
        AND vt.TenVaiTro = 'SV';
        
    -- Kiểm tra tài khoản tồn tại
    IF v_matKhauHash IS NULL THEN
        SELECT 'Tài khoản không tồn tại' AS Message, FALSE AS Success;
    -- Kiểm tra trạng thái
    ELSEIF v_trangThai = 'Khoa' THEN
        SELECT 'Tài khoản đã bị khóa' AS Message, FALSE AS Success;
    -- Kiểm tra mật khẩu
    ELSEIF v_matKhauHash = p_password THEN
        -- Cập nhật thời gian đăng nhập
        UPDATE TaiKhoan 
        SET ThoiGianDangNhapCuoi = NOW() 
        WHERE ID = p_userId;
        
        -- Trả về thông tin người dùng
        SELECT 
            nd.IDNguoiDung,
            nd.HoTen,
            nd.Email,
            nd.LienHe,
            nd.GioiTinh,
            vt.TenVaiTro AS VaiTro,
            TRUE AS Success
        FROM 
            NguoiDung nd
        JOIN 
            VaiTro vt ON nd.IDVaiTro = vt.IDVaiTro
        WHERE 
            nd.IDNguoiDung = v_idNguoiDung;
    ELSE
        SELECT 'Mật khẩu không chính xác' AS Message, FALSE AS Success;
    END IF;
END //

DELIMITER ;
```

### 1.2. Lấy danh sách phòng trống
```sql
DELIMITER //

CREATE PROCEDURE sp_SinhVien_GetDanhSachPhong()
BEGIN
    SELECT 
        p.MaPhong,
        p.TenPhong,
        p.SucChua,
        p.MoTa,
        p.TrangThai
    FROM 
        Phong p
    WHERE 
        p.TrangThai IN ('TRONG', 'DANGSUDUNG')
    ORDER BY 
        p.MaPhong;
END //

DELIMITER ;
```

### 1.3. Gửi yêu cầu mượn phòng
```sql
DELIMITER //

CREATE PROCEDURE sp_SinhVien_GuiYeuCauMuonPhong(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maPhong VARCHAR(10),
    IN p_thoiGianMuon DATETIME,
    IN p_thoiGianTra DATETIME,
    IN p_mucDich VARCHAR(255)
)
BEGIN
    DECLARE v_countConflict INT;
    DECLARE v_trangThaiPhong VARCHAR(20);
    DECLARE v_maSV VARCHAR(10);
    
    -- Lấy mã sinh viên từ IDNguoiDung
    SELECT MaSV INTO v_maSV FROM SinhVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Kiểm tra phòng tồn tại và trạng thái
    SELECT TrangThai INTO v_trangThaiPhong FROM Phong WHERE MaPhong = p_maPhong;
    
    IF v_trangThaiPhong IS NULL THEN
        SELECT 'Phòng không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_trangThaiPhong = 'BAOTRI' THEN
        SELECT 'Phòng đang bảo trì, không thể mượn' AS Message, FALSE AS Success;
    ELSE
        -- Kiểm tra xung đột lịch
        SELECT COUNT(*) INTO v_countConflict
        FROM YeuCauMuonPhong ycmp
        WHERE ycmp.MaPhong = p_maPhong
          AND ycmp.TrangThai = 'DADUYET'
          AND (
              (p_thoiGianMuon BETWEEN ycmp.ThoiGianMuon AND ycmp.ThoiGianTra)
              OR (p_thoiGianTra BETWEEN ycmp.ThoiGianMuon AND ycmp.ThoiGianTra)
              OR (p_thoiGianMuon <= ycmp.ThoiGianMuon AND p_thoiGianTra >= ycmp.ThoiGianTra)
          );
          
        IF v_countConflict > 0 THEN
            SELECT 'Phòng đã được đặt trong khoảng thời gian này' AS Message, FALSE AS Success;
        ELSE
            -- Thêm yêu cầu mượn phòng
            INSERT INTO YeuCauMuonPhong (
                MaSV, 
                MaPhong, 
                ThoiGianMuon, 
                ThoiGianTra, 
                MucDich, 
                ThoiGianYeuCau, 
                TrangThai
            )
            VALUES (
                v_maSV,
                p_maPhong,
                p_thoiGianMuon,
                p_thoiGianTra,
                p_mucDich,
                NOW(),
                'DANGXULY'
            );
            
            SELECT 'Gửi yêu cầu mượn phòng thành công' AS Message, 
                   TRUE AS Success, 
                   LAST_INSERT_ID() AS MaYeuCau;
        END IF;
    END IF;
END //

DELIMITER ;
```

### 1.4. Lấy danh sách yêu cầu mượn phòng
```sql
DELIMITER //

CREATE PROCEDURE sp_SinhVien_GetDanhSachYeuCauMuon(
    IN p_idNguoiDung VARCHAR(36)
)
BEGIN
    DECLARE v_maSV VARCHAR(10);
    
    -- Lấy mã sinh viên từ IDNguoiDung
    SELECT MaSV INTO v_maSV FROM SinhVien WHERE IDNguoiDung = p_idNguoiDung;
    
    SELECT 
        ycmp.MaYeuCau,
        ycmp.ThoiGianYeuCau,
        ycmp.ThoiGianMuon,
        ycmp.ThoiGianTra,
        ycmp.MucDich,
        ycmp.TrangThai,
        ycmp.LyDoTuChoi,
        p.MaPhong,
        p.TenPhong,
        p.SucChua,
        p.TrangThai AS TrangThaiPhong
    FROM 
        YeuCauMuonPhong ycmp
    JOIN 
        Phong p ON ycmp.MaPhong = p.MaPhong
    WHERE 
        ycmp.MaSV = v_maSV
    ORDER BY 
        ycmp.ThoiGianYeuCau DESC;
END //

DELIMITER ;
```

### 1.5. Hủy yêu cầu mượn phòng
```sql
DELIMITER //

CREATE PROCEDURE sp_SinhVien_HuyYeuCauMuonPhong(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maYeuCau INT
)
BEGIN
    DECLARE v_maSV VARCHAR(10);
    DECLARE v_trangThaiYeuCau VARCHAR(20);
    DECLARE v_maSVYeuCau VARCHAR(10);
    DECLARE v_thoiGianMuon DATETIME;
    
    -- Lấy mã sinh viên từ IDNguoiDung
    SELECT MaSV INTO v_maSV FROM SinhVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Lấy thông tin yêu cầu
    SELECT 
        MaSV, 
        TrangThai, 
        ThoiGianMuon 
    INTO 
        v_maSVYeuCau, 
        v_trangThaiYeuCau, 
        v_thoiGianMuon
    FROM 
        YeuCauMuonPhong
    WHERE 
        MaYeuCau = p_maYeuCau;
    
    -- Kiểm tra yêu cầu tồn tại
    IF v_maSVYeuCau IS NULL THEN
        SELECT 'Không tìm thấy yêu cầu mượn phòng' AS Message, FALSE AS Success;
    -- Kiểm tra quyền hủy yêu cầu
    ELSEIF v_maSVYeuCau != v_maSV THEN
        SELECT 'Bạn không có quyền hủy yêu cầu này' AS Message, FALSE AS Success;
    -- Kiểm tra trạng thái
    ELSEIF v_trangThaiYeuCau != 'DANGXULY' THEN
        SELECT 'Chỉ có thể hủy yêu cầu đang xử lý' AS Message, FALSE AS Success;
    -- Kiểm tra thời gian
    ELSEIF NOW() >= v_thoiGianMuon THEN
        SELECT 'Không thể hủy yêu cầu đã quá thời gian mượn' AS Message, FALSE AS Success;
    ELSE
        -- Xóa yêu cầu
        DELETE FROM YeuCauMuonPhong WHERE MaYeuCau = p_maYeuCau;
        
        SELECT 'Đã hủy yêu cầu mượn phòng thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 1.6. Lấy danh sách thông báo
```sql
DELIMITER //

CREATE PROCEDURE sp_SinhVien_GetThongBao(
    IN p_idNguoiDung VARCHAR(36)
)
BEGIN
    SELECT 
        tbn.ID AS IDThongBaoNhan,
        tbg.IDTB AS IDThongBao,
        tbg.TieuDe,
        tbg.NoiDung,
        tbg.ThoiGianGui,
        tbn.TrangThai,
        nd.HoTen AS NguoiGui
    FROM 
        ThongBaoNhan tbn
    JOIN 
        ThongBaoGui tbg ON tbn.IDTB = tbg.IDTB
    JOIN 
        NguoiDung nd ON tbg.IDNguoiGui = nd.IDNguoiDung
    WHERE 
        tbn.IDNguoiNhan = p_idNguoiDung
    ORDER BY 
        tbg.ThoiGianGui DESC;
END //

DELIMITER ;
```

### 1.7. Đánh dấu thông báo đã đọc
```sql
DELIMITER //

CREATE PROCEDURE sp_SinhVien_DanhDauThongBaoDaDoc(
    IN p_idNguoiDung VARCHAR(36),
    IN p_idThongBao INT
)
BEGIN
    DECLARE v_idThongBaoNhan INT;
    
    -- Lấy ID thông báo nhận
    SELECT ID INTO v_idThongBaoNhan
    FROM ThongBaoNhan
    WHERE IDTB = p_idThongBao
      AND IDNguoiNhan = p_idNguoiDung;
      
    IF v_idThongBaoNhan IS NULL THEN
        SELECT 'Không tìm thấy thông báo' AS Message, FALSE AS Success;
    ELSE
        -- Cập nhật trạng thái thông báo
        UPDATE ThongBaoNhan
        SET TrangThai = 'DADOC'
        WHERE ID = v_idThongBaoNhan;
        
        SELECT 'Đã đánh dấu thông báo là đã đọc' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 1.8. Gửi phản hồi về phòng học
```sql
DELIMITER //

CREATE PROCEDURE sp_SinhVien_GuiPhanHoi(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maPhong VARCHAR(10),
    IN p_noiDung TEXT,
    IN p_danhGia INT
)
BEGIN
    DECLARE v_maSV VARCHAR(10);
    DECLARE v_phongExists INT;
    
    -- Lấy mã sinh viên từ IDNguoiDung
    SELECT MaSV INTO v_maSV FROM SinhVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Kiểm tra phòng tồn tại
    SELECT COUNT(*) INTO v_phongExists FROM Phong WHERE MaPhong = p_maPhong;
    
    IF v_phongExists = 0 THEN
        SELECT 'Phòng không tồn tại' AS Message, FALSE AS Success;
    ELSE
        -- Thêm phản hồi
        INSERT INTO PhanHoi (
            MaSV, 
            MaPhong, 
            NoiDung, 
            DanhGia, 
            ThoiGianPhanHoi, 
            DaXem
        )
        VALUES (
            v_maSV,
            p_maPhong,
            p_noiDung,
            p_danhGia,
            NOW(),
            FALSE
        );
        
        SELECT 'Gửi phản hồi thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 1.9. Báo cáo sự cố
```sql
DELIMITER //

CREATE PROCEDURE sp_SinhVien_BaoCaoSuCo(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maPhong VARCHAR(10),
    IN p_tieuDe VARCHAR(255),
    IN p_moTa TEXT,
    IN p_mucDo VARCHAR(20)
)
BEGIN
    DECLARE v_maSV VARCHAR(10);
    DECLARE v_phongExists INT;
    
    -- Lấy mã sinh viên từ IDNguoiDung
    SELECT MaSV INTO v_maSV FROM SinhVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Kiểm tra phòng tồn tại
    SELECT COUNT(*) INTO v_phongExists FROM Phong WHERE MaPhong = p_maPhong;
    
    IF v_phongExists = 0 THEN
        SELECT 'Phòng không tồn tại' AS Message, FALSE AS Success;
    ELSE
        -- Thêm sự cố
        INSERT INTO SuCo (
            MaSV, 
            MaPhong, 
            TieuDe, 
            MoTa, 
            ThoiGianBao, 
            MucDo, 
            TrangThai
        )
        VALUES (
            v_maSV,
            p_maPhong,
            p_tieuDe,
            p_moTa,
            NOW(),
            p_mucDo,
            'DABAOCAO'
        );
        
        SELECT 'Báo cáo sự cố thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 1.10 Xem thông tin cá nhân
```sql
DELIMITER //
CREATE PROCEDURE sp_SinhVien_XemThongTinCaNhan(
    IN p_maSV VARCHAR(10)
)
BEGIN
    -- Lấy thông tin sinh viên
    SELECT 
        sv.MaSV,
        nd.IDNguoiDung,
        nd.HoTen,
        nd.Email,
        nd.LienHe,
        nd.GioiTinh,
        nd.AvatarURL,
        lh.MaLop,
        lh.TenLop,
        lh.SiSo
    FROM 
        SinhVien sv
    JOIN 
        NguoiDung nd ON sv.IDNguoiDung = nd.IDNguoiDung
    LEFT JOIN 
        LopHoc lh ON sv.MaLop = lh.MaLop
    WHERE 
        sv.MaSV = p_maSV;
END //
DELIMITER ;
```

### 1.11 Xem lịch học của lớp
```sql
DELIMITER //
CREATE PROCEDURE sp_SinhVien_XemLichHocLop(
    IN p_maSV VARCHAR(10)
)
BEGIN
    DECLARE v_maLop VARCHAR(20);
    
    -- Lấy mã lớp của sinh viên
    SELECT MaLop INTO v_maLop
    FROM SinhVien
    WHERE MaSV = p_maSV;
    
    -- Lấy thông tin lịch học của lớp
    SELECT 
        tkb.MaTKB,
        tkb.NgayHoc,
        tkb.ThuTrongTuan,
        tkb.TietBatDau,
        tkb.TietKetThuc,
        p.MaPhong,
        p.TenPhong,
        p.ViTri,
        mh.MaMon,
        mh.TenMon,
        gv.MaGV,
        nd.HoTen AS TenGiangVien
    FROM 
        ThoiKhoaBieu tkb
    JOIN 
        Phong p ON tkb.MaPhong = p.MaPhong
    JOIN 
        MonHoc mh ON tkb.MaMon = mh.MaMon
    JOIN 
        GiangVien gv ON tkb.MaGV = gv.MaGV
    JOIN 
        NguoiDung nd ON gv.IDNguoiDung = nd.IDNguoiDung
    WHERE 
        tkb.MaLop = v_maLop
    ORDER BY 
        tkb.NgayHoc, tkb.TietBatDau;
END //
DELIMITER ;
```
## 2. Triggers

### 2.1. Tự động tạo thông báo khi yêu cầu được phê duyệt
```sql
DELIMITER //

CREATE TRIGGER trg_YeuCauMuonPhong_AfterUpdate
AFTER UPDATE ON YeuCauMuonPhong
FOR EACH ROW
BEGIN
    DECLARE v_idNguoiDung VARCHAR(36);
    DECLARE v_idQuanLy VARCHAR(36);
    DECLARE v_tenPhong VARCHAR(255);
    
    -- Lấy thông tin sinh viên
    SELECT IDNguoiDung INTO v_idNguoiDung
    FROM SinhVien
    WHERE MaSV = NEW.MaSV;
    
    -- Lấy thông tin phòng
    SELECT TenPhong INTO v_tenPhong
    FROM Phong
    WHERE MaPhong = NEW.MaPhong;
    
    -- Lấy thông tin quản lý
    IF NEW.MaQL IS NOT NULL THEN
        SELECT IDNguoiDung INTO v_idQuanLy
        FROM QuanLy
        WHERE MaQL = NEW.MaQL;
    END IF;
    
    -- Nếu trạng thái chuyển từ đang xử lý sang đã duyệt
    IF OLD.TrangThai = 'DANGXULY' AND NEW.TrangThai = 'DADUYET' THEN
        -- Tạo thông báo
        INSERT INTO ThongBaoGui (
            IDNguoiGui,
            TieuDe,
            NoiDung,
            ThoiGianGui
        )
        VALUES (
            v_idQuanLy,
            CONCAT('Yêu cầu mượn phòng đã được duyệt - ', v_tenPhong),
            CONCAT('Yêu cầu mượn phòng ', v_tenPhong, ' từ ', DATE_FORMAT(NEW.ThoiGianMuon, '%d/%m/%Y %H:%i'), 
                   ' đến ', DATE_FORMAT(NEW.ThoiGianTra, '%d/%m/%Y %H:%i'), ' đã được duyệt.'),
            NOW()
        );
        
        -- Thêm vào bảng thông báo nhận
        INSERT INTO ThongBaoNhan (
            IDTB,
            IDNguoiNhan,
            TrangThai
        )
        VALUES (
            LAST_INSERT_ID(),
            v_idNguoiDung,
            'CHUADOC'
        );
    
    -- Nếu trạng thái chuyển từ đang xử lý sang từ chối
    ELSEIF OLD.TrangThai = 'DANGXULY' AND NEW.TrangThai = 'BITUCHOI' THEN
        -- Tạo thông báo
        INSERT INTO ThongBaoGui (
            IDNguoiGui,
            TieuDe,
            NoiDung,
            ThoiGianGui
        )
        VALUES (
            v_idQuanLy,
            CONCAT('Yêu cầu mượn phòng bị từ chối - ', v_tenPhong),
            CONCAT('Yêu cầu mượn phòng ', v_tenPhong, ' từ ', DATE_FORMAT(NEW.ThoiGianMuon, '%d/%m/%Y %H:%i'), 
                   ' đến ', DATE_FORMAT(NEW.ThoiGianTra, '%d/%m/%Y %H:%i'), 
                   ' đã bị từ chối. Lý do: ', 
                   IFNULL(NEW.LyDoTuChoi, 'Không có')),
            NOW()
        );
        
        -- Thêm vào bảng thông báo nhận
        INSERT INTO ThongBaoNhan (
            IDTB,
            IDNguoiNhan,
            TrangThai
        )
        VALUES (
            LAST_INSERT_ID(),
            v_idNguoiDung,
            'CHUADOC'
        );
    END IF;
END //

DELIMITER ;
```

### 2.2. Cập nhật trạng thái phòng khi yêu cầu được phê duyệt
```sql
DELIMITER //

CREATE TRIGGER trg_YeuCauMuonPhong_PhongStatus_AfterUpdate
AFTER UPDATE ON YeuCauMuonPhong
FOR EACH ROW
BEGIN
    -- Nếu trạng thái chuyển từ đang xử lý sang đã duyệt
    IF OLD.TrangThai = 'DANGXULY' AND NEW.TrangThai = 'DADUYET' THEN
        -- Cập nhật trạng thái phòng
        UPDATE Phong
        SET TrangThai = 'DANGSUDUNG'
        WHERE MaPhong = NEW.MaPhong;
    END IF;
END //

DELIMITER ;
```

### 2.3. Tự động tạo lịch sử mượn phòng khi yêu cầu được phê duyệt
```sql
DELIMITER //

CREATE TRIGGER trg_YeuCauMuonPhong_LichSu_AfterUpdate
AFTER UPDATE ON YeuCauMuonPhong
FOR EACH ROW
BEGIN
    -- Nếu trạng thái chuyển từ đang xử lý sang đã duyệt
    IF OLD.TrangThai = 'DANGXULY' AND NEW.TrangThai = 'DADUYET' THEN
        -- Tạo lịch sử mượn phòng
        INSERT INTO LichSuMuonPhong (
            MaYeuCau,
            ThoiGianNhan,
            MaSV,
            MaPhong,
            ThoiGianMuon,
            ThoiGianTraDuKien
        )
        VALUES (
            NEW.MaYeuCau,
            NOW(),
            NEW.MaSV,
            NEW.MaPhong,
            NEW.ThoiGianMuon,
            NEW.ThoiGianTra
        );
    END IF;
END //

DELIMITER ;
```

### 2.4. Tự động cập nhật trạng thái phòng khi trả phòng
```sql
DELIMITER //

CREATE TRIGGER trg_LichSuMuonPhong_AfterUpdate
AFTER UPDATE ON LichSuMuonPhong
FOR EACH ROW
BEGIN
    -- Nếu thời gian trả thực tế được cập nhật
    IF OLD.ThoiGianTraThucTe IS NULL AND NEW.ThoiGianTraThucTe IS NOT NULL THEN
        -- Kiểm tra các yêu cầu phòng đang sử dụng
        IF NOT EXISTS (
            SELECT 1 
            FROM LichSuMuonPhong 
            WHERE MaPhong = NEW.MaPhong 
              AND MaLichSu != NEW.MaLichSu
              AND ThoiGianTraThucTe IS NULL
        ) THEN
            -- Cập nhật trạng thái phòng về trống
            UPDATE Phong
            SET TrangThai = 'TRONG'
            WHERE MaPhong = NEW.MaPhong;
        END IF;
    END IF;
END //

DELIMITER ;
```

## 3. Stored Procedures cho Giảng Viên

### 3.1. Đăng nhập và xác thực giảng viên
```sql
DELIMITER //

CREATE PROCEDURE sp_GiangVien_DangNhap(
    IN p_userId VARCHAR(50),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_idNguoiDung VARCHAR(36);
    DECLARE v_matKhauHash VARCHAR(255);
    DECLARE v_trangThai VARCHAR(20);
    
    -- Lấy thông tin đăng nhập
    SELECT 
        u.MatKhau, 
        u.TrangThai, 
        nd.IDNguoiDung 
    INTO 
        v_matKhauHash, 
        v_trangThai, 
        v_idNguoiDung
    FROM 
        TaiKhoan u
    JOIN 
        NguoiDung nd ON u.ID = nd.IDTaiKhoan
    JOIN 
        VaiTro vt ON nd.IDVaiTro = vt.IDVaiTro
    WHERE 
        u.ID = p_userId
        AND vt.TenVaiTro = 'GV';
        
    -- Kiểm tra tài khoản tồn tại
    IF v_matKhauHash IS NULL THEN
        SELECT 'Tài khoản không tồn tại' AS Message, FALSE AS Success;
    -- Kiểm tra trạng thái
    ELSEIF v_trangThai = 'Khoa' THEN
        SELECT 'Tài khoản đã bị khóa' AS Message, FALSE AS Success;
    -- Kiểm tra mật khẩu
    ELSEIF v_matKhauHash = p_password THEN
        -- Cập nhật thời gian đăng nhập
        UPDATE TaiKhoan 
        SET ThoiGianDangNhapCuoi = NOW() 
        WHERE ID = p_userId;
        
        -- Trả về thông tin người dùng
        SELECT 
            nd.IDNguoiDung,
            nd.HoTen,
            nd.Email,
            nd.LienHe,
            nd.GioiTinh,
            vt.TenVaiTro AS VaiTro,
            gv.MaGV,
            gv.Khoa,
            TRUE AS Success
        FROM 
            NguoiDung nd
        JOIN 
            VaiTro vt ON nd.IDVaiTro = vt.IDVaiTro
        JOIN
            GiangVien gv ON nd.IDNguoiDung = gv.IDNguoiDung
        WHERE 
            nd.IDNguoiDung = v_idNguoiDung;
    ELSE
        SELECT 'Mật khẩu không chính xác' AS Message, FALSE AS Success;
    END IF;
END //

DELIMITER ;
```

### 3.2. Lấy danh sách phòng trống 
```sql
DELIMITER //

CREATE PROCEDURE sp_GiangVien_GetDanhSachPhong()
BEGIN
    SELECT 
        p.MaPhong,
        p.TenPhong,
        p.SucChua,
        p.MoTa,
        p.TrangThai
    FROM 
        Phong p
    WHERE 
        p.TrangThai IN ('TRONG', 'DANGSUDUNG')
    ORDER BY 
        p.MaPhong;
END //

DELIMITER ;
```

### 3.3. Gửi yêu cầu mượn phòng của giảng viên
```sql
DELIMITER //

CREATE PROCEDURE sp_GiangVien_GuiYeuCauMuonPhong(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maPhong VARCHAR(10),
    IN p_thoiGianMuon DATETIME,
    IN p_thoiGianTra DATETIME,
    IN p_mucDich VARCHAR(255),
    IN p_maLopHoc VARCHAR(10) -- Thêm mã lớp học cho giảng viên
)
BEGIN
    DECLARE v_countConflict INT;
    DECLARE v_trangThaiPhong VARCHAR(20);
    DECLARE v_maGV VARCHAR(10);
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Kiểm tra phòng tồn tại và trạng thái
    SELECT TrangThai INTO v_trangThaiPhong FROM Phong WHERE MaPhong = p_maPhong;
    
    IF v_trangThaiPhong IS NULL THEN
        SELECT 'Phòng không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_trangThaiPhong = 'BAOTRI' THEN
        SELECT 'Phòng đang bảo trì, không thể mượn' AS Message, FALSE AS Success;
    ELSE
        -- Kiểm tra xung đột lịch
        SELECT COUNT(*) INTO v_countConflict
        FROM YeuCauMuonPhong ycmp
        WHERE ycmp.MaPhong = p_maPhong
          AND ycmp.TrangThai = 'DADUYET'
          AND (
              (p_thoiGianMuon BETWEEN ycmp.ThoiGianMuon AND ycmp.ThoiGianTra)
              OR (p_thoiGianTra BETWEEN ycmp.ThoiGianMuon AND ycmp.ThoiGianTra)
              OR (p_thoiGianMuon <= ycmp.ThoiGianMuon AND p_thoiGianTra >= ycmp.ThoiGianTra)
          );
          
        IF v_countConflict > 0 THEN
            SELECT 'Phòng đã được đặt trong khoảng thời gian này' AS Message, FALSE AS Success;
        ELSE
            -- Thêm yêu cầu mượn phòng
            INSERT INTO YeuCauMuonPhong (
                MaGV, -- Sử dụng MaGV thay vì MaSV
                MaPhong, 
                ThoiGianMuon, 
                ThoiGianTra, 
                MucDich, 
                ThoiGianYeuCau, 
                TrangThai,
                MaLopHoc -- Thêm MaLopHoc
            )
            VALUES (
                v_maGV,
                p_maPhong,
                p_thoiGianMuon,
                p_thoiGianTra,
                p_mucDich,
                NOW(),
                'DANGXULY',
                p_maLopHoc
            );
            
            SELECT 'Gửi yêu cầu mượn phòng thành công' AS Message, 
                   TRUE AS Success, 
                   LAST_INSERT_ID() AS MaYeuCau;
        END IF;
    END IF;
END //

DELIMITER ;
```

### 3.4. Lấy danh sách yêu cầu mượn phòng của giảng viên
```sql
DELIMITER //

CREATE PROCEDURE sp_GiangVien_GetDanhSachYeuCauMuon(
    IN p_idNguoiDung VARCHAR(36)
)
BEGIN
    DECLARE v_maGV VARCHAR(10);
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    SELECT 
        ycmp.MaYeuCau,
        ycmp.ThoiGianYeuCau,
        ycmp.ThoiGianMuon,
        ycmp.ThoiGianTra,
        ycmp.MucDich,
        ycmp.TrangThai,
        ycmp.LyDoTuChoi,
        ycmp.MaLopHoc,
        p.MaPhong,
        p.TenPhong,
        p.SucChua,
        p.TrangThai AS TrangThaiPhong,
        lh.TenLop
    FROM 
        YeuCauMuonPhong ycmp
    JOIN 
        Phong p ON ycmp.MaPhong = p.MaPhong
    LEFT JOIN
        LopHoc lh ON ycmp.MaLopHoc = lh.MaLop
    WHERE 
        ycmp.MaGV = v_maGV
    ORDER BY 
        ycmp.ThoiGianYeuCau DESC;
END //

DELIMITER ;
```

### 3.5. Hủy yêu cầu mượn phòng của giảng viên
```sql
DELIMITER //

CREATE PROCEDURE sp_GiangVien_HuyYeuCauMuonPhong(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maYeuCau INT
)
BEGIN
    DECLARE v_maGV VARCHAR(10);
    DECLARE v_trangThaiYeuCau VARCHAR(20);
    DECLARE v_maGVYeuCau VARCHAR(10);
    DECLARE v_thoiGianMuon DATETIME;
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Lấy thông tin yêu cầu
    SELECT 
        MaGV, 
        TrangThai, 
        ThoiGianMuon 
    INTO 
        v_maGVYeuCau, 
        v_trangThaiYeuCau, 
        v_thoiGianMuon
    FROM 
        YeuCauMuonPhong
    WHERE 
        MaYeuCau = p_maYeuCau;
    
    -- Kiểm tra yêu cầu tồn tại
    IF v_maGVYeuCau IS NULL THEN
        SELECT 'Không tìm thấy yêu cầu mượn phòng' AS Message, FALSE AS Success;
    -- Kiểm tra quyền hủy yêu cầu
    ELSEIF v_maGVYeuCau != v_maGV THEN
        SELECT 'Bạn không có quyền hủy yêu cầu này' AS Message, FALSE AS Success;
    -- Kiểm tra trạng thái
    ELSEIF v_trangThaiYeuCau != 'DANGXULY' THEN
        SELECT 'Chỉ có thể hủy yêu cầu đang xử lý' AS Message, FALSE AS Success;
    -- Kiểm tra thời gian
    ELSEIF NOW() >= v_thoiGianMuon THEN
        SELECT 'Không thể hủy yêu cầu đã quá thời gian mượn' AS Message, FALSE AS Success;
    ELSE
        -- Xóa yêu cầu
        DELETE FROM YeuCauMuonPhong WHERE MaYeuCau = p_maYeuCau;
        
        SELECT 'Đã hủy yêu cầu mượn phòng thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 3.6. Lấy danh sách lớp học do giảng viên dạy
```sql
DELIMITER //

CREATE PROCEDURE sp_GiangVien_GetDanhSachLopHoc(
    IN p_idNguoiDung VARCHAR(36)
)
BEGIN
    DECLARE v_maGV VARCHAR(10);
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    SELECT 
        lh.MaLop,
        lh.TenLop,
        lh.SiSo,
        lh.KhoaHoc,
        lh.NamHoc
    FROM 
        LopHoc lh
    JOIN 
        GiangVien_LopHoc gvlh ON lh.MaLop = gvlh.MaLop
    WHERE 
        gvlh.MaGV = v_maGV
    ORDER BY 
        lh.TenLop;
END //

DELIMITER ;
```

### 3.7. Lấy danh sách sinh viên trong lớp học
```sql
DELIMITER //

CREATE PROCEDURE sp_GiangVien_GetDanhSachSinhVienTrongLop(
    IN p_maLop VARCHAR(10)
)
BEGIN
    SELECT 
        sv.MaSV,
        nd.HoTen,
        nd.Email,
        nd.LienHe,
        nd.GioiTinh
    FROM 
        SinhVien sv
    JOIN 
        NguoiDung nd ON sv.IDNguoiDung = nd.IDNguoiDung
    WHERE 
        sv.MaLop = p_maLop
    ORDER BY 
        nd.HoTen;
END //

DELIMITER ;
```

### 3.8. Lấy thời khóa biểu giảng viên
```sql
DELIMITER //

CREATE PROCEDURE sp_GiangVien_GetThoiKhoaBieu(
    IN p_idNguoiDung VARCHAR(36),
    IN p_tuNgay DATE,
    IN p_denNgay DATE
)
BEGIN
    DECLARE v_maGV VARCHAR(10);
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    SELECT 
        tkb.MaTKB,
        tkb.MaLopHoc,
        lh.TenLop,
        p.MaPhong,
        p.TenPhong,
        tkb.NgayHoc,
        tkb.GioBatDau,
        tkb.GioKetThuc,
        tkb.NoiDung
    FROM 
        ThoiKhoaBieu tkb
    JOIN 
        LopHoc lh ON tkb.MaLopHoc = lh.MaLop
    JOIN 
        Phong p ON tkb.MaPhong = p.MaPhong
    JOIN 
        GiangVien_LopHoc gvlh ON lh.MaLop = gvlh.MaLop
    WHERE 
        gvlh.MaGV = v_maGV
        AND tkb.NgayHoc BETWEEN p_tuNgay AND p_denNgay
    ORDER BY 
        tkb.NgayHoc, tkb.GioBatDau;
END //

DELIMITER ;
```

### 3.9. Điểm danh sinh viên
```sql
DELIMITER //

CREATE PROCEDURE sp_GiangVien_DiemDanhSinhVien(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maTKB INT,
    IN p_maSV VARCHAR(10),
    IN p_trangThai VARCHAR(20)
)
BEGIN
    DECLARE v_maGV VARCHAR(10);
    DECLARE v_maLopHoc VARCHAR(10);
    DECLARE v_isTeaching BOOLEAN;
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Lấy mã lớp học từ TKB
    SELECT MaLopHoc INTO v_maLopHoc FROM ThoiKhoaBieu WHERE MaTKB = p_maTKB;
    
    -- Kiểm tra xem giảng viên có dạy lớp này không
    SELECT COUNT(*) > 0 INTO v_isTeaching
    FROM GiangVien_LopHoc
    WHERE MaGV = v_maGV AND MaLop = v_maLopHoc;
    
    IF v_maLopHoc IS NULL THEN
        SELECT 'Không tìm thấy thời khóa biểu' AS Message, FALSE AS Success;
    ELSEIF NOT v_isTeaching THEN
        SELECT 'Bạn không có quyền điểm danh lớp này' AS Message, FALSE AS Success;
    ELSE
        -- Kiểm tra xem đã có điểm danh chưa
        IF EXISTS (SELECT 1 FROM DiemDanh WHERE MaTKB = p_maTKB AND MaSV = p_maSV) THEN
            -- Cập nhật điểm danh
            UPDATE DiemDanh
            SET TrangThai = p_trangThai
            WHERE MaTKB = p_maTKB AND MaSV = p_maSV;
        ELSE
            -- Thêm mới điểm danh
            INSERT INTO DiemDanh (
                MaTKB,
                MaSV,
                TrangThai,
                ThoiGianDiemDanh
            )
            VALUES (
                p_maTKB,
                p_maSV,
                p_trangThai,
                NOW()
            );
        END IF;
        
        SELECT 'Điểm danh thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 3.10. Gửi thông báo cho lớp học
```sql
DELIMITER //

CREATE PROCEDURE sp_GiangVien_GuiThongBaoLopHoc(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maLop VARCHAR(10),
    IN p_tieuDe VARCHAR(255),
    IN p_noiDung TEXT
)
BEGIN
    DECLARE v_maGV VARCHAR(10);
    DECLARE v_isTeaching BOOLEAN;
    DECLARE v_idThongBaoGui INT;
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Kiểm tra xem giảng viên có dạy lớp này không
    SELECT COUNT(*) > 0 INTO v_isTeaching
    FROM GiangVien_LopHoc
    WHERE MaGV = v_maGV AND MaLop = p_maLop;
    
    IF NOT v_isTeaching THEN
        SELECT 'Bạn không có quyền gửi thông báo cho lớp này' AS Message, FALSE AS Success;
    ELSE
        -- Tạo thông báo gửi
        INSERT INTO ThongBaoGui (
            IDNguoiGui,
            TieuDe,
            NoiDung,
            ThoiGianGui
        )
        VALUES (
            p_idNguoiDung,
            p_tieuDe,
            p_noiDung,
            NOW()
        );
        
        -- Lấy ID thông báo vừa tạo
        SET v_idThongBaoGui = LAST_INSERT_ID();
        
        -- Gửi thông báo cho tất cả sinh viên trong lớp
        INSERT INTO ThongBaoNhan (
            IDTB,
            IDNguoiNhan,
            TrangThai
        )
        SELECT 
            v_idThongBaoGui,
            sv.IDNguoiDung,
            'CHUADOC'
        FROM 
            SinhVien sv
        WHERE 
            sv.MaLop = p_maLop;
        
        SELECT 'Gửi thông báo thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

## 4. Triggers cho Giảng Viên

### 4.1. Tự động tạo thông báo khi yêu cầu của giảng viên được phê duyệt
```sql
DELIMITER //

CREATE TRIGGER trg_YeuCauMuonPhong_GV_AfterUpdate
AFTER UPDATE ON YeuCauMuonPhong
FOR EACH ROW
BEGIN
    DECLARE v_idNguoiDung VARCHAR(36);
    DECLARE v_idQuanLy VARCHAR(36);
    DECLARE v_tenPhong VARCHAR(255);
    DECLARE v_tenLop VARCHAR(255);
    
    -- Chỉ xử lý với yêu cầu của giảng viên (có MaGV, không có MaSV)
    IF NEW.MaGV IS NOT NULL AND NEW.MaSV IS NULL THEN
        -- Lấy thông tin giảng viên
        SELECT IDNguoiDung INTO v_idNguoiDung
        FROM GiangVien
        WHERE MaGV = NEW.MaGV;
        
        -- Lấy thông tin phòng
        SELECT TenPhong INTO v_tenPhong
        FROM Phong
        WHERE MaPhong = NEW.MaPhong;
        
        -- Lấy thông tin lớp học nếu có
        IF NEW.MaLopHoc IS NOT NULL THEN
            SELECT TenLop INTO v_tenLop
            FROM LopHoc
            WHERE MaLop = NEW.MaLopHoc;
        END IF;
        
        -- Lấy thông tin quản lý
        IF NEW.MaQL IS NOT NULL THEN
            SELECT IDNguoiDung INTO v_idQuanLy
            FROM QuanLy
            WHERE MaQL = NEW.MaQL;
        END IF;
        
        -- Nếu trạng thái chuyển từ đang xử lý sang đã duyệt
        IF OLD.TrangThai = 'DANGXULY' AND NEW.TrangThai = 'DADUYET' THEN
            -- Tạo thông báo
            INSERT INTO ThongBaoGui (
                IDNguoiGui,
                TieuDe,
                NoiDung,
                ThoiGianGui
            )
            VALUES (
                v_idQuanLy,
                CONCAT('Yêu cầu mượn phòng đã được duyệt - ', v_tenPhong),
                CONCAT('Yêu cầu mượn phòng ', v_tenPhong, 
                       IF(v_tenLop IS NOT NULL, CONCAT(' cho lớp ', v_tenLop), ''),
                       ' từ ', DATE_FORMAT(NEW.ThoiGianMuon, '%d/%m/%Y %H:%i'), 
                       ' đến ', DATE_FORMAT(NEW.ThoiGianTra, '%d/%m/%Y %H:%i'), 
                       ' đã được duyệt.'),
                NOW()
            );
            
            -- Thêm vào bảng thông báo nhận
            INSERT INTO ThongBaoNhan (
                IDTB,
                IDNguoiNhan,
                TrangThai
            )
            VALUES (
                LAST_INSERT_ID(),
                v_idNguoiDung,
                'CHUADOC'
            );
        
        -- Nếu trạng thái chuyển từ đang xử lý sang từ chối
        ELSEIF OLD.TrangThai = 'DANGXULY' AND NEW.TrangThai = 'BITUCHOI' THEN
            -- Tạo thông báo
            INSERT INTO ThongBaoGui (
                IDNguoiGui,
                TieuDe,
                NoiDung,
                ThoiGianGui
            )
            VALUES (
                v_idQuanLy,
                CONCAT('Yêu cầu mượn phòng bị từ chối - ', v_tenPhong),
                CONCAT('Yêu cầu mượn phòng ', v_tenPhong, 
                       IF(v_tenLop IS NOT NULL, CONCAT(' cho lớp ', v_tenLop), ''),
                       ' từ ', DATE_FORMAT(NEW.ThoiGianMuon, '%d/%m/%Y %H:%i'), 
                       ' đến ', DATE_FORMAT(NEW.ThoiGianTra, '%d/%m/%Y %H:%i'), 
                       ' đã bị từ chối. Lý do: ', 
                       IFNULL(NEW.LyDoTuChoi, 'Không có')),
                NOW()
            );
            
            -- Thêm vào bảng thông báo nhận
            INSERT INTO ThongBaoNhan (
                IDTB,
                IDNguoiNhan,
                TrangThai
            )
            VALUES (
                LAST_INSERT_ID(),
                v_idNguoiDung,
                'CHUADOC'
            );
        END IF;
    END IF;
END //

DELIMITER ;
```

### 4.2. Tự động tạo lịch sử mượn phòng khi yêu cầu của giảng viên được phê duyệt
```sql
DELIMITER //

CREATE TRIGGER trg_YeuCauMuonPhong_GV_LichSu_AfterUpdate
AFTER UPDATE ON YeuCauMuonPhong
FOR EACH ROW
BEGIN
    -- Chỉ xử lý với yêu cầu của giảng viên (có MaGV, không có MaSV)
    IF NEW.MaGV IS NOT NULL AND NEW.MaSV IS NULL THEN
        -- Nếu trạng thái chuyển từ đang xử lý sang đã duyệt
        IF OLD.TrangThai = 'DANGXULY' AND NEW.TrangThai = 'DADUYET' THEN
            -- Tạo lịch sử mượn phòng
            INSERT INTO LichSuMuonPhong (
                MaYeuCau,
                ThoiGianNhan,
                MaGV,           -- Sử dụng MaGV thay vì MaSV
                MaPhong,
                ThoiGianMuon,
                ThoiGianTraDuKien,
                MaLopHoc        -- Thêm MaLopHoc nếu có
            )
            VALUES (
                NEW.MaYeuCau,
                NOW(),
                NEW.MaGV,
                NEW.MaPhong,
                NEW.ThoiGianMuon,
                NEW.ThoiGianTra,
                NEW.MaLopHoc
            );
        END IF;
    END IF;
END //

DELIMITER ;
```

## 5. Lưu ý khi chuyển từ JPA sang Store Procedures

1. **Xử lý phân biệt yêu cầu giảng viên và sinh viên**: 
   - Trong JPA, việc này có thể được xử lý bằng cách sử dụng các quan hệ và phương thức truy vấn.
   - Trong stored procedures, cần kiểm tra `MaGV` hoặc `MaSV` để xác định loại yêu cầu.

2. **Xử lý thông báo cho nhiều sinh viên**:
   - JPA có thể sử dụng batch processing.
   - Stored procedures cần sử dụng cursor hoặc truy vấn INSERT với multiple rows.

3. **Quản lý điểm danh**: 
   - Trong JPA, có thể sử dụng các entity phức tạp với quan hệ nhiều-nhiều.
   - Trong stored procedures, cần thiết kế các bảng phụ trợ và quản lý quan hệ thủ công.

4. **Quản lý thời khóa biểu**:
   - JPA có thể sử dụng các mapping phức tạp để quản lý.
   - Stored procedures cần các truy vấn phức tạp để lấy và cập nhật dữ liệu thời khóa biểu.

## 6. Cài Đặt

Để sử dụng các stored procedures và triggers, thực hiện các bước sau:

1. Tạo schema cơ sở dữ liệu với các bảng phù hợp cho cả sinh viên và giảng viên
2. Thêm các bảng bổ sung cho giảng viên như GiangVien_LopHoc, ThoiKhoaBieu, DiemDanh
3. Thực thi các stored procedures và triggers
4. Thay đổi mã nguồn Java để sử dụng JdbcTemplate gọi stored procedures thay vì JPA 

## 7. Stored Procedures cho Quản Lý

### 7.1. Quản lý tài khoản người dùng
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_ThemTaiKhoan(
    IN p_userId VARCHAR(50),
    IN p_password VARCHAR(255),
    IN p_hoTen VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_lienHe VARCHAR(20),
    IN p_gioiTinh VARCHAR(20),
    IN p_vaiTro VARCHAR(10),
    IN p_maLop VARCHAR(10),
    IN p_khoa VARCHAR(50)
)
BEGIN
    DECLARE v_idTaiKhoan VARCHAR(36);
    DECLARE v_idVaiTro INT;
    DECLARE v_idNguoiDung VARCHAR(36);
    DECLARE v_maxMaSV VARCHAR(10);
    DECLARE v_maxMaGV VARCHAR(10);
    DECLARE v_newMa VARCHAR(10);
    DECLARE v_exists INT;
    
    -- Kiểm tra tài khoản đã tồn tại chưa
    SELECT COUNT(*) INTO v_exists FROM TaiKhoan WHERE ID = p_userId;
    IF v_exists > 0 THEN
        SELECT 'Tài khoản đã tồn tại' AS Message, FALSE AS Success;
        LEAVE sp_QuanLy_ThemTaiKhoan;
    END IF;
    
    -- Kiểm tra email đã tồn tại chưa
    SELECT COUNT(*) INTO v_exists FROM NguoiDung WHERE Email = p_email;
    IF v_exists > 0 THEN
        SELECT 'Email đã tồn tại' AS Message, FALSE AS Success;
        LEAVE sp_QuanLy_ThemTaiKhoan;
    END IF;
    
    -- Lấy ID vai trò
    SELECT IDVaiTro INTO v_idVaiTro FROM VaiTro WHERE TenVaiTro = p_vaiTro;
    
    -- Bắt đầu transaction
    START TRANSACTION;
    
    -- Tạo tài khoản
    SET v_idTaiKhoan = UUID();
    INSERT INTO TaiKhoan (ID, MatKhau, TrangThai, ThoiGianTao)
    VALUES (p_userId, p_password, 'HoatDong', NOW());
    
    -- Tạo người dùng
    SET v_idNguoiDung = UUID();
    INSERT INTO NguoiDung (IDNguoiDung, IDTaiKhoan, IDVaiTro, HoTen, Email, LienHe, GioiTinh)
    VALUES (v_idNguoiDung, p_userId, v_idVaiTro, p_hoTen, p_email, p_lienHe, p_gioiTinh);
    
    -- Tạo sinh viên/giảng viên dựa trên vai trò
    IF p_vaiTro = 'SV' THEN
        -- Lấy mã SV lớn nhất
        SELECT MAX(CAST(SUBSTRING(MaSV, 3) AS UNSIGNED)) INTO v_maxMaSV FROM SinhVien;
        IF v_maxMaSV IS NULL THEN
            SET v_newMa = 'SV001';
        ELSE
            SET v_newMa = CONCAT('SV', LPAD(v_maxMaSV + 1, 3, '0'));
        END IF;
        
        -- Tạo sinh viên
        INSERT INTO SinhVien (MaSV, IDNguoiDung, MaLop)
        VALUES (v_newMa, v_idNguoiDung, p_maLop);
        
        -- Cập nhật sĩ số lớp nếu có
        IF p_maLop IS NOT NULL THEN
            UPDATE LopHoc SET SiSo = SiSo + 1 WHERE MaLop = p_maLop;
        END IF;
        
    ELSEIF p_vaiTro = 'GV' THEN
        -- Lấy mã GV lớn nhất
        SELECT MAX(CAST(SUBSTRING(MaGV, 3) AS UNSIGNED)) INTO v_maxMaGV FROM GiangVien;
        IF v_maxMaGV IS NULL THEN
            SET v_newMa = 'GV001';
        ELSE
            SET v_newMa = CONCAT('GV', LPAD(v_maxMaGV + 1, 3, '0'));
        END IF;
        
        -- Tạo giảng viên
        INSERT INTO GiangVien (MaGV, IDNguoiDung, Khoa)
        VALUES (v_newMa, v_idNguoiDung, p_khoa);
    END IF;
    
    COMMIT;
    
    SELECT CONCAT('Tài khoản ', p_vaiTro, ' đã được tạo thành công') AS Message, 
           TRUE AS Success,
           v_newMa AS MaNguoiDung;
END //

DELIMITER ;
```

### 7.2. Quản lý phê duyệt yêu cầu mượn phòng
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_DuyetYeuCauMuonPhong(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maYeuCau INT,
    IN p_trangThai VARCHAR(20),
    IN p_ghiChu TEXT
)
BEGIN
    DECLARE v_maQL VARCHAR(10);
    DECLARE v_trangThaiYeuCau VARCHAR(20);
    DECLARE v_maPhong VARCHAR(10);
    
    -- Lấy mã quản lý từ IDNguoiDung
    SELECT MaQL INTO v_maQL FROM QuanLy WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Lấy thông tin yêu cầu
    SELECT TrangThai, MaPhong INTO v_trangThaiYeuCau, v_maPhong
    FROM YeuCauMuonPhong
    WHERE MaYeuCau = p_maYeuCau;
    
    -- Kiểm tra yêu cầu tồn tại
    IF v_trangThaiYeuCau IS NULL THEN
        SELECT 'Không tìm thấy yêu cầu mượn phòng' AS Message, FALSE AS Success;
    -- Kiểm tra trạng thái
    ELSEIF v_trangThaiYeuCau != 'DANGXULY' THEN
        SELECT 'Chỉ có thể duyệt/từ chối yêu cầu đang xử lý' AS Message, FALSE AS Success;
    ELSE
        -- Cập nhật yêu cầu
        UPDATE YeuCauMuonPhong
        SET 
            TrangThai = p_trangThai,
            MaQL = v_maQL,
            ThoiGianDuyet = NOW(),
            GhiChu = p_ghiChu
        WHERE MaYeuCau = p_maYeuCau;
        
        -- Cập nhật trạng thái phòng nếu duyệt và thời gian mượn là hiện tại
        IF p_trangThai = 'DADUYET' THEN
            IF EXISTS (
                SELECT 1 FROM YeuCauMuonPhong
                WHERE MaYeuCau = p_maYeuCau
                AND ThoiGianMuon <= NOW()
                AND ThoiGianTra > NOW()
            ) THEN
                UPDATE Phong
                SET TrangThai = 'DANGSUDUNG'
                WHERE MaPhong = v_maPhong;
            END IF;
        END IF;
        
        SELECT CONCAT('Cập nhật yêu cầu thành ', 
                      IF(p_trangThai = 'DADUYET', 'đã duyệt', 'từ chối'), 
                      ' thành công') AS Message, 
               TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.3. Quản lý thống kê
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_ThongKeSuDungPhong(
    IN p_tuNgay DATE,
    IN p_denNgay DATE
)
BEGIN
    -- Thống kê sử dụng phòng
    SELECT 
        p.MaPhong,
        p.TenPhong,
        COUNT(ycmp.MaYeuCau) AS SoLanMuon,
        SUM(TIMESTAMPDIFF(MINUTE, ycmp.ThoiGianMuon, ycmp.ThoiGianTra)) AS TongThoiGianSuDung,
        COUNT(DISTINCT CASE WHEN ycmp.MaSV IS NOT NULL THEN ycmp.MaSV END) AS SoSVSuDung,
        COUNT(DISTINCT CASE WHEN ycmp.MaGV IS NOT NULL THEN ycmp.MaGV END) AS SoGVSuDung
    FROM 
        Phong p
    LEFT JOIN 
        YeuCauMuonPhong ycmp ON p.MaPhong = ycmp.MaPhong
    WHERE 
        (ycmp.ThoiGianMuon BETWEEN p_tuNgay AND p_denNgay OR ycmp.ThoiGianMuon IS NULL)
        AND (ycmp.TrangThai = 'DADUYET' OR ycmp.TrangThai IS NULL)
    GROUP BY 
        p.MaPhong, p.TenPhong
    ORDER BY 
        SoLanMuon DESC, TongThoiGianSuDung DESC;
END //

DELIMITER ;
```

### 7.4. Quản lý phòng học
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_ThemPhongMoi(
    IN p_maPhong VARCHAR(10),
    IN p_tenPhong VARCHAR(100),
    IN p_viTri VARCHAR(100),
    IN p_loaiPhong VARCHAR(50),
    IN p_sucChua INT,
    IN p_moTa TEXT
)
BEGIN
    DECLARE v_exists INT;
    
    -- Kiểm tra phòng đã tồn tại chưa
    SELECT COUNT(*) INTO v_exists FROM Phong WHERE MaPhong = p_maPhong;
    
    IF v_exists > 0 THEN
        SELECT 'Phòng học đã tồn tại' AS Message, FALSE AS Success;
    ELSE
        -- Thêm phòng học mới
        INSERT INTO Phong (
            MaPhong, 
            TenPhong, 
            ViTri, 
            LoaiPhong, 
            SucChua, 
            TrangThai, 
            MoTa, 
            NgayTao
        )
        VALUES (
            p_maPhong,
            p_tenPhong,
            p_viTri,
            p_loaiPhong,
            p_sucChua,
            'TRONG',
            p_moTa,
            NOW()
        );
        
        SELECT 'Tạo phòng học thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.5. Quản lý sự cố
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_XuLySuCo(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maSuCo INT,
    IN p_ghiChuXuLy TEXT,
    IN p_trangThai VARCHAR(20)
)
BEGIN
    DECLARE v_maQL VARCHAR(10);
    DECLARE v_trangThaiSuCo VARCHAR(20);
    
    -- Lấy mã quản lý từ IDNguoiDung
    SELECT MaQL INTO v_maQL FROM QuanLy WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Lấy thông tin sự cố
    SELECT TrangThai INTO v_trangThaiSuCo
    FROM SuCo
    WHERE MaSuCo = p_maSuCo;
    
    -- Kiểm tra sự cố tồn tại
    IF v_trangThaiSuCo IS NULL THEN
        SELECT 'Không tìm thấy sự cố' AS Message, FALSE AS Success;
    -- Kiểm tra trạng thái
    ELSEIF v_trangThaiSuCo = 'DAXULY' THEN
        SELECT 'Sự cố này đã được xử lý' AS Message, FALSE AS Success;
    ELSE
        -- Cập nhật sự cố
        UPDATE SuCo
        SET 
            TrangThai = p_trangThai,
            MaQL = v_maQL,
            ThoiGianXuLy = NOW(),
            GhiChuXuLy = p_ghiChuXuLy
        WHERE MaSuCo = p_maSuCo;
        
        -- Nếu cần bảo trì phòng
        IF p_trangThai = 'DAXULY_BAOTRI' THEN
            UPDATE Phong p
            JOIN SuCo sc ON p.MaPhong = sc.MaPhong
            SET p.TrangThai = 'BAOTRI'
            WHERE sc.MaSuCo = p_maSuCo;
        END IF;
        
        SELECT 'Cập nhật sự cố thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.6. Quản lý lớp học
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_TaoLopHoc(
    IN p_maLop VARCHAR(10),
    IN p_tenLop VARCHAR(100),
    IN p_khoaHoc VARCHAR(20),
    IN p_namHoc VARCHAR(20)
)
BEGIN
    DECLARE v_exists INT;
    
    -- Kiểm tra lớp đã tồn tại chưa
    SELECT COUNT(*) INTO v_exists FROM LopHoc WHERE MaLop = p_maLop;
    
    IF v_exists > 0 THEN
        SELECT 'Lớp học đã tồn tại' AS Message, FALSE AS Success;
    ELSE
        -- Thêm lớp học mới
        INSERT INTO LopHoc (
            MaLop, 
            TenLop, 
            SiSo, 
            KhoaHoc,
            NamHoc
        )
        VALUES (
            p_maLop,
            p_tenLop,
            0,
            p_khoaHoc,
            p_namHoc
        );
        
        SELECT 'Tạo lớp học thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.7. Quản lý thời khóa biểu
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_TaoThoiKhoaBieu(
    IN p_maLopHoc VARCHAR(10),
    IN p_maPhong VARCHAR(10),
    IN p_ngayHoc DATE,
    IN p_gioBatDau TIME,
    IN p_gioKetThuc TIME,
    IN p_noiDung TEXT
)
BEGIN
    DECLARE v_lopExists INT;
    DECLARE v_phongExists INT;
    DECLARE v_conflict INT;
    
    -- Kiểm tra lớp tồn tại
    SELECT COUNT(*) INTO v_lopExists FROM LopHoc WHERE MaLop = p_maLopHoc;
    
    -- Kiểm tra phòng tồn tại
    SELECT COUNT(*) INTO v_phongExists FROM Phong WHERE MaPhong = p_maPhong;
    
    -- Kiểm tra xung đột lịch
    SELECT COUNT(*) INTO v_conflict
    FROM ThoiKhoaBieu tkb
    WHERE tkb.MaPhong = p_maPhong
      AND tkb.NgayHoc = p_ngayHoc
      AND (
          (p_gioBatDau BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioKetThuc BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioBatDau <= tkb.GioBatDau AND p_gioKetThuc >= tkb.GioKetThuc)
      );
    
    IF v_lopExists = 0 THEN
        SELECT 'Lớp học không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_phongExists = 0 THEN
        SELECT 'Phòng không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_conflict > 0 THEN
        SELECT 'Thời gian này đã có lịch học cho phòng này' AS Message, FALSE AS Success;
    ELSE
        -- Thêm lịch học mới
        INSERT INTO ThoiKhoaBieu (
            MaLopHoc, 
            MaPhong, 
            NgayHoc, 
            GioBatDau,
            GioKetThuc,
            NoiDung
        )
        VALUES (
            p_maLopHoc,
            p_maPhong,
            p_ngayHoc,
            p_gioBatDau,
            p_gioKetThuc,
            p_noiDung
        );
        
        -- Tự động tạo yêu cầu mượn phòng đã duyệt
        INSERT INTO YeuCauMuonPhong (
            MaPhong,
            ThoiGianMuon,
            ThoiGianTra,
            MucDich,
            ThoiGianYeuCau,
            TrangThai,
            MaLopHoc
        )
        VALUES (
            p_maPhong,
            CONCAT(p_ngayHoc, ' ', p_gioBatDau),
            CONCAT(p_ngayHoc, ' ', p_gioKetThuc),
            CONCAT('Lịch học lớp ', p_maLopHoc),
            NOW(),
            'DADUYET',
            p_maLopHoc
        );
        
        SELECT 'Tạo thời khóa biểu thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.8. Quản lý phản hồi
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_PhanHoiPhanHoi(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maPhanHoi INT,
    IN p_phanHoiTuQuanLy TEXT
)
BEGIN
    DECLARE v_maQL VARCHAR(10);
    DECLARE v_phanHoiExists INT;
    
    -- Lấy mã quản lý từ IDNguoiDung
    SELECT MaQL INTO v_maQL FROM QuanLy WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Kiểm tra phản hồi tồn tại
    SELECT COUNT(*) INTO v_phanHoiExists FROM PhanHoi WHERE MaPhanHoi = p_maPhanHoi;
    
    IF v_phanHoiExists = 0 THEN
        SELECT 'Phản hồi không tồn tại' AS Message, FALSE AS Success;
    ELSE
        -- Cập nhật phản hồi
        UPDATE PhanHoi
        SET 
            PhanHoiTuQuanLy = p_phanHoiTuQuanLy,
            MaQL = v_maQL,
            ThoiGianPhanHoiTuQuanLy = NOW(),
            DaXem = TRUE
        WHERE MaPhanHoi = p_maPhanHoi;
        
        -- Tạo thông báo cho người gửi phản hồi
        INSERT INTO ThongBaoGui (
            IDNguoiGui,
            TieuDe,
            NoiDung,
            ThoiGianGui
        )
        SELECT 
            p_idNguoiDung,
            'Phản hồi của bạn đã được trả lời',
            CONCAT('Quản lý đã trả lời phản hồi của bạn về phòng ', ph.MaPhong, ': ', p_phanHoiTuQuanLy),
            NOW()
        FROM 
            PhanHoi ph
        WHERE 
            ph.MaPhanHoi = p_maPhanHoi;
        
        -- Thêm vào bảng thông báo nhận
        INSERT INTO ThongBaoNhan (
            IDTB,
            IDNguoiNhan,
            TrangThai
        )
        SELECT 
            LAST_INSERT_ID(),
            nd.IDNguoiDung,
            'CHUADOC'
        FROM 
            PhanHoi ph
        JOIN 
            SinhVien sv ON ph.MaSV = sv.MaSV
        JOIN 
            NguoiDung nd ON sv.IDNguoiDung = nd.IDNguoiDung
        WHERE 
            ph.MaPhanHoi = p_maPhanHoi;
        
        SELECT 'Trả lời phản hồi thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.9. Quản lý điểm danh
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_DiemDanhSinhVien(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maTKB INT,
    IN p_maSV VARCHAR(10),
    IN p_trangThai VARCHAR(20)
)
BEGIN
    DECLARE v_maGV VARCHAR(10);
    DECLARE v_maLopHoc VARCHAR(10);
    DECLARE v_isTeaching BOOLEAN;
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Lấy mã lớp học từ TKB
    SELECT MaLopHoc INTO v_maLopHoc FROM ThoiKhoaBieu WHERE MaTKB = p_maTKB;
    
    -- Kiểm tra xem giảng viên có dạy lớp này không
    SELECT COUNT(*) > 0 INTO v_isTeaching
    FROM GiangVien_LopHoc
    WHERE MaGV = v_maGV AND MaLop = v_maLopHoc;
    
    IF v_maLopHoc IS NULL THEN
        SELECT 'Không tìm thấy thời khóa biểu' AS Message, FALSE AS Success;
    ELSEIF NOT v_isTeaching THEN
        SELECT 'Bạn không có quyền điểm danh lớp này' AS Message, FALSE AS Success;
    ELSE
        -- Kiểm tra xem đã có điểm danh chưa
        IF EXISTS (SELECT 1 FROM DiemDanh WHERE MaTKB = p_maTKB AND MaSV = p_maSV) THEN
            -- Cập nhật điểm danh
            UPDATE DiemDanh
            SET TrangThai = p_trangThai
            WHERE MaTKB = p_maTKB AND MaSV = p_maSV;
        ELSE
            -- Thêm mới điểm danh
            INSERT INTO DiemDanh (
                MaTKB,
                MaSV,
                TrangThai,
                ThoiGianDiemDanh
            )
            VALUES (
                p_maTKB,
                p_maSV,
                p_trangThai,
                NOW()
            );
        END IF;
        
        SELECT 'Điểm danh thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.10. Quản lý thời khóa biểu
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_TaoThoiKhoaBieu(
    IN p_maLopHoc VARCHAR(10),
    IN p_maPhong VARCHAR(10),
    IN p_ngayHoc DATE,
    IN p_gioBatDau TIME,
    IN p_gioKetThuc TIME,
    IN p_noiDung TEXT
)
BEGIN
    DECLARE v_lopExists INT;
    DECLARE v_phongExists INT;
    DECLARE v_conflict INT;
    
    -- Kiểm tra lớp tồn tại
    SELECT COUNT(*) INTO v_lopExists FROM LopHoc WHERE MaLop = p_maLopHoc;
    
    -- Kiểm tra phòng tồn tại
    SELECT COUNT(*) INTO v_phongExists FROM Phong WHERE MaPhong = p_maPhong;
    
    -- Kiểm tra xung đột lịch
    SELECT COUNT(*) INTO v_conflict
    FROM ThoiKhoaBieu tkb
    WHERE tkb.MaPhong = p_maPhong
      AND tkb.NgayHoc = p_ngayHoc
      AND (
          (p_gioBatDau BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioKetThuc BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioBatDau <= tkb.GioBatDau AND p_gioKetThuc >= tkb.GioKetThuc)
      );
    
    IF v_lopExists = 0 THEN
        SELECT 'Lớp học không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_phongExists = 0 THEN
        SELECT 'Phòng không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_conflict > 0 THEN
        SELECT 'Thời gian này đã có lịch học cho phòng này' AS Message, FALSE AS Success;
    ELSE
        -- Thêm lịch học mới
        INSERT INTO ThoiKhoaBieu (
            MaLopHoc, 
            MaPhong, 
            NgayHoc, 
            GioBatDau,
            GioKetThuc,
            NoiDung
        )
        VALUES (
            p_maLopHoc,
            p_maPhong,
            p_ngayHoc,
            p_gioBatDau,
            p_gioKetThuc,
            p_noiDung
        );
        
        -- Tự động tạo yêu cầu mượn phòng đã duyệt
        INSERT INTO YeuCauMuonPhong (
            MaPhong,
            ThoiGianMuon,
            ThoiGianTra,
            MucDich,
            ThoiGianYeuCau,
            TrangThai,
            MaLopHoc
        )
        VALUES (
            p_maPhong,
            CONCAT(p_ngayHoc, ' ', p_gioBatDau),
            CONCAT(p_ngayHoc, ' ', p_gioKetThuc),
            CONCAT('Lịch học lớp ', p_maLopHoc),
            NOW(),
            'DADUYET',
            p_maLopHoc
        );
        
        SELECT 'Tạo thời khóa biểu thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.11. Quản lý điểm danh
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_DiemDanhSinhVien(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maTKB INT,
    IN p_maSV VARCHAR(10),
    IN p_trangThai VARCHAR(20)
)
BEGIN
    DECLARE v_maGV VARCHAR(10);
    DECLARE v_maLopHoc VARCHAR(10);
    DECLARE v_isTeaching BOOLEAN;
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Lấy mã lớp học từ TKB
    SELECT MaLopHoc INTO v_maLopHoc FROM ThoiKhoaBieu WHERE MaTKB = p_maTKB;
    
    -- Kiểm tra xem giảng viên có dạy lớp này không
    SELECT COUNT(*) > 0 INTO v_isTeaching
    FROM GiangVien_LopHoc
    WHERE MaGV = v_maGV AND MaLop = v_maLopHoc;
    
    IF v_maLopHoc IS NULL THEN
        SELECT 'Không tìm thấy thời khóa biểu' AS Message, FALSE AS Success;
    ELSEIF NOT v_isTeaching THEN
        SELECT 'Bạn không có quyền điểm danh lớp này' AS Message, FALSE AS Success;
    ELSE
        -- Kiểm tra xem đã có điểm danh chưa
        IF EXISTS (SELECT 1 FROM DiemDanh WHERE MaTKB = p_maTKB AND MaSV = p_maSV) THEN
            -- Cập nhật điểm danh
            UPDATE DiemDanh
            SET TrangThai = p_trangThai
            WHERE MaTKB = p_maTKB AND MaSV = p_maSV;
        ELSE
            -- Thêm mới điểm danh
            INSERT INTO DiemDanh (
                MaTKB,
                MaSV,
                TrangThai,
                ThoiGianDiemDanh
            )
            VALUES (
                p_maTKB,
                p_maSV,
                p_trangThai,
                NOW()
            );
        END IF;
        
        SELECT 'Điểm danh thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.12. Quản lý thời khóa biểu
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_TaoThoiKhoaBieu(
    IN p_maLopHoc VARCHAR(10),
    IN p_maPhong VARCHAR(10),
    IN p_ngayHoc DATE,
    IN p_gioBatDau TIME,
    IN p_gioKetThuc TIME,
    IN p_noiDung TEXT
)
BEGIN
    DECLARE v_lopExists INT;
    DECLARE v_phongExists INT;
    DECLARE v_conflict INT;
    
    -- Kiểm tra lớp tồn tại
    SELECT COUNT(*) INTO v_lopExists FROM LopHoc WHERE MaLop = p_maLopHoc;
    
    -- Kiểm tra phòng tồn tại
    SELECT COUNT(*) INTO v_phongExists FROM Phong WHERE MaPhong = p_maPhong;
    
    -- Kiểm tra xung đột lịch
    SELECT COUNT(*) INTO v_conflict
    FROM ThoiKhoaBieu tkb
    WHERE tkb.MaPhong = p_maPhong
      AND tkb.NgayHoc = p_ngayHoc
      AND (
          (p_gioBatDau BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioKetThuc BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioBatDau <= tkb.GioBatDau AND p_gioKetThuc >= tkb.GioKetThuc)
      );
    
    IF v_lopExists = 0 THEN
        SELECT 'Lớp học không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_phongExists = 0 THEN
        SELECT 'Phòng không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_conflict > 0 THEN
        SELECT 'Thời gian này đã có lịch học cho phòng này' AS Message, FALSE AS Success;
    ELSE
        -- Thêm lịch học mới
        INSERT INTO ThoiKhoaBieu (
            MaLopHoc, 
            MaPhong, 
            NgayHoc, 
            GioBatDau,
            GioKetThuc,
            NoiDung
        )
        VALUES (
            p_maLopHoc,
            p_maPhong,
            p_ngayHoc,
            p_gioBatDau,
            p_gioKetThuc,
            p_noiDung
        );
        
        -- Tự động tạo yêu cầu mượn phòng đã duyệt
        INSERT INTO YeuCauMuonPhong (
            MaPhong,
            ThoiGianMuon,
            ThoiGianTra,
            MucDich,
            ThoiGianYeuCau,
            TrangThai,
            MaLopHoc
        )
        VALUES (
            p_maPhong,
            CONCAT(p_ngayHoc, ' ', p_gioBatDau),
            CONCAT(p_ngayHoc, ' ', p_gioKetThuc),
            CONCAT('Lịch học lớp ', p_maLopHoc),
            NOW(),
            'DADUYET',
            p_maLopHoc
        );
        
        SELECT 'Tạo thời khóa biểu thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.13. Quản lý điểm danh
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_DiemDanhSinhVien(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maTKB INT,
    IN p_maSV VARCHAR(10),
    IN p_trangThai VARCHAR(20)
)
BEGIN
    DECLARE v_maGV VARCHAR(10);
    DECLARE v_maLopHoc VARCHAR(10);
    DECLARE v_isTeaching BOOLEAN;
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Lấy mã lớp học từ TKB
    SELECT MaLopHoc INTO v_maLopHoc FROM ThoiKhoaBieu WHERE MaTKB = p_maTKB;
    
    -- Kiểm tra xem giảng viên có dạy lớp này không
    SELECT COUNT(*) > 0 INTO v_isTeaching
    FROM GiangVien_LopHoc
    WHERE MaGV = v_maGV AND MaLop = v_maLopHoc;
    
    IF v_maLopHoc IS NULL THEN
        SELECT 'Không tìm thấy thời khóa biểu' AS Message, FALSE AS Success;
    ELSEIF NOT v_isTeaching THEN
        SELECT 'Bạn không có quyền điểm danh lớp này' AS Message, FALSE AS Success;
    ELSE
        -- Kiểm tra xem đã có điểm danh chưa
        IF EXISTS (SELECT 1 FROM DiemDanh WHERE MaTKB = p_maTKB AND MaSV = p_maSV) THEN
            -- Cập nhật điểm danh
            UPDATE DiemDanh
            SET TrangThai = p_trangThai
            WHERE MaTKB = p_maTKB AND MaSV = p_maSV;
        ELSE
            -- Thêm mới điểm danh
            INSERT INTO DiemDanh (
                MaTKB,
                MaSV,
                TrangThai,
                ThoiGianDiemDanh
            )
            VALUES (
                p_maTKB,
                p_maSV,
                p_trangThai,
                NOW()
            );
        END IF;
        
        SELECT 'Điểm danh thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.14. Quản lý thời khóa biểu
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_TaoThoiKhoaBieu(
    IN p_maLopHoc VARCHAR(10),
    IN p_maPhong VARCHAR(10),
    IN p_ngayHoc DATE,
    IN p_gioBatDau TIME,
    IN p_gioKetThuc TIME,
    IN p_noiDung TEXT
)
BEGIN
    DECLARE v_lopExists INT;
    DECLARE v_phongExists INT;
    DECLARE v_conflict INT;
    
    -- Kiểm tra lớp tồn tại
    SELECT COUNT(*) INTO v_lopExists FROM LopHoc WHERE MaLop = p_maLopHoc;
    
    -- Kiểm tra phòng tồn tại
    SELECT COUNT(*) INTO v_phongExists FROM Phong WHERE MaPhong = p_maPhong;
    
    -- Kiểm tra xung đột lịch
    SELECT COUNT(*) INTO v_conflict
    FROM ThoiKhoaBieu tkb
    WHERE tkb.MaPhong = p_maPhong
      AND tkb.NgayHoc = p_ngayHoc
      AND (
          (p_gioBatDau BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioKetThuc BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioBatDau <= tkb.GioBatDau AND p_gioKetThuc >= tkb.GioKetThuc)
      );
    
    IF v_lopExists = 0 THEN
        SELECT 'Lớp học không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_phongExists = 0 THEN
        SELECT 'Phòng không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_conflict > 0 THEN
        SELECT 'Thời gian này đã có lịch học cho phòng này' AS Message, FALSE AS Success;
    ELSE
        -- Thêm lịch học mới
        INSERT INTO ThoiKhoaBieu (
            MaLopHoc, 
            MaPhong, 
            NgayHoc, 
            GioBatDau,
            GioKetThuc,
            NoiDung
        )
        VALUES (
            p_maLopHoc,
            p_maPhong,
            p_ngayHoc,
            p_gioBatDau,
            p_gioKetThuc,
            p_noiDung
        );
        
        -- Tự động tạo yêu cầu mượn phòng đã duyệt
        INSERT INTO YeuCauMuonPhong (
            MaPhong,
            ThoiGianMuon,
            ThoiGianTra,
            MucDich,
            ThoiGianYeuCau,
            TrangThai,
            MaLopHoc
        )
        VALUES (
            p_maPhong,
            CONCAT(p_ngayHoc, ' ', p_gioBatDau),
            CONCAT(p_ngayHoc, ' ', p_gioKetThuc),
            CONCAT('Lịch học lớp ', p_maLopHoc),
            NOW(),
            'DADUYET',
            p_maLopHoc
        );
        
        SELECT 'Tạo thời khóa biểu thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.15. Quản lý điểm danh
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_DiemDanhSinhVien(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maTKB INT,
    IN p_maSV VARCHAR(10),
    IN p_trangThai VARCHAR(20)
)
BEGIN
    DECLARE v_maGV VARCHAR(10);
    DECLARE v_maLopHoc VARCHAR(10);
    DECLARE v_isTeaching BOOLEAN;
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Lấy mã lớp học từ TKB
    SELECT MaLopHoc INTO v_maLopHoc FROM ThoiKhoaBieu WHERE MaTKB = p_maTKB;
    
    -- Kiểm tra xem giảng viên có dạy lớp này không
    SELECT COUNT(*) > 0 INTO v_isTeaching
    FROM GiangVien_LopHoc
    WHERE MaGV = v_maGV AND MaLop = v_maLopHoc;
    
    IF v_maLopHoc IS NULL THEN
        SELECT 'Không tìm thấy thời khóa biểu' AS Message, FALSE AS Success;
    ELSEIF NOT v_isTeaching THEN
        SELECT 'Bạn không có quyền điểm danh lớp này' AS Message, FALSE AS Success;
    ELSE
        -- Kiểm tra xem đã có điểm danh chưa
        IF EXISTS (SELECT 1 FROM DiemDanh WHERE MaTKB = p_maTKB AND MaSV = p_maSV) THEN
            -- Cập nhật điểm danh
            UPDATE DiemDanh
            SET TrangThai = p_trangThai
            WHERE MaTKB = p_maTKB AND MaSV = p_maSV;
        ELSE
            -- Thêm mới điểm danh
            INSERT INTO DiemDanh (
                MaTKB,
                MaSV,
                TrangThai,
                ThoiGianDiemDanh
            )
            VALUES (
                p_maTKB,
                p_maSV,
                p_trangThai,
                NOW()
            );
        END IF;
        
        SELECT 'Điểm danh thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.16. Quản lý thời khóa biểu
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_TaoThoiKhoaBieu(
    IN p_maLopHoc VARCHAR(10),
    IN p_maPhong VARCHAR(10),
    IN p_ngayHoc DATE,
    IN p_gioBatDau TIME,
    IN p_gioKetThuc TIME,
    IN p_noiDung TEXT
)
BEGIN
    DECLARE v_lopExists INT;
    DECLARE v_phongExists INT;
    DECLARE v_conflict INT;
    
    -- Kiểm tra lớp tồn tại
    SELECT COUNT(*) INTO v_lopExists FROM LopHoc WHERE MaLop = p_maLopHoc;
    
    -- Kiểm tra phòng tồn tại
    SELECT COUNT(*) INTO v_phongExists FROM Phong WHERE MaPhong = p_maPhong;
    
    -- Kiểm tra xung đột lịch
    SELECT COUNT(*) INTO v_conflict
    FROM ThoiKhoaBieu tkb
    WHERE tkb.MaPhong = p_maPhong
      AND tkb.NgayHoc = p_ngayHoc
      AND (
          (p_gioBatDau BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioKetThuc BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioBatDau <= tkb.GioBatDau AND p_gioKetThuc >= tkb.GioKetThuc)
      );
    
    IF v_lopExists = 0 THEN
        SELECT 'Lớp học không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_phongExists = 0 THEN
        SELECT 'Phòng không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_conflict > 0 THEN
        SELECT 'Thời gian này đã có lịch học cho phòng này' AS Message, FALSE AS Success;
    ELSE
        -- Thêm lịch học mới
        INSERT INTO ThoiKhoaBieu (
            MaLopHoc, 
            MaPhong, 
            NgayHoc, 
            GioBatDau,
            GioKetThuc,
            NoiDung
        )
        VALUES (
            p_maLopHoc,
            p_maPhong,
            p_ngayHoc,
            p_gioBatDau,
            p_gioKetThuc,
            p_noiDung
        );
        
        -- Tự động tạo yêu cầu mượn phòng đã duyệt
        INSERT INTO YeuCauMuonPhong (
            MaPhong,
            ThoiGianMuon,
            ThoiGianTra,
            MucDich,
            ThoiGianYeuCau,
            TrangThai,
            MaLopHoc
        )
        VALUES (
            p_maPhong,
            CONCAT(p_ngayHoc, ' ', p_gioBatDau),
            CONCAT(p_ngayHoc, ' ', p_gioKetThuc),
            CONCAT('Lịch học lớp ', p_maLopHoc),
            NOW(),
            'DADUYET',
            p_maLopHoc
        );
        
        SELECT 'Tạo thời khóa biểu thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.17. Quản lý phản hồi
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_PhanHoiPhanHoi(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maPhanHoi INT,
    IN p_phanHoiTuQuanLy TEXT
)
BEGIN
    DECLARE v_maQL VARCHAR(10);
    DECLARE v_phanHoiExists INT;
    
    -- Lấy mã quản lý từ IDNguoiDung
    SELECT MaQL INTO v_maQL FROM QuanLy WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Kiểm tra phản hồi tồn tại
    SELECT COUNT(*) INTO v_phanHoiExists FROM PhanHoi WHERE MaPhanHoi = p_maPhanHoi;
    
    IF v_phanHoiExists = 0 THEN
        SELECT 'Phản hồi không tồn tại' AS Message, FALSE AS Success;
    ELSE
        -- Cập nhật phản hồi
        UPDATE PhanHoi
        SET 
            PhanHoiTuQuanLy = p_phanHoiTuQuanLy,
            MaQL = v_maQL,
            ThoiGianPhanHoiTuQuanLy = NOW(),
            DaXem = TRUE
        WHERE MaPhanHoi = p_maPhanHoi;
        
        -- Tạo thông báo cho người gửi phản hồi
        INSERT INTO ThongBaoGui (
            IDNguoiGui,
            TieuDe,
            NoiDung,
            ThoiGianGui
        )
        SELECT 
            p_idNguoiDung,
            'Phản hồi của bạn đã được trả lời',
            CONCAT('Quản lý đã trả lời phản hồi của bạn về phòng ', ph.MaPhong, ': ', p_phanHoiTuQuanLy),
            NOW()
        FROM 
            PhanHoi ph
        WHERE 
            ph.MaPhanHoi = p_maPhanHoi;
        
        -- Thêm vào bảng thông báo nhận
        INSERT INTO ThongBaoNhan (
            IDTB,
            IDNguoiNhan,
            TrangThai
        )
        SELECT 
            LAST_INSERT_ID(),
            nd.IDNguoiDung,
            'CHUADOC'
        FROM 
            PhanHoi ph
        JOIN 
            SinhVien sv ON ph.MaSV = sv.MaSV
        JOIN 
            NguoiDung nd ON sv.IDNguoiDung = nd.IDNguoiDung
        WHERE 
            ph.MaPhanHoi = p_maPhanHoi;
        
        SELECT 'Trả lời phản hồi thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.18. Quản lý điểm danh
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_DiemDanhSinhVien(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maTKB INT,
    IN p_maSV VARCHAR(10),
    IN p_trangThai VARCHAR(20)
)
BEGIN
    DECLARE v_maGV VARCHAR(10);
    DECLARE v_maLopHoc VARCHAR(10);
    DECLARE v_isTeaching BOOLEAN;
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Lấy mã lớp học từ TKB
    SELECT MaLopHoc INTO v_maLopHoc FROM ThoiKhoaBieu WHERE MaTKB = p_maTKB;
    
    -- Kiểm tra xem giảng viên có dạy lớp này không
    SELECT COUNT(*) > 0 INTO v_isTeaching
    FROM GiangVien_LopHoc
    WHERE MaGV = v_maGV AND MaLop = v_maLopHoc;
    
    IF v_maLopHoc IS NULL THEN
        SELECT 'Không tìm thấy thời khóa biểu' AS Message, FALSE AS Success;
    ELSEIF NOT v_isTeaching THEN
        SELECT 'Bạn không có quyền điểm danh lớp này' AS Message, FALSE AS Success;
    ELSE
        -- Kiểm tra xem đã có điểm danh chưa
        IF EXISTS (SELECT 1 FROM DiemDanh WHERE MaTKB = p_maTKB AND MaSV = p_maSV) THEN
            -- Cập nhật điểm danh
            UPDATE DiemDanh
            SET TrangThai = p_trangThai
            WHERE MaTKB = p_maTKB AND MaSV = p_maSV;
        ELSE
            -- Thêm mới điểm danh
            INSERT INTO DiemDanh (
                MaTKB,
                MaSV,
                TrangThai,
                ThoiGianDiemDanh
            )
            VALUES (
                p_maTKB,
                p_maSV,
                p_trangThai,
                NOW()
            );
        END IF;
        
        SELECT 'Điểm danh thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.19. Quản lý thời khóa biểu
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_TaoThoiKhoaBieu(
    IN p_maLopHoc VARCHAR(10),
    IN p_maPhong VARCHAR(10),
    IN p_ngayHoc DATE,
    IN p_gioBatDau TIME,
    IN p_gioKetThuc TIME,
    IN p_noiDung TEXT
)
BEGIN
    DECLARE v_lopExists INT;
    DECLARE v_phongExists INT;
    DECLARE v_conflict INT;
    
    -- Kiểm tra lớp tồn tại
    SELECT COUNT(*) INTO v_lopExists FROM LopHoc WHERE MaLop = p_maLopHoc;
    
    -- Kiểm tra phòng tồn tại
    SELECT COUNT(*) INTO v_phongExists FROM Phong WHERE MaPhong = p_maPhong;
    
    -- Kiểm tra xung đột lịch
    SELECT COUNT(*) INTO v_conflict
    FROM ThoiKhoaBieu tkb
    WHERE tkb.MaPhong = p_maPhong
      AND tkb.NgayHoc = p_ngayHoc
      AND (
          (p_gioBatDau BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioKetThuc BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioBatDau <= tkb.GioBatDau AND p_gioKetThuc >= tkb.GioKetThuc)
      );
    
    IF v_lopExists = 0 THEN
        SELECT 'Lớp học không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_phongExists = 0 THEN
        SELECT 'Phòng không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_conflict > 0 THEN
        SELECT 'Thời gian này đã có lịch học cho phòng này' AS Message, FALSE AS Success;
    ELSE
        -- Thêm lịch học mới
        INSERT INTO ThoiKhoaBieu (
            MaLopHoc, 
            MaPhong, 
            NgayHoc, 
            GioBatDau,
            GioKetThuc,
            NoiDung
        )
        VALUES (
            p_maLopHoc,
            p_maPhong,
            p_ngayHoc,
            p_gioBatDau,
            p_gioKetThuc,
            p_noiDung
        );
        
        -- Tự động tạo yêu cầu mượn phòng đã duyệt
        INSERT INTO YeuCauMuonPhong (
            MaPhong,
            ThoiGianMuon,
            ThoiGianTra,
            MucDich,
            ThoiGianYeuCau,
            TrangThai,
            MaLopHoc
        )
        VALUES (
            p_maPhong,
            CONCAT(p_ngayHoc, ' ', p_gioBatDau),
            CONCAT(p_ngayHoc, ' ', p_gioKetThuc),
            CONCAT('Lịch học lớp ', p_maLopHoc),
            NOW(),
            'DADUYET',
            p_maLopHoc
        );
        
        SELECT 'Tạo thời khóa biểu thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.20. Quản lý điểm danh
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_DiemDanhSinhVien(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maTKB INT,
    IN p_maSV VARCHAR(10),
    IN p_trangThai VARCHAR(20)
)
BEGIN
    DECLARE v_maGV VARCHAR(10);
    DECLARE v_maLopHoc VARCHAR(10);
    DECLARE v_isTeaching BOOLEAN;
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Lấy mã lớp học từ TKB
    SELECT MaLopHoc INTO v_maLopHoc FROM ThoiKhoaBieu WHERE MaTKB = p_maTKB;
    
    -- Kiểm tra xem giảng viên có dạy lớp này không
    SELECT COUNT(*) > 0 INTO v_isTeaching
    FROM GiangVien_LopHoc
    WHERE MaGV = v_maGV AND MaLop = v_maLopHoc;
    
    IF v_maLopHoc IS NULL THEN
        SELECT 'Không tìm thấy thời khóa biểu' AS Message, FALSE AS Success;
    ELSEIF NOT v_isTeaching THEN
        SELECT 'Bạn không có quyền điểm danh lớp này' AS Message, FALSE AS Success;
    ELSE
        -- Kiểm tra xem đã có điểm danh chưa
        IF EXISTS (SELECT 1 FROM DiemDanh WHERE MaTKB = p_maTKB AND MaSV = p_maSV) THEN
            -- Cập nhật điểm danh
            UPDATE DiemDanh
            SET TrangThai = p_trangThai
            WHERE MaTKB = p_maTKB AND MaSV = p_maSV;
        ELSE
            -- Thêm mới điểm danh
            INSERT INTO DiemDanh (
                MaTKB,
                MaSV,
                TrangThai,
                ThoiGianDiemDanh
            )
            VALUES (
                p_maTKB,
                p_maSV,
                p_trangThai,
                NOW()
            );
        END IF;
        
        SELECT 'Điểm danh thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.21. Quản lý thời khóa biểu
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_TaoThoiKhoaBieu(
    IN p_maLopHoc VARCHAR(10),
    IN p_maPhong VARCHAR(10),
    IN p_ngayHoc DATE,
    IN p_gioBatDau TIME,
    IN p_gioKetThuc TIME,
    IN p_noiDung TEXT
)
BEGIN
    DECLARE v_lopExists INT;
    DECLARE v_phongExists INT;
    DECLARE v_conflict INT;
    
    -- Kiểm tra lớp tồn tại
    SELECT COUNT(*) INTO v_lopExists FROM LopHoc WHERE MaLop = p_maLopHoc;
    
    -- Kiểm tra phòng tồn tại
    SELECT COUNT(*) INTO v_phongExists FROM Phong WHERE MaPhong = p_maPhong;
    
    -- Kiểm tra xung đột lịch
    SELECT COUNT(*) INTO v_conflict
    FROM ThoiKhoaBieu tkb
    WHERE tkb.MaPhong = p_maPhong
      AND tkb.NgayHoc = p_ngayHoc
      AND (
          (p_gioBatDau BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioKetThuc BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioBatDau <= tkb.GioBatDau AND p_gioKetThuc >= tkb.GioKetThuc)
      );
    
    IF v_lopExists = 0 THEN
        SELECT 'Lớp học không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_phongExists = 0 THEN
        SELECT 'Phòng không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_conflict > 0 THEN
        SELECT 'Thời gian này đã có lịch học cho phòng này' AS Message, FALSE AS Success;
    ELSE
        -- Thêm lịch học mới
        INSERT INTO ThoiKhoaBieu (
            MaLopHoc, 
            MaPhong, 
            NgayHoc, 
            GioBatDau,
            GioKetThuc,
            NoiDung
        )
        VALUES (
            p_maLopHoc,
            p_maPhong,
            p_ngayHoc,
            p_gioBatDau,
            p_gioKetThuc,
            p_noiDung
        );
        
        -- Tự động tạo yêu cầu mượn phòng đã duyệt
        INSERT INTO YeuCauMuonPhong (
            MaPhong,
            ThoiGianMuon,
            ThoiGianTra,
            MucDich,
            ThoiGianYeuCau,
            TrangThai,
            MaLopHoc
        )
        VALUES (
            p_maPhong,
            CONCAT(p_ngayHoc, ' ', p_gioBatDau),
            CONCAT(p_ngayHoc, ' ', p_gioKetThuc),
            CONCAT('Lịch học lớp ', p_maLopHoc),
            NOW(),
            'DADUYET',
            p_maLopHoc
        );
        
        SELECT 'Tạo thời khóa biểu thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.22. Quản lý điểm danh
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_DiemDanhSinhVien(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maTKB INT,
    IN p_maSV VARCHAR(10),
    IN p_trangThai VARCHAR(20)
)
BEGIN
    DECLARE v_maGV VARCHAR(10);
    DECLARE v_maLopHoc VARCHAR(10);
    DECLARE v_isTeaching BOOLEAN;
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Lấy mã lớp học từ TKB
    SELECT MaLopHoc INTO v_maLopHoc FROM ThoiKhoaBieu WHERE MaTKB = p_maTKB;
    
    -- Kiểm tra xem giảng viên có dạy lớp này không
    SELECT COUNT(*) > 0 INTO v_isTeaching
    FROM GiangVien_LopHoc
    WHERE MaGV = v_maGV AND MaLop = v_maLopHoc;
    
    IF v_maLopHoc IS NULL THEN
        SELECT 'Không tìm thấy thời khóa biểu' AS Message, FALSE AS Success;
    ELSEIF NOT v_isTeaching THEN
        SELECT 'Bạn không có quyền điểm danh lớp này' AS Message, FALSE AS Success;
    ELSE
        -- Kiểm tra xem đã có điểm danh chưa
        IF EXISTS (SELECT 1 FROM DiemDanh WHERE MaTKB = p_maTKB AND MaSV = p_maSV) THEN
            -- Cập nhật điểm danh
            UPDATE DiemDanh
            SET TrangThai = p_trangThai
            WHERE MaTKB = p_maTKB AND MaSV = p_maSV;
        ELSE
            -- Thêm mới điểm danh
            INSERT INTO DiemDanh (
                MaTKB,
                MaSV,
                TrangThai,
                ThoiGianDiemDanh
            )
            VALUES (
                p_maTKB,
                p_maSV,
                p_trangThai,
                NOW()
            );
        END IF;
        
        SELECT 'Điểm danh thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.23. Quản lý thời khóa biểu
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_TaoThoiKhoaBieu(
    IN p_maLopHoc VARCHAR(10),
    IN p_maPhong VARCHAR(10),
    IN p_ngayHoc DATE,
    IN p_gioBatDau TIME,
    IN p_gioKetThuc TIME,
    IN p_noiDung TEXT
)
BEGIN
    DECLARE v_lopExists INT;
    DECLARE v_phongExists INT;
    DECLARE v_conflict INT;
    
    -- Kiểm tra lớp tồn tại
    SELECT COUNT(*) INTO v_lopExists FROM LopHoc WHERE MaLop = p_maLopHoc;
    
    -- Kiểm tra phòng tồn tại
    SELECT COUNT(*) INTO v_phongExists FROM Phong WHERE MaPhong = p_maPhong;
    
    -- Kiểm tra xung đột lịch
    SELECT COUNT(*) INTO v_conflict
    FROM ThoiKhoaBieu tkb
    WHERE tkb.MaPhong = p_maPhong
      AND tkb.NgayHoc = p_ngayHoc
      AND (
          (p_gioBatDau BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioKetThuc BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioBatDau <= tkb.GioBatDau AND p_gioKetThuc >= tkb.GioKetThuc)
      );
    
    IF v_lopExists = 0 THEN
        SELECT 'Lớp học không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_phongExists = 0 THEN
        SELECT 'Phòng không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_conflict > 0 THEN
        SELECT 'Thời gian này đã có lịch học cho phòng này' AS Message, FALSE AS Success;
    ELSE
        -- Thêm lịch học mới
        INSERT INTO ThoiKhoaBieu (
            MaLopHoc, 
            MaPhong, 
            NgayHoc, 
            GioBatDau,
            GioKetThuc,
            NoiDung
        )
        VALUES (
            p_maLopHoc,
            p_maPhong,
            p_ngayHoc,
            p_gioBatDau,
            p_gioKetThuc,
            p_noiDung
        );
        
        -- Tự động tạo yêu cầu mượn phòng đã duyệt
        INSERT INTO YeuCauMuonPhong (
            MaPhong,
            ThoiGianMuon,
            ThoiGianTra,
            MucDich,
            ThoiGianYeuCau,
            TrangThai,
            MaLopHoc
        )
        VALUES (
            p_maPhong,
            CONCAT(p_ngayHoc, ' ', p_gioBatDau),
            CONCAT(p_ngayHoc, ' ', p_gioKetThuc),
            CONCAT('Lịch học lớp ', p_maLopHoc),
            NOW(),
            'DADUYET',
            p_maLopHoc
        );
        
        SELECT 'Tạo thời khóa biểu thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.24. Quản lý điểm danh
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_DiemDanhSinhVien(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maTKB INT,
    IN p_maSV VARCHAR(10),
    IN p_trangThai VARCHAR(20)
)
BEGIN
    DECLARE v_maGV VARCHAR(10);
    DECLARE v_maLopHoc VARCHAR(10);
    DECLARE v_isTeaching BOOLEAN;
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Lấy mã lớp học từ TKB
    SELECT MaLopHoc INTO v_maLopHoc FROM ThoiKhoaBieu WHERE MaTKB = p_maTKB;
    
    -- Kiểm tra xem giảng viên có dạy lớp này không
    SELECT COUNT(*) > 0 INTO v_isTeaching
    FROM GiangVien_LopHoc
    WHERE MaGV = v_maGV AND MaLop = v_maLopHoc;
    
    IF v_maLopHoc IS NULL THEN
        SELECT 'Không tìm thấy thời khóa biểu' AS Message, FALSE AS Success;
    ELSEIF NOT v_isTeaching THEN
        SELECT 'Bạn không có quyền điểm danh lớp này' AS Message, FALSE AS Success;
    ELSE
        -- Kiểm tra xem đã có điểm danh chưa
        IF EXISTS (SELECT 1 FROM DiemDanh WHERE MaTKB = p_maTKB AND MaSV = p_maSV) THEN
            -- Cập nhật điểm danh
            UPDATE DiemDanh
            SET TrangThai = p_trangThai
            WHERE MaTKB = p_maTKB AND MaSV = p_maSV;
        ELSE
            -- Thêm mới điểm danh
            INSERT INTO DiemDanh (
                MaTKB,
                MaSV,
                TrangThai,
                ThoiGianDiemDanh
            )
            VALUES (
                p_maTKB,
                p_maSV,
                p_trangThai,
                NOW()
            );
        END IF;
        
        SELECT 'Điểm danh thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.25. Quản lý thời khóa biểu
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_TaoThoiKhoaBieu(
    IN p_maLopHoc VARCHAR(10),
    IN p_maPhong VARCHAR(10),
    IN p_ngayHoc DATE,
    IN p_gioBatDau TIME,
    IN p_gioKetThuc TIME,
    IN p_noiDung TEXT
)
BEGIN
    DECLARE v_lopExists INT;
    DECLARE v_phongExists INT;
    DECLARE v_conflict INT;
    
    -- Kiểm tra lớp tồn tại
    SELECT COUNT(*) INTO v_lopExists FROM LopHoc WHERE MaLop = p_maLopHoc;
    
    -- Kiểm tra phòng tồn tại
    SELECT COUNT(*) INTO v_phongExists FROM Phong WHERE MaPhong = p_maPhong;
    
    -- Kiểm tra xung đột lịch
    SELECT COUNT(*) INTO v_conflict
    FROM ThoiKhoaBieu tkb
    WHERE tkb.MaPhong = p_maPhong
      AND tkb.NgayHoc = p_ngayHoc
      AND (
          (p_gioBatDau BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioKetThuc BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioBatDau <= tkb.GioBatDau AND p_gioKetThuc >= tkb.GioKetThuc)
      );
    
    IF v_lopExists = 0 THEN
        SELECT 'Lớp học không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_phongExists = 0 THEN
        SELECT 'Phòng không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_conflict > 0 THEN
        SELECT 'Thời gian này đã có lịch học cho phòng này' AS Message, FALSE AS Success;
    ELSE
        -- Thêm lịch học mới
        INSERT INTO ThoiKhoaBieu (
            MaLopHoc, 
            MaPhong, 
            NgayHoc, 
            GioBatDau,
            GioKetThuc,
            NoiDung
        )
        VALUES (
            p_maLopHoc,
            p_maPhong,
            p_ngayHoc,
            p_gioBatDau,
            p_gioKetThuc,
            p_noiDung
        );
        
        -- Tự động tạo yêu cầu mượn phòng đã duyệt
        INSERT INTO YeuCauMuonPhong (
            MaPhong,
            ThoiGianMuon,
            ThoiGianTra,
            MucDich,
            ThoiGianYeuCau,
            TrangThai,
            MaLopHoc
        )
        VALUES (
            p_maPhong,
            CONCAT(p_ngayHoc, ' ', p_gioBatDau),
            CONCAT(p_ngayHoc, ' ', p_gioKetThuc),
            CONCAT('Lịch học lớp ', p_maLopHoc),
            NOW(),
            'DADUYET',
            p_maLopHoc
        );
        
        SELECT 'Tạo thời khóa biểu thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.26. Quản lý điểm danh
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_DiemDanhSinhVien(
    IN p_idNguoiDung VARCHAR(36),
    IN p_maTKB INT,
    IN p_maSV VARCHAR(10),
    IN p_trangThai VARCHAR(20)
)
BEGIN
    DECLARE v_maGV VARCHAR(10);
    DECLARE v_maLopHoc VARCHAR(10);
    DECLARE v_isTeaching BOOLEAN;
    
    -- Lấy mã giảng viên từ IDNguoiDung
    SELECT MaGV INTO v_maGV FROM GiangVien WHERE IDNguoiDung = p_idNguoiDung;
    
    -- Lấy mã lớp học từ TKB
    SELECT MaLopHoc INTO v_maLopHoc FROM ThoiKhoaBieu WHERE MaTKB = p_maTKB;
    
    -- Kiểm tra xem giảng viên có dạy lớp này không
    SELECT COUNT(*) > 0 INTO v_isTeaching
    FROM GiangVien_LopHoc
    WHERE MaGV = v_maGV AND MaLop = v_maLopHoc;
    
    IF v_maLopHoc IS NULL THEN
        SELECT 'Không tìm thấy thời khóa biểu' AS Message, FALSE AS Success;
    ELSEIF NOT v_isTeaching THEN
        SELECT 'Bạn không có quyền điểm danh lớp này' AS Message, FALSE AS Success;
    ELSE
        -- Kiểm tra xem đã có điểm danh chưa
        IF EXISTS (SELECT 1 FROM DiemDanh WHERE MaTKB = p_maTKB AND MaSV = p_maSV) THEN
            -- Cập nhật điểm danh
            UPDATE DiemDanh
            SET TrangThai = p_trangThai
            WHERE MaTKB = p_maTKB AND MaSV = p_maSV;
        ELSE
            -- Thêm mới điểm danh
            INSERT INTO DiemDanh (
                MaTKB,
                MaSV,
                TrangThai,
                ThoiGianDiemDanh
            )
            VALUES (
                p_maTKB,
                p_maSV,
                p_trangThai,
                NOW()
            );
        END IF;
        
        SELECT 'Điểm danh thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.27. Quản lý thời khóa biểu
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_TaoThoiKhoaBieu(
    IN p_maLopHoc VARCHAR(10),
    IN p_maPhong VARCHAR(10),
    IN p_ngayHoc DATE,
    IN p_gioBatDau TIME,
    IN p_gioKetThuc TIME,
    IN p_noiDung TEXT
)
BEGIN
    DECLARE v_lopExists INT;
    DECLARE v_phongExists INT;
    DECLARE v_conflict INT;
    
    -- Kiểm tra lớp tồn tại
    SELECT COUNT(*) INTO v_lopExists FROM LopHoc WHERE MaLop = p_maLopHoc;
    
    -- Kiểm tra phòng tồn tại
    SELECT COUNT(*) INTO v_phongExists FROM Phong WHERE MaPhong = p_maPhong;
    
    -- Kiểm tra xung đột lịch
    SELECT COUNT(*) INTO v_conflict
    FROM ThoiKhoaBieu tkb
    WHERE tkb.MaPhong = p_maPhong
      AND tkb.NgayHoc = p_ngayHoc
      AND (
          (p_gioBatDau BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioKetThuc BETWEEN tkb.GioBatDau AND tkb.GioKetThuc)
          OR (p_gioBatDau <= tkb.GioBatDau AND p_gioKetThuc >= tkb.GioKetThuc)
      );
    
    IF v_lopExists = 0 THEN
        SELECT 'Lớp học không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_phongExists = 0 THEN
        SELECT 'Phòng không tồn tại' AS Message, FALSE AS Success;
    ELSEIF v_conflict > 0 THEN
        SELECT 'Thời gian này đã có lịch học cho phòng này' AS Message, FALSE AS Success;
    ELSE
        -- Thêm lịch học mới
        INSERT INTO ThoiKhoaBieu (
            MaLopHoc, 
            MaPhong, 
            NgayHoc, 
            GioBatDau,
            GioKetThuc,
            NoiDung
        )
        VALUES (
            p_maLopHoc,
            p_maPhong,
            p_ngayHoc,
            p_gioBatDau,
            p_gioKetThuc,
            p_noiDung
        );
        
        -- Tự động tạo yêu cầu mượn phòng đã duyệt
        INSERT INTO YeuCauMuonPhong (
            MaPhong,
            ThoiGianMuon,
            ThoiGianTra,
            MucDich,
            ThoiGianYeuCau,
            TrangThai,
            MaLopHoc
        )
        VALUES (
            p_maPhong,
            CONCAT(p_ngayHoc, ' ', p_gioBatDau),
            CONCAT(p_ngayHoc, ' ', p_gioKetThuc),
            CONCAT('Lịch học lớp ', p_maLopHoc),
            NOW(),
            'DADUYET',
            p_maLopHoc
        );
        
        SELECT 'Tạo thời khóa biểu thành công' AS Message, TRUE AS Success;
    END IF;
END //

DELIMITER ;
```

### 7.28. Quản lý thời khóa biểu
```sql
DELIMITER //

CREATE PROCEDURE sp_QuanLy_TaoThoiKhoaBieu(
    IN p_maLopHoc VARCHAR(10),
    IN p_maPhong VARCHAR(10),
    IN p_ngayHoc DATE,
    IN p_gioBatDau TIME,
    IN p_gioKetThuc TIME,
    IN p_noiDung TEXT
)
BEGIN
    DECLARE v_lopExists INT;
    DECLARE v_phongExists INT;
    DECLARE v_conflict INT