import api from './api';
import axios from "axios";
import authHeader from "./auth-header";
import { API_URL } from "./api";

class UserService {
  // Student API calls
  getThongTinSinhVien() {
    return api.get('/sinhvien/thongtin');
  }

  getLichHocLop() {
    return api.get('/sinhvien/lichhoc');
  }

  getLichHocLopTheoTuan(tuan) {
    return api.get(`/sinhvien/lichhoc/${tuan}`);
  }

  getLichHocTheoLopVaTuan(maLop, tuan) {
    return api.get(`/sinhvien/thoikhoabieu/${maLop}/${tuan}`);
  }

  getDanhSachPhong() {
    return api.get('/sinhvien/danhsachphong');
  }

  yeuCauMuonPhong(yeuCauData) {
    return api.post('/sinhvien/muonphong', yeuCauData);
  }

  traPhongHoc(maYeuCau) {
    return api.put(`/sinhvien/traphong/${maYeuCau}`);
  }

  guiPhanHoi(phanHoiData) {
    return api.post('/sinhvien/phanhoi', phanHoiData);
  }

  getPhanHoi(maYeuCau) {
    return api.get(`/sinhvien/phanhoi/${maYeuCau}`);
  }

  async capNhatPhanHoi(phanHoiData) {
    try {
      if (phanHoiData.idPhanHoi) {
        const response = await api.put(`/sinhvien/phanhoi/${phanHoiData.idPhanHoi}`, phanHoiData);
        return response;
      } 
      else {
        throw new Error("Không có ID phản hồi hoặc mã yêu cầu để cập nhật");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật phản hồi:", error.response || error);
      throw error;
    }
  }

  getYeuCauMuonPhong() {
    return api.get('/sinhvien/yeucaumuonphong');
  }

  getLichSuMuonPhongDaTraAPI() {
    return api.get('/sinhvien/lichsu-datra');
  }

  guiThongBao(thongBaoData) {
    return api.post('/sinhvien/thongbao', thongBaoData);
  }

  getThongBaoNhan() {
    return api.get('/sinhvien/thongbao/nhan');
  }

  getThongBaoGui() {
    return api.get('/sinhvien/thongbao/gui');
  }

  getThongBaoDaGui() {
    return api.get('/thongbao/da-gui');
  }

  getNguoiNhanThongBao(id) {
    console.log(`Đang gọi API lấy danh sách người nhận cho thông báo ID: ${id}`);
    if (!id) {
      console.error("ID thông báo không được cung cấp");
      return Promise.reject("ID thông báo không hợp lệ");
    }
    return api.get(`/thongbao/da-gui/${id}/nguoi-nhan`)
      .then(response => {
        console.log(`Kết quả API /thongbao/da-gui/${id}/nguoi-nhan:`, response.data);
        return response;
      })
      .catch(error => {
        console.error(`Lỗi khi gọi API /thongbao/da-gui/${id}/nguoi-nhan:`, error.response || error);
        throw error;
      });
  }

  danhDauDaDoc(thongBaoId) {
    // Kiểm tra ID thông báo
    if (!thongBaoId) {
      console.error("Không thể đánh dấu đã đọc: ID thông báo không hợp lệ");
      return Promise.reject(new Error("ID thông báo không hợp lệ"));
    }
    console.log(`Đánh dấu đã đọc thông báo ID: ${thongBaoId}`);
    return api.put(`/sinhvien/thongbao/${thongBaoId}/daDoc`);
  }

  xoaThongBao(thongBaoId) {
    // Kiểm tra ID thông báo
    if (!thongBaoId) {
      console.error("Không thể xóa thông báo: ID thông báo không hợp lệ");
      return Promise.reject(new Error("ID thông báo không hợp lệ"));
    }
    console.log(`Xóa thông báo ID: ${thongBaoId}`);
    return api.delete(`/sinhvien/thongbao/${thongBaoId}`);
  }

  getDanhSachNguoiNhan() {
    console.log('Đang gọi API lấy danh sách người nhận');
    return api.get('/thongbao/nguoinhan')
      .then(response => {
        console.log('Kết quả API danh sách người nhận:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Lỗi khi lấy danh sách người nhận:', error);
        throw error;
      });
  }

  getDanhSachLop() {
    console.log('Đang gọi API lấy danh sách lớp');
    return api.get('/thongbao/lophoc')
      .then(response => {
        console.log('Kết quả API danh sách lớp:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Lỗi khi lấy danh sách lớp:', error);
        throw error;
      });
  }

  kiemTraDanhGia(danhSachMaYeuCau) {
    // Convert strings to integers if needed
    const integerIds = danhSachMaYeuCau.map(id => typeof id === 'string' ? parseInt(id) : id);
    return api.post("/sinhvien/kiemtra-danhgia", { danhSachMaYeuCau: integerIds });
  }

  // Kiểm tra đánh giá cho giảng viên
  kiemTraDanhGiaGV(danhSachMaYeuCau) {
    // Convert strings to integers if needed
    const integerIds = danhSachMaYeuCau.map(id => typeof id === 'string' ? parseInt(id) : id);
    return api.post("/giangvien/kiemtra-danhgia", { danhSachMaYeuCau: integerIds });
  }

  // Submit or update feedback
  handlePhanHoiSubmit(phanHoiData, isEditing = false) {
    if (isEditing) {
      return this.capNhatPhanHoi(phanHoiData);
    } else {
      return this.guiPhanHoi(phanHoiData);
    }
  }

  // Báo cáo sự cố
  baoSuCo(suCoData) {
    return api.post('/sinhvien/baosuco', suCoData);
  }

  // Chi tiết yêu cầu mượn phòng
  getChiTietYeuCau(maYeuCau) {
    return api.get(`/sinhvien/yeucau/${maYeuCau}`);
  }

  // Giảng viên API calls
  getThongTinGiangVien() {
    return api.get('/giangvien/thongtin');
  }

  getLichDayGiangVien(tuan) {
    return api.get(`/giangvien/lichhoc/${tuan}`)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  getLichDayGiangVienAll() {
    return api.get(`/giangvien/lichhoc`)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  getDanhSachSinhVienLop(maLop) {
    return api.get(`/giangvien/danhsachsinhvien/${maLop}`)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  // API mượn phòng cho giảng viên
  getDanhSachPhongGV() {
    return api.get('/giangvien/danhsachphong');
  }
  
  yeuCauMuonPhongGV(yeuCauData) {
    return api.post('/giangvien/muonphong', yeuCauData);
  }
  
  traPhongHocGV(maYeuCau) {
    return api.put(`/giangvien/traphong/${maYeuCau}`);
  }
  
  getYeuCauMuonPhongGV() {
    return api.get('/giangvien/yeucaumuonphong');
  }
  
  getLichSuMuonPhongGV() {
    return api.get('/giangvien/lichsumuon');
  }
  
  guiPhanHoiGV(phanHoiData) {
    return api.post('/giangvien/phanhoi', phanHoiData);
  }
  
  getChiTietYeuCauGV(maYeuCau) {
    return api.get(`/giangvien/yeucau/${maYeuCau}`);
  }
  
  baoSuCoGV(suCoData) {
    return api.post('/giangvien/baosuco', suCoData);
  }
  
  // API thông báo cho giảng viên
  guiThongBaoGV(thongBaoData) {
    return api.post('/giangvien/thongbao', thongBaoData);
  }
  
  getThongBaoNhanGV() {
    return api.get('/giangvien/thongbao/nhan');
  }
  
  getThongBaoGuiGV() {
    return api.get('/giangvien/thongbao/gui');
  }
  
  danhDauDaDocGV(thongBaoId) {
    if (!thongBaoId) {
      console.error("Không thể đánh dấu đã đọc: ID thông báo không hợp lệ");
      return Promise.reject(new Error("ID thông báo không hợp lệ"));
    }
    return api.put(`/giangvien/thongbao/${thongBaoId}/daDoc`);
  }
  
  xoaThongBaoGV(thongBaoId) {
    // Kiểm tra ID thông báo
    if (!thongBaoId) {
      console.error("Không thể xóa thông báo: ID thông báo không hợp lệ");
      return Promise.reject(new Error("ID thông báo không hợp lệ"));
    }
    console.log(`Xóa thông báo giảng viên ID: ${thongBaoId}`);
    return api.delete(`/giangvien/thongbao/${thongBaoId}`);
  }

  getDanhSachNguoiNhanGV() {
    console.log('Đang gọi API lấy danh sách người nhận GV');
    return api.get('/giangvien/thongbao/nguoinhan')
      .then(response => {
        console.log('Kết quả API danh sách người nhận GV:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Lỗi khi lấy danh sách người nhận GV:', error);
        throw error;
      });
  }

  // Lấy danh sách lớp học cho giảng viên
  getDanhSachLopHocGV() {
    console.log('Đang gọi API lấy danh sách lớp học GV');
    return api.get('/giangvien/danhsachlop')
      .then(response => {
        console.log('Kết quả API danh sách lớp học GV:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Lỗi khi lấy danh sách lớp học GV:', error);
        throw error;
      });
  }

  // Lấy phản hồi của giảng viên
  getPhanHoiGV(maYeuCau) {
    return api.get(`/giangvien/phanhoi/${maYeuCau}`);
  }

  capNhatPhanHoiGV(phanHoiData) {
    console.log("Đang gọi API cập nhật phản hồi GV với dữ liệu:", phanHoiData);
    return api.put('/giangvien/phanhoi', phanHoiData)
      .then(response => {
        console.log("Kết quả cập nhật phản hồi GV:", response.data);
        return response;
      })
      .catch(error => {
        console.error("Lỗi khi cập nhật phản hồi GV:", error.response || error);
        throw error;
      });
  }

  handlePhanHoiSubmitGV(phanHoiData, isEditing = false) {
    if (isEditing) {
      return this.capNhatPhanHoiGV(phanHoiData);
    } else {
      return this.guiPhanHoiGV(phanHoiData);
    }
  }

  // Admin API calls
  choMuonPhong(maYeuCau) {
    return api.put(`/quanly/yeucau/chomuon/${maYeuCau}`);
  }

  // Quản lý sự cố
  getAllSuCo() {
    return api.get('/quanly/suco');
  }

  getSuCoByTrangThai(trangThai) {
    return api.get(`/quanly/suco/trangthai/${trangThai}`);
  }

  updateTrangThaiSuCo(id, trangThai) {
    return api.put(`/quanly/suco/${id}/trangthai?trangThai=${trangThai}`);
  }

  getThongKeSuCo() {
    return api.get('/quanly/suco/thongke');
  }

  huyYeuCauMuonPhong(maYeuCau) {
    return api.delete(`/yeucaumuon/huy/${maYeuCau}`);
  }

  kiemTraDaBaoSuCo(maYeuCau) {
    return api.get(`/suco/kiemtra/${maYeuCau}`);
  }
  timPhongTrong(thoiGianMuon, thoiGianTra, soChoDat, loaiPhong) {
    const user = JSON.parse(localStorage.getItem("user"));
    const idTaiKhoan = user ? user.id : null;
    const params = {
      thoiGianMuon,
      thoiGianTra,
      soChoDat,
      loaiPhong,
      idTaiKhoan // Send account ID to the API
    };
    return api.get('/yeucaumuon/phongtrong', { params });
  }

  requestReschedule(params) {
    return api.put('/giangvien/doilichday', params);
  }

  // Quản lý - Lấy tất cả lịch sử mượn phòng
  getAllLichSuMuonPhong() {
    return api.get('/quanly/lichsumuon/tatca');
  }
  
  // Quản lý - Thống kê trả phòng đúng hạn/trễ hạn
  getThongKeTraPhong(tuNgay, denNgay) {
    let url = '/quanly/lichsumuon/thongke';
    const params = [];
    
    if (tuNgay) {
      params.push(`tuNgay=${tuNgay}`);
    }
    
    if (denNgay) {
      params.push(`denNgay=${denNgay}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return api.get(url);
  }

  // API thống kê tần suất sử dụng phòng
  getThongKeTanSuatPhong(loaiThongKe, tuNgay, denNgay) {
    // Tạo URL với tham số lọc (sử dụng API hoạt động)
    let url = '/quanly/phong/thongke';
    
    console.log(`Gọi API thống kê tần suất sử dụng phòng: ${url}`);
    
    return api.get(url)
      .then(response => {
        console.log('Dữ liệu thống kê từ API:', response.data);
        
        // Chuyển đổi dữ liệu từ API phong/thongke sang định dạng cần thiết
        const danhSachPhong = response.data.map(p => p.maPhong);
        const thongKeTheoPhong = {};
        response.data.forEach(phong => {
          thongKeTheoPhong[phong.maPhong] = phong.approvedBookings || 0;
        });
        
        // Lấy số yêu cầu đã duyệt làm cơ sở
        const thongKeTheoThoiGian = [];
        const timeLabels = [];
        
        // Tạo dữ liệu kết quả
        const transformedData = {
          thongKeTheoPhong: thongKeTheoPhong,
          thongKeTheoThoiGian: [],
          danhSachPhong: danhSachPhong,
          nhanThoiGian: [],
          loaiThongKe: loaiThongKe || 'TUAN',
          isLimitedData: true // Đánh dấu rằng đây là dữ liệu hạn chế
        };
        
        return { data: transformedData };
      })
      .catch(error => {
        console.error('Lỗi khi lấy thống kê tần suất phòng:', error);
        console.error('Chi tiết lỗi:', error.response ? error.response.data : error.message);
        
        // Tạo dữ liệu trống nếu có lỗi
        return { 
          data: {
            thongKeTheoPhong: {},
            thongKeTheoThoiGian: [],
            danhSachPhong: [],
            nhanThoiGian: [],
            loaiThongKe: loaiThongKe || 'TUAN',
            isLimitedData: true,
            error: true
          } 
        };
      });
  }

  // Kiểm tra và lấy vai trò sinh viên
  checkIsCanBoLop() {
    return api.get('/sinhvien/check-vaitro', { headers: authHeader() });
  }

  // Phân công mượn phòng API
  layDanhSachPhanCongCuaCanBo() {
    console.log("Gọi API lấy danh sách phân công của cán bộ");
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Nếu không phải sinh viên, không gọi API này
    if (user && user.roles && !user.roles.includes("ROLE_SV")) {
      console.log("User không phải sinh viên, không gọi API phân công");
      return Promise.resolve({ data: [] });
    }
    
    return api.get("/phancong/canbo", { headers: authHeader() })
      .catch(error => {
        // Nếu lỗi 403 (forbidden) thì có thể người dùng không phải cán bộ lớp
        if (error.response && error.response.status === 403) {
          console.log("User không có quyền xem phân công (không phải cán bộ lớp)");
          return { data: [] }; // Trả về mảng rỗng
        }
        // Nếu lỗi khác, ném lỗi để xử lý ở component
        throw error;
      });
  }

  layDanhSachPhanCongChoSinhVien() {
    console.log("Gọi API lấy danh sách phân công cho sinh viên");
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Nếu không phải sinh viên, không gọi API này
    if (user && user.roles && !user.roles.includes("ROLE_SV")) {
      console.log("User không phải sinh viên, không gọi API phân công cho sinh viên");
      return Promise.resolve({ data: [] });
    }
    
    return api.get("/phancong/sinhvien", { headers: authHeader() })
      .catch(error => {
        // Xử lý lỗi, trả về mảng rỗng cho trường hợp lỗi permission
        if (error.response && (error.response.status === 403 || error.response.status === 401)) {
          console.log("User không có quyền xem phân công cho sinh viên hoặc token đã hết hạn");
          return { data: [] }; // Trả về mảng rỗng
        }
        // Nếu lỗi khác, ném lỗi để xử lý ở component
        throw error;
      });
  }

  // Lấy tất cả danh sách phân công (bất kể vai trò)
  layTatCaDanhSachPhanCong() {
    console.log("Gọi API lấy tất cả danh sách phân công");
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Nếu không phải sinh viên, không gọi API này
    if (user && user.roles && !user.roles.includes("ROLE_SV")) {
      console.log("User không phải sinh viên, không thể lấy danh sách phân công");
      return Promise.resolve({ data: [] });
    }
    
    // Gọi cả hai API để lấy toàn bộ danh sách phân công
    return Promise.all([
      this.layDanhSachPhanCongChoSinhVien().catch(() => ({ data: [] })),
      // Thử gọi API cán bộ (ngay cả khi không phải cán bộ)
      api.get("/phancong/tatca", { headers: authHeader() }).catch(() => ({ data: [] }))
    ]).then(([phanCongChoSinhVien, tatCaPhanCong]) => {
      // Kết hợp kết quả từ cả hai API
      const allAssignments = [...phanCongChoSinhVien.data, ...tatCaPhanCong.data];
      
      // Loại bỏ các phân công trùng lặp (nếu có)
      const uniqueAssignments = allAssignments.filter((item, index, self) =>
        index === self.findIndex((t) => t.maPhanCong === item.maPhanCong)
      );
      
      return { data: uniqueAssignments };
    });
  }

  taoPhanCong(maSVNguoiDuocPhanCong, maTKB, ghiChu) {
    console.log("Gọi API tạo phân công");
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Nếu không phải sinh viên, không gọi API này
    if (user && user.roles && !user.roles.includes("ROLE_SV")) {
      console.log("User không phải sinh viên, không thể tạo phân công");
      return Promise.reject(new Error("Bạn không có quyền tạo phân công"));
    }
    
    return api.post(
      "/phancong", 
      { 
        maSVNguoiDuocPhanCong, 
        maTKB, 
        ghiChu 
      }, 
      { headers: authHeader() }
    ).catch(error => {
      // Log lỗi để debug
      console.error("Lỗi khi tạo phân công:", error.response?.data || error.message);
      throw error;
    });
  }

  huyPhanCong(maPhanCong) {
    console.log("Gọi API hủy phân công:", maPhanCong);
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Nếu không phải sinh viên, không gọi API này
    if (user && user.roles && !user.roles.includes("ROLE_SV")) {
      console.log("User không phải sinh viên, không thể hủy phân công");
      return Promise.reject(new Error("Bạn không có quyền hủy phân công"));
    }
    
    return api.delete(`/phancong/${maPhanCong}`, { headers: authHeader() })
      .catch(error => {
        // Log lỗi để debug
        console.error("Lỗi khi hủy phân công:", error.response?.data || error.message);
        throw error;
      });
  }

  capNhatTrangThaiPhanCong(maPhanCong, trangThai) {
    console.log("Gọi API cập nhật trạng thái phân công:", maPhanCong, trangThai);
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Nếu không phải sinh viên, không gọi API này
    if (user && user.roles && !user.roles.includes("ROLE_SV")) {
      console.log("User không phải sinh viên, không thể cập nhật trạng thái phân công");
      return Promise.reject(new Error("Bạn không có quyền cập nhật trạng thái phân công"));
    }
    
    return api.put(
      `/phancong/${maPhanCong}/trangthai?trangThai=${trangThai}`, 
      {}, 
      { headers: authHeader() }
    ).catch(error => {
      // Log lỗi để debug
      console.error("Lỗi khi cập nhật trạng thái phân công:", error.response?.data || error.message);
      throw error;
    });
  }

  // API cho phân công mượn phòng
  getDanhSachSinhVienLop() {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Current user in getDanhSachSinhVienLop:", user ? { 
      id: user.id, 
      username: user.username,
      roles: user.roles,
      hasToken: !!user.token 
    } : "No user found");
    
    const headers = authHeader();
    console.log("Auth headers:", headers);

    // Giảng viên sẽ sử dụng API của giảng viên, sinh viên sẽ sử dụng API của sinh viên
    if (user && user.roles && user.roles.includes("ROLE_GV")) {
      // Nếu không có lớp cụ thể, lấy tất cả sinh viên của lớp đầu tiên mà giảng viên dạy
      return this.getDanhSachLopHocGV()
        .then(response => {
          if (response.data && response.data.length > 0) {
            return this.getDanhSachSinhVienLop(response.data[0].maLop);
          }
          return { data: [] };
        });
    } else {
      // Sinh viên chỉ có thể xem sinh viên trong lớp của mình
      return api.get("/sinhvien/danhsach-lop", { headers: headers });
    }
  }

  // Lấy thời khóa biểu của lớp hiện tại (cho form phân công)
  getLichHocChoThoiKhoaBieu() {
    const headers = authHeader();
    console.log("Auth headers in getLichHocChoThoiKhoaBieu:", headers);
    return api.get('/thoikhoabieu/lop', { headers: headers });
  }
}

export default new UserService(); 