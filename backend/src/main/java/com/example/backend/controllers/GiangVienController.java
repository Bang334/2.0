package com.example.backend.controllers;

import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.Arrays;
import java.util.Calendar;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.GiangVien;
import com.example.backend.model.LichSuMuonPhong;
import com.example.backend.model.LopHoc;
import com.example.backend.model.NguoiDung;
import com.example.backend.model.PhanHoi;
import com.example.backend.model.Phong;
import com.example.backend.model.SinhVien;
import com.example.backend.model.ThoiKhoaBieu;
import com.example.backend.model.YeuCauMuonPhong;
import com.example.backend.model.YeuCauMuonPhong.TrangThai;
import com.example.backend.model.ThongBaoGui;
import com.example.backend.model.ThongBaoNhan;
import com.example.backend.payload.request.DoiLichDayRequest;
import com.example.backend.payload.request.PhanHoiRequest;
import com.example.backend.payload.request.YeuCauMuonPhongRequest;
import com.example.backend.payload.request.ThongBaoRequest;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.repository.GiangVienRepository;
import com.example.backend.repository.LichSuMuonPhongRepository;
import com.example.backend.repository.LopHocRepository;
import com.example.backend.repository.NguoiDungRepository;
import com.example.backend.repository.PhanHoiRepository;
import com.example.backend.repository.PhongRepository;
import com.example.backend.repository.SinhVienRepository;
import com.example.backend.repository.ThoiKhoaBieuRepository;
import com.example.backend.repository.YeuCauMuonPhongRepository;
import com.example.backend.repository.ThongBaoGuiRepository;
import com.example.backend.repository.ThongBaoNhanRepository;
import com.example.backend.service.ThongBaoService;
import com.example.backend.service.UserDetailsImpl;
import com.example.backend.model.SuCo;
import com.example.backend.repository.SuCoRepository;
import com.example.backend.exception.ResourceNotFoundException;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/giangvien")
public class GiangVienController {
    
    @Autowired
    private GiangVienRepository giangVienRepository;
    
    @Autowired
    private NguoiDungRepository nguoiDungRepository;
    
    @Autowired
    private ThoiKhoaBieuRepository thoiKhoaBieuRepository;
    
    @Autowired
    private LopHocRepository lopHocRepository;
    
    @Autowired
    private SinhVienRepository sinhVienRepository;
    
    @Autowired
    private LichSuMuonPhongRepository lichSuMuonPhongRepository;
    
    @Autowired
    private PhongRepository phongRepository;
    
    @Autowired
    private YeuCauMuonPhongRepository yeuCauMuonPhongRepository;
    
    @Autowired
    private PhanHoiRepository phanHoiRepository;
    
    @Autowired
    private ThongBaoGuiRepository thongBaoGuiRepository;
    
    @Autowired
    private ThongBaoNhanRepository thongBaoNhanRepository;
    
    @Autowired
    private SuCoRepository suCoRepository;
    
    @Autowired
    private ThongBaoService thongBaoService;
    
    // Helper method to get current authenticated lecturer
    private GiangVien getCurrentGiangVien() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String userId = userDetails.getId();
        
        Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findByTaiKhoanId(userId);
        if (nguoiDungOpt.isPresent()) {
            NguoiDung nguoiDung = nguoiDungOpt.get();
            return giangVienRepository.findByNguoiDungIdNguoiDung(nguoiDung.getIdNguoiDung()).orElse(null);
        }
        return null;
    }
    
    // 1. Xem thông tin cá nhân
    @GetMapping("/thongtin")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> getThongTinGiangVien() {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        Map<String, Object> thongTin = new HashMap<>();
        thongTin.put("maGV", giangVien.getMaGV());
        thongTin.put("hoTen", giangVien.getNguoiDung().getHoTen());
        thongTin.put("email", giangVien.getNguoiDung().getEmail());
        thongTin.put("lienHe", giangVien.getNguoiDung().getLienHe());
        thongTin.put("gioiTinh", giangVien.getNguoiDung().getGioiTinh());
        thongTin.put("khoa", giangVien.getKhoa());
        thongTin.put("avatarURL", giangVien.getNguoiDung().getAvatarURL());
        return ResponseEntity.ok(thongTin);
    }
    
    // 2. Xem lịch dạy của giảng viên
    @GetMapping("/lichhoc")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> getLichDayGiangVien() {
        try {
            GiangVien giangVien = getCurrentGiangVien();
            if (giangVien == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
            }
            
            List<ThoiKhoaBieu> lichDay = thoiKhoaBieuRepository.findByGiangVienMaGV(giangVien.getMaGV());
            
            return ResponseEntity.ok(lichDay);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Lỗi khi lấy lịch dạy: " + e.getMessage()));
        }
    }
    
    // 2.1 Xem lịch dạy của giảng viên theo tuần
    @GetMapping("/lichhoc/{tuan}")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> getLichDayGiangVienTheoTuan(@PathVariable Integer tuan) {
        try {
            GiangVien giangVien = getCurrentGiangVien();
            if (giangVien == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
            }
            
            // Kiểm tra hợp lệ của tham số tuần
            if (tuan < 1 || tuan > 52) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Tuần không hợp lệ. Vui lòng chọn từ tuần 1-52."));
            }
            
            // Sử dụng phương thức repository mới để lấy lịch dạy theo giảng viên và tuần
            List<ThoiKhoaBieu> lichDayTheoTuan = thoiKhoaBieuRepository.findByGiangVienMaGVAndTuan(giangVien.getMaGV(), tuan);
            
            return ResponseEntity.ok(lichDayTheoTuan);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Lỗi khi lấy lịch dạy theo tuần: " + e.getMessage()));
        }
    }
    
    // 3. Xem danh sách sinh viên của một lớp
    @GetMapping("/danhsachsinhvien/{maLop}")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> getDanhSachSinhVienLop(@PathVariable String maLop) {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        // Kiểm tra xem giảng viên có dạy lớp này không
        List<ThoiKhoaBieu> lichDay = thoiKhoaBieuRepository.findByGiangVienMaGV(giangVien.getMaGV());
        boolean dayLop = lichDay.stream()
            .anyMatch(tkb -> tkb.getLopHoc().getMaLop().equals(maLop));
        
        if (!dayLop) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new MessageResponse("Bạn không có quyền xem danh sách sinh viên của lớp này"));
        }
        
        Optional<LopHoc> lopHocOpt = lopHocRepository.findById(maLop);
        if (!lopHocOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy lớp học"));
        }
        
        List<SinhVien> danhSachSinhVien = sinhVienRepository.findByLopHocMaLop(maLop);
        
        List<Map<String, Object>> result = danhSachSinhVien.stream()
            .map(sv -> {
                Map<String, Object> sinhVienInfo = new HashMap<>();
                sinhVienInfo.put("maSV", sv.getMaSV());
                sinhVienInfo.put("hoTen", sv.getNguoiDung().getHoTen());
                sinhVienInfo.put("email", sv.getNguoiDung().getEmail());
                sinhVienInfo.put("lienHe", sv.getNguoiDung().getLienHe());
                sinhVienInfo.put("gioiTinh", sv.getNguoiDung().getGioiTinh());
                return sinhVienInfo;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
    
    // 4. Lấy danh sách phòng học
    @GetMapping("/danhsachphong")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> getDanhSachPhong() {
        List<Phong> danhSachPhong = phongRepository.findByTrangThaiIn(
            Arrays.asList(Phong.TrangThai.TRONG, Phong.TrangThai.DANGSUDUNG)
        );
        return ResponseEntity.ok(danhSachPhong);
    }
    
    // 5. Yêu cầu mượn phòng học
    @PostMapping("/muonphong")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> yeuCauMuonPhong(@RequestBody YeuCauMuonPhongRequest yeuCauRequest) {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        List<YeuCauMuonPhong> yeuCauHienTai = yeuCauMuonPhongRepository.findByNguoiMuonAndTrangThaiInOrderByThoiGianMuonDesc(
            giangVien.getNguoiDung(),
            Arrays.asList(YeuCauMuonPhong.TrangThai.DADUYET, YeuCauMuonPhong.TrangThai.DANGXULY)
        );

        int coYeuCauChuaCoLichSu = 0;
        for (YeuCauMuonPhong yeuCau : yeuCauHienTai) {
            List<LichSuMuonPhong> lichSu = lichSuMuonPhongRepository.findByYeuCauMuonPhong(yeuCau);
            if (lichSu.isEmpty()) {
                coYeuCauChuaCoLichSu++;
            }
        }
        if (coYeuCauChuaCoLichSu >= 3) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse("Bạn đã có 3 yêu cầu mượn phòng đang chờ xử lý hoặc đã được duyệt mà chưa có lịch sử mượn. Vui lòng đợi cho đến khi các yêu cầu này được xử lý xong."));
        }
        Optional<Phong> phongOpt = phongRepository.findById(yeuCauRequest.getMaPhong());
        if (!phongOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy phòng học"));
        }
        
        // Kiểm tra ngày mượn và ngày trả có hợp lệ không
        if (yeuCauRequest.getThoiGianMuon() == null || yeuCauRequest.getThoiGianTra() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse("Thời gian mượn và trả không được để trống"));
        }
        
        if (yeuCauRequest.getThoiGianMuon().after(yeuCauRequest.getThoiGianTra())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse("Thời gian mượn phải trước thời gian trả"));
        }
        
        // Kiểm tra xung đột với thời khóa biểu của các lớp học
        Date ngayMuon = yeuCauRequest.getThoiGianMuon();
        Date ngayTra = yeuCauRequest.getThoiGianTra();
        Phong phong = phongOpt.get();
        
        // Lấy tất cả thời khóa biểu của phòng
        List<ThoiKhoaBieu> dsThoiKhoaBieu = thoiKhoaBieuRepository.findByPhongMaPhong(phong.getMaPhong());
        
        // Lọc các thời khóa biểu có ngày học trùng với ngày mượn
        for (ThoiKhoaBieu tkb : dsThoiKhoaBieu) {
            // So sánh ngày (không tính giờ)
            Calendar calTKB = Calendar.getInstance();
            calTKB.setTime(tkb.getNgayHoc());
            
            Calendar calMuon = Calendar.getInstance();
            calMuon.setTime(ngayMuon);
            
            Calendar calTra = Calendar.getInstance();
            calTra.setTime(ngayTra);
            
            // Kiểm tra nếu ngày mượn hoặc ngày trả trùng với ngày học trong thời khóa biểu
            boolean trungNgay = calTKB.get(Calendar.YEAR) == calMuon.get(Calendar.YEAR) &&
                               calTKB.get(Calendar.DAY_OF_YEAR) == calMuon.get(Calendar.DAY_OF_YEAR) ||
                               calTKB.get(Calendar.YEAR) == calTra.get(Calendar.YEAR) &&
                               calTKB.get(Calendar.DAY_OF_YEAR) == calTra.get(Calendar.DAY_OF_YEAR);
            
            if (trungNgay) {
                // Chuyển đổi thời gian mượn và trả sang tiết học để so sánh
                int tietMuon = chuyenThoiGianSangTiet(ngayMuon);
                int tietTra = chuyenThoiGianSangTiet(ngayTra);
                
                // Nếu có sự trùng lặp giữa tiết học của thời khóa biểu và thời gian mượn
                if ((tietMuon <= tkb.getTietKetThuc() && tietTra >= tkb.getTietBatDau())) {
                    // Kiểm tra nếu giảng viên trong thời khóa biểu là chính giảng viên đang đăng ký
                    // thì cho phép mượn phòng (không báo lỗi xung đột)
                    if (tkb.getGiangVien() != null && 
                        tkb.getGiangVien().getMaGV().equals(giangVien.getMaGV())) {
                        // Đây là lịch dạy của chính giảng viên này, cho phép mượn phòng
                        continue;
                    }
                    
                    String thongBao;
                    if (tkb.getLopHoc() != null) {
                        thongBao = String.format("Phòng %s đã có lịch học của lớp %s, môn %s từ tiết %d đến tiết %d vào ngày %s",
                            phong.getMaPhong(),
                            tkb.getLopHoc().getMaLop(),
                            tkb.getMonHoc().getTenMon(),
                            tkb.getTietBatDau(),
                            tkb.getTietKetThuc(),
                            tkb.getNgayHoc().toString()
                        );
                    } else {
                        thongBao = String.format("Phòng %s đã có lịch dạy của giảng viên %s, môn %s từ tiết %d đến tiết %d vào ngày %s",
                            phong.getMaPhong(),
                            tkb.getGiangVien().getNguoiDung().getHoTen(),
                            tkb.getMonHoc().getTenMon(),
                            tkb.getTietBatDau(),
                            tkb.getTietKetThuc(),
                            tkb.getNgayHoc().toString()
                        );
                    }
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new MessageResponse(thongBao));
                }
            }
        }
        
        // Kiểm tra xung đột với các yêu cầu đã tồn tại của người mượn
        List<YeuCauMuonPhong> trungLichNguoiMuon = yeuCauMuonPhongRepository.kiemTraTrungLichNguoiMuon(
            giangVien.getNguoiDung().getIdNguoiDung(),
            yeuCauRequest.getThoiGianMuon(),
            yeuCauRequest.getThoiGianTra()
        );
        
        if (!trungLichNguoiMuon.isEmpty()) {
            YeuCauMuonPhong yeuCauTrung = trungLichNguoiMuon.get(0);
            String thongBao = String.format("Bạn đã đăng ký mượn phòng %s từ %s đến %s",
                yeuCauTrung.getPhong().getMaPhong(),
                yeuCauTrung.getThoiGianMuon(),
                yeuCauTrung.getThoiGianTra()
            );
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new MessageResponse(thongBao));
        }
        
        YeuCauMuonPhong yeuCau = new YeuCauMuonPhong();
        yeuCau.setNguoiMuon(giangVien.getNguoiDung());
        yeuCau.setPhong(phongOpt.get());
        yeuCau.setThoiGianMuon(yeuCauRequest.getThoiGianMuon());
        yeuCau.setThoiGianTra(yeuCauRequest.getThoiGianTra());
        yeuCau.setMucDich(yeuCauRequest.getMucDich());
        yeuCau.setLyDo(yeuCauRequest.getLyDo());
        yeuCau.setTrangThai(YeuCauMuonPhong.TrangThai.DANGXULY);
        
        yeuCauMuonPhongRepository.save(yeuCau);
        
        return ResponseEntity.ok(new MessageResponse("Đã gửi yêu cầu mượn phòng thành công"));
    }
    private int chuyenThoiGianSangTiet(Date thoiGian) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(thoiGian);
        int gio = cal.get(Calendar.HOUR_OF_DAY);
        int phut = cal.get(Calendar.MINUTE);
    
        int minutesSince7AM = (gio - 7) * 60 + phut;
    
        if (minutesSince7AM < 0) return 0; // Trước 7:00 -> Không có tiết
        if (minutesSince7AM < 45) return 1; // 7:00 - 7:44 -> Tiết 1
        if (minutesSince7AM < 90) return 2; // 7:45 - 8:29 -> Tiết 2
        if (minutesSince7AM < 135) return 3; // 8:30 - 9:14 -> Tiết 3
        if (minutesSince7AM < 180) return 4; // 9:15 - 9:59 -> Tiết 4
        if (minutesSince7AM < 225) return 5; // 10:00 - 10:44 -> Tiết 5
        if (minutesSince7AM < 270) return 6; // 10:45 - 11:29 -> Tiết 6
        if (minutesSince7AM < 315) return 7; // 11:30 - 12:14 -> Tiết 7
        if (minutesSince7AM < 360) return 8; // 12:15 - 12:59 -> Tiết 8
        if (minutesSince7AM < 405) return 9; // 13:00 - 13:44 -> Tiết 9
        if (minutesSince7AM < 450) return 10; // 13:45 - 14:29 -> Tiết 10
        if (minutesSince7AM < 495) return 11; // 14:30 - 15:14 -> Tiết 11
        if (minutesSince7AM < 540) return 12; // 15:15 - 15:59 -> Tiết 12
        if (minutesSince7AM < 585) return 13; // 16:00 - 16:44 -> Tiết 13
        if (minutesSince7AM < 630) return 14; // 16:45 - 17:29 -> Tiết 14
        return 0; // Sau 14:30 -> Không có tiết
    }
    // 6. Trả phòng học
    @PutMapping("/traphong/{maYeuCau}")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> traPhongHoc(@PathVariable Integer maYeuCau) {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        Optional<YeuCauMuonPhong> yeuCauOpt = yeuCauMuonPhongRepository.findById(maYeuCau);
        if (!yeuCauOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy yêu cầu mượn phòng"));
        }
        
        YeuCauMuonPhong yeuCau = yeuCauOpt.get();
        
        // Kiểm tra xem yêu cầu có phải của giảng viên này không
        if (!yeuCau.getNguoiMuon().getIdNguoiDung().equals(giangVien.getNguoiDung().getIdNguoiDung())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new MessageResponse("Bạn không có quyền trả phòng này"));
        }
        
        // Lấy bản sao thời gian trả dự kiến trước khi cập nhật
        Date thoiGianTra = yeuCau.getThoiGianTra();
        
        // Thời gian trả phòng thực tế (hiện tại)
        Date thoiGianTraThucTe = new Date();
        
        // Cập nhật thời gian trả trong yêu cầu mượn phòng
        yeuCau.setThoiGianTra(thoiGianTraThucTe);
        yeuCauMuonPhongRepository.save(yeuCau);
        
        // Cập nhật trạng thái phòng thành TRONG
        Phong phong = yeuCau.getPhong();
        phong.setTrangThai(Phong.TrangThai.TRONG);
        phongRepository.save(phong);
        
        // Kiểm tra xem đã có bản ghi lịch sử chưa
        List<LichSuMuonPhong> lichSuList = lichSuMuonPhongRepository.findByYeuCauMuonPhongMaYeuCau(maYeuCau);
        LichSuMuonPhong lichSu;
        
        if (lichSuList.isEmpty()) {
            // Tạo mới bản ghi lịch sử mượn phòng
            lichSu = new LichSuMuonPhong();
            lichSu.setYeuCauMuonPhong(yeuCau);
            lichSu.setThoiGianMuon(yeuCau.getThoiGianMuon());
        } else {
            // Sử dụng bản ghi có sẵn
            lichSu = lichSuList.get(0);
        }
        
        // Cập nhật thời gian trả thực tế
        lichSu.setThoiGianTraThucTe(thoiGianTraThucTe);
        
        // Xác định trạng thái trả: Đúng hạn hay Trễ hạn
        if (thoiGianTraThucTe.after(thoiGianTra)) {
            lichSu.setTrangThaiTra(LichSuMuonPhong.TrangThaiTra.TreHan);
        } else {
            lichSu.setTrangThaiTra(LichSuMuonPhong.TrangThaiTra.DungHan);
        }
        
        // Lưu bản ghi lịch sử
        lichSuMuonPhongRepository.save(lichSu);
        
        return ResponseEntity.ok(new MessageResponse("Đã trả phòng thành công"));
    }
    
    // 7. Xem danh sách yêu cầu mượn phòng
    @GetMapping("/yeucaumuonphong")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> getYeuCauMuonPhong() {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        List<YeuCauMuonPhong> yeuCauList = 
            yeuCauMuonPhongRepository.findByNguoiMuonIdNguoiDung(giangVien.getNguoiDung().getIdNguoiDung());
        List<Map<String, Object>> result = new ArrayList<>();
    
        for (YeuCauMuonPhong yeuCau : yeuCauList) {
            Map<String, Object> yeuCauMap = new HashMap<>();
            
            // Thêm các thuộc tính từ yêu cầu mượn phòng
            yeuCauMap.put("maYeuCau", yeuCau.getMaYeuCau());
            yeuCauMap.put("phong", yeuCau.getPhong());
            yeuCauMap.put("thoiGianMuon", yeuCau.getThoiGianMuon());
            yeuCauMap.put("thoiGianTra", yeuCau.getThoiGianTra());
            yeuCauMap.put("mucDich", yeuCau.getMucDich());
            yeuCauMap.put("trangThai", yeuCau.getTrangThai().toString());
            yeuCauMap.put("nguoiMuon", yeuCau.getNguoiMuon());
            yeuCauMap.put("lyDo",yeuCau.getLyDo());
            yeuCauMap.put("nguoiDuyet", yeuCau.getNguoiDuyet());
            // Thêm trường daMuon để kiểm tra xem đã có bản ghi trong bảng LichSuMuonPhong hay chưa
            List<LichSuMuonPhong> lichSu = lichSuMuonPhongRepository.findByYeuCauMuonPhong(yeuCau);
            yeuCauMap.put("daMuon", !lichSu.isEmpty());
            
            result.add(yeuCauMap);
        }
        
        return ResponseEntity.ok(result);
    }
    
    // 8. Xem lịch sử mượn phòng
    @GetMapping("/lichsumuon")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> getLichSuMuonPhong() {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        // Lấy tất cả yêu cầu mượn phòng đã duyệt
        List<YeuCauMuonPhong> yeuCauList = 
            yeuCauMuonPhongRepository.findByNguoiMuonIdNguoiDung(giangVien.getNguoiDung().getIdNguoiDung());
        
        // Lấy tất cả mã yêu cầu
        List<Integer> maYeuCauList = yeuCauList.stream()
            .map(YeuCauMuonPhong::getMaYeuCau)
            .collect(Collectors.toList());
        
        // Lấy tất cả bản ghi lịch sử mượn phòng
        List<LichSuMuonPhong> lichSuList = new ArrayList<>();
        
        // Lấy tất cả bản ghi lịch sử liên quan đến các yêu cầu của giảng viên này
        List<LichSuMuonPhong> allLichSu = lichSuMuonPhongRepository.findAll();
        lichSuList = allLichSu.stream()
            .filter(ls -> {
                // Chỉ giữ lại các bản ghi có liên quan đến yêu cầu của giảng viên này
                return ls.getYeuCauMuonPhong() != null && 
                       maYeuCauList.contains(ls.getYeuCauMuonPhong().getMaYeuCau());
            })
            .collect(Collectors.toList());
        
        // Chuyển đổi dữ liệu LichSuMuonPhong thành định dạng dễ sử dụng ở frontend
        List<Map<String, Object>> result = lichSuList.stream()
            .map(ls -> {
                Map<String, Object> map = new HashMap<>();
                map.put("maLichSu", ls.getMaLichSu());
                map.put("maYeuCau", ls.getYeuCauMuonPhong().getMaYeuCau());
                map.put("maPhong", ls.getYeuCauMuonPhong().getPhong().getMaPhong());
                map.put("thoiGianMuon", ls.getThoiGianMuon());
                map.put("thoiGianTra", ls.getThoiGianTraThucTe());
                map.put("trangThaiTra", ls.getTrangThaiTra().toString());
                return map;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
    
    // 9. Gửi phản hồi về phòng đã mượn
    @PostMapping("/phanhoi")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> guiPhanHoi(@RequestBody PhanHoiRequest phanHoiRequest) {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        // Nếu có maLichSu, sử dụng nó để tìm LichSuMuonPhong
        LichSuMuonPhong lichSuMuonPhong = null;
        
        if (phanHoiRequest.getMaLichSu() != null) {
            Optional<LichSuMuonPhong> lichSuOpt = lichSuMuonPhongRepository.findById(phanHoiRequest.getMaLichSu());
            if (lichSuOpt.isPresent()) {
                lichSuMuonPhong = lichSuOpt.get();
                
                // Kiểm tra xem lịch sử có phải của giảng viên này không
                if (!lichSuMuonPhong.getYeuCauMuonPhong().getNguoiMuon().getIdNguoiDung().equals(giangVien.getNguoiDung().getIdNguoiDung())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Bạn không có quyền đánh giá phòng này"));
                }
                
                // Kiểm tra xem đã có đánh giá chưa
                List<PhanHoi> phanHoiList = phanHoiRepository.findByLichSuMuonPhongMaLichSu(phanHoiRequest.getMaLichSu());
                if (!phanHoiList.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new MessageResponse("Bạn đã đánh giá phòng này rồi. Vui lòng sử dụng chức năng cập nhật đánh giá."));
                }
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy lịch sử mượn phòng"));
            }
        } else {
            // Nếu không có maLichSu, sử dụng maYeuCau để tìm YeuCauMuonPhong và tạo LichSuMuonPhong mới
            Optional<YeuCauMuonPhong> yeuCauOpt = yeuCauMuonPhongRepository.findById(phanHoiRequest.getMaYeuCau());
            if (!yeuCauOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy yêu cầu mượn phòng"));
            }
            
            YeuCauMuonPhong yeuCau = yeuCauOpt.get();
            
            // Kiểm tra xem yêu cầu có phải của giảng viên này không
            if (!yeuCau.getNguoiMuon().getIdNguoiDung().equals(giangVien.getNguoiDung().getIdNguoiDung())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Bạn không có quyền đánh giá phòng này"));
            }
            
            // Kiểm tra xem đã có đánh giá chưa
            List<PhanHoi> phanHoiList = phanHoiRepository.findByYeuCauMuonPhongMaYeuCau(phanHoiRequest.getMaYeuCau());
            if (!phanHoiList.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new MessageResponse("Bạn đã đánh giá phòng này rồi. Vui lòng sử dụng chức năng cập nhật đánh giá."));
            }
            
            // Kiểm tra xem yêu cầu đã có trong lịch sử mượn phòng chưa
            List<LichSuMuonPhong> lichSuList = lichSuMuonPhongRepository.findByYeuCauMuonPhong(yeuCau);
            if (lichSuList.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Không thể đánh giá phòng chưa được mượn"));
            }
            
            lichSuMuonPhong = lichSuList.get(0);
        }
        
        // Tạo phản hồi mới
        PhanHoi phanHoi = new PhanHoi();
        phanHoi.setLichSuMuonPhong(lichSuMuonPhong);
        phanHoi.setDanhGia(phanHoiRequest.getDanhGia());
        phanHoi.setNhanXet(phanHoiRequest.getNhanXet());
        phanHoi.setThoiGian(new Date());
        
        phanHoiRepository.save(phanHoi);
        
        return ResponseEntity.ok(new MessageResponse("Đã gửi phản hồi thành công"));
    }
    
    // 10. Xem chi tiết yêu cầu mượn phòng
    @GetMapping("/yeucau/{maYeuCau}")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> getChiTietYeuCau(@PathVariable Integer maYeuCau) {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        Optional<YeuCauMuonPhong> yeuCauOpt = yeuCauMuonPhongRepository.findById(maYeuCau);
        if (!yeuCauOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy yêu cầu mượn phòng"));
        }
        
        YeuCauMuonPhong yeuCau = yeuCauOpt.get();
        
        // Kiểm tra xem yêu cầu có phải của giảng viên này không
        if (!yeuCau.getNguoiMuon().getIdNguoiDung().equals(giangVien.getNguoiDung().getIdNguoiDung())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new MessageResponse("Bạn không có quyền xem yêu cầu này"));
        }
        
        // Tạo đối tượng chứa thông tin chi tiết để trả về
        Map<String, Object> chiTietYeuCau = new HashMap<>();
        chiTietYeuCau.put("maYeuCau", yeuCau.getMaYeuCau());
        chiTietYeuCau.put("nguoiMuon", yeuCau.getNguoiMuon().getHoTen());
        chiTietYeuCau.put("idNguoiMuon", yeuCau.getNguoiMuon().getIdNguoiDung());
        chiTietYeuCau.put("phong", yeuCau.getPhong().getMaPhong());
        chiTietYeuCau.put("maPhong", yeuCau.getPhong().getMaPhong());
        chiTietYeuCau.put("loaiPhong", yeuCau.getPhong().getLoaiPhong().toString());
        chiTietYeuCau.put("viTri", yeuCau.getPhong().getViTri());
        chiTietYeuCau.put("thoiGianMuon", yeuCau.getThoiGianMuon());
        chiTietYeuCau.put("thoiGianTra", yeuCau.getThoiGianTra());
        chiTietYeuCau.put("mucDich", yeuCau.getMucDich());
        chiTietYeuCau.put("trangThai", yeuCau.getTrangThai().toString());
        chiTietYeuCau.put("lyDo", yeuCau.getLyDo());
        
        // Thêm thông tin người duyệt nếu có
        if (yeuCau.getNguoiDuyet() != null) {
            chiTietYeuCau.put("nguoiDuyet", yeuCau.getNguoiDuyet().getHoTen());
            chiTietYeuCau.put("idNguoiDuyet", yeuCau.getNguoiDuyet().getIdNguoiDung());
        } else {
            chiTietYeuCau.put("nguoiDuyet", null);
            chiTietYeuCau.put("idNguoiDuyet", null);
        }
        
        return ResponseEntity.ok(chiTietYeuCau);
    }
    
    // 11. Báo cáo sự cố
    @PostMapping("/baosuco")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> baoSuCoGV(@RequestBody Map<String, Object> suCoData) {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        // Lấy các thông tin cần thiết từ request
        Integer maYeuCau = null;
        String moTa = (String) suCoData.get("moTa");
        
        if (suCoData.containsKey("maYeuCau")) {
            try {
                maYeuCau = Integer.parseInt(suCoData.get("maYeuCau").toString());
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Mã yêu cầu không hợp lệ"));
            }
        }
        
        if (maYeuCau == null || moTa == null || moTa.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse("Thông tin báo cáo sự cố không hợp lệ"));
        }
        
        try {
            // Lấy thông tin yêu cầu mượn phòng
            Optional<YeuCauMuonPhong> yeuCauOpt = yeuCauMuonPhongRepository.findById(maYeuCau);
            if (!yeuCauOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy yêu cầu mượn phòng"));
            }
            
            YeuCauMuonPhong yeuCau = yeuCauOpt.get();
            
            // Kiểm tra xem yêu cầu có thuộc về giảng viên này không
            if (!yeuCau.getNguoiMuon().getIdNguoiDung().equals(giangVien.getNguoiDung().getIdNguoiDung())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Bạn không có quyền báo cáo sự cố cho phòng này"));
            }
            
            // Lấy lịch sử mượn phòng tương ứng (nếu có)
            LichSuMuonPhong lichSu = null;
            List<LichSuMuonPhong> lichSuList = lichSuMuonPhongRepository.findByYeuCauMuonPhongMaYeuCau(maYeuCau);
            if (!lichSuList.isEmpty()) {
                lichSu = lichSuList.get(0);
            }
            
            // Tạo đối tượng sự cố
            SuCo suCo = new SuCo();
            
            // Thiết lập các thuộc tính theo model
            suCo.setPhong(yeuCau.getPhong());
            suCo.setMoTa(moTa);
            suCo.setThoiGianBaoCao(new Date());
            suCo.setTrangThai(SuCo.TrangThai.ChuaXuLy);
            
            if (lichSu != null) {
                suCo.setLichSuMuonPhong(lichSu);
            }
            
            // Lưu sự cố vào cơ sở dữ liệu
            suCoRepository.save(suCo);
            
            return ResponseEntity.ok(new MessageResponse("Đã gửi báo cáo sự cố thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Lỗi khi gửi báo cáo sự cố: " + e.getMessage()));
        }
    }
    
    // 12. Gửi thông báo
    @PostMapping("/thongbao")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> guiThongBao(@RequestBody ThongBaoRequest thongBaoRequest) {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        ThongBaoGui thongBaoGui = new ThongBaoGui();
        thongBaoGui.setNguoiGui(giangVien.getNguoiDung());
        thongBaoGui.setTieuDe(thongBaoRequest.getTieuDe());
        thongBaoGui.setNoiDung(thongBaoRequest.getNoiDung());
        thongBaoGui.setThoiGian(new Date());
        
        thongBaoGui = thongBaoGuiRepository.save(thongBaoGui);
        
        int countNguoiNhan = 0;
        
        // Tạo thông báo nhận cho từng người nhận cụ thể
        if (thongBaoRequest.getDanhSachNguoiNhan() != null && !thongBaoRequest.getDanhSachNguoiNhan().isEmpty()) {
            for (String idNguoiNhan : thongBaoRequest.getDanhSachNguoiNhan()) {
                // Bỏ qua trường hợp gửi cho chính mình
                if (idNguoiNhan.equals(giangVien.getNguoiDung().getIdNguoiDung())) {
                    continue;
                }
                
                Optional<NguoiDung> nguoiNhanOpt = nguoiDungRepository.findById(idNguoiNhan);
                if (nguoiNhanOpt.isPresent()) {
                    ThongBaoNhan thongBaoNhan = new ThongBaoNhan();
                    thongBaoNhan.setThongBaoGui(thongBaoGui);
                    thongBaoNhan.setNguoiNhan(nguoiNhanOpt.get());
                    thongBaoNhan.setTrangThai(ThongBaoNhan.TrangThai.CHUADOC);
                    
                    thongBaoNhanRepository.save(thongBaoNhan);
                    countNguoiNhan++;
                }
            }
        }
        
        // Tạo thông báo nhận cho tất cả SV trong lớp nếu guiChoLop = true
        if (thongBaoRequest.getGuiChoLop() != null && thongBaoRequest.getGuiChoLop() 
            && thongBaoRequest.getMaLop() != null && !thongBaoRequest.getMaLop().isEmpty()) {
            
            String maLop = thongBaoRequest.getMaLop();
            List<SinhVien> danhSachSinhVien = sinhVienRepository.findByLopHocMaLop(maLop);
            
            for (SinhVien sinhVien : danhSachSinhVien) {
                ThongBaoNhan thongBaoNhan = new ThongBaoNhan();
                thongBaoNhan.setThongBaoGui(thongBaoGui);
                thongBaoNhan.setNguoiNhan(sinhVien.getNguoiDung());
                thongBaoNhan.setTrangThai(ThongBaoNhan.TrangThai.CHUADOC);
                
                thongBaoNhanRepository.save(thongBaoNhan);
                countNguoiNhan++;
            }
        }
        
        if (countNguoiNhan == 0) {
            // Nếu không có người nhận nào, xóa thông báo gửi đi
            thongBaoGuiRepository.delete(thongBaoGui);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse("Không có người nhận nào được thêm vào thông báo"));
        }
        
        return ResponseEntity.ok(new MessageResponse("Đã gửi thông báo thành công cho " + countNguoiNhan + " người nhận"));
    }
    
    // 13. Xem thông báo đã nhận
    @GetMapping("/thongbao/nhan")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> getThongBaoNhan() {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        List<ThongBaoNhan> danhSachThongBao = 
            thongBaoNhanRepository.findByNguoiNhanIdNguoiDungOrderByThongBaoGuiThoiGianDesc(giangVien.getNguoiDung().getIdNguoiDung());
        
        return ResponseEntity.ok(danhSachThongBao);
    }
    
    // 13.1 Xóa thông báo đã nhận
    @DeleteMapping("/thongbao/{id}")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> xoaThongBao(@PathVariable Integer id) {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        try {
            boolean ketQua = thongBaoService.xoaThongBaoNhan(id, giangVien.getNguoiDung().getIdNguoiDung());
            
            if (ketQua) {
                return ResponseEntity.ok(new MessageResponse("Đã xóa thông báo thành công"));
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Bạn không có quyền xóa thông báo này"));
            }
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Lỗi khi xóa thông báo: " + e.getMessage()));
        }
    }
    
    // 14. Xem thông báo đã gửi
    @GetMapping("/thongbao/gui")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> getThongBaoGui() {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        List<ThongBaoGui> danhSachThongBaoGoc = 
            thongBaoGuiRepository.findByNguoiGuiIdNguoiDungOrderByThoiGianDesc(giangVien.getNguoiDung().getIdNguoiDung());
        
        // Chuyển đổi dữ liệu thêm thông tin số người nhận và số người đã đọc
        List<Map<String, Object>> danhSachThongBao = danhSachThongBaoGoc.stream()
            .map(tb -> {
                Map<String, Object> thongBaoInfo = new HashMap<>();
                // Copy các thuộc tính cơ bản
                thongBaoInfo.put("id", tb.getIdTB()); // Dùng idTB làm ID
                thongBaoInfo.put("idTB", tb.getIdTB());
                thongBaoInfo.put("tieuDe", tb.getTieuDe());
                thongBaoInfo.put("noiDung", tb.getNoiDung());
                thongBaoInfo.put("thoiGian", tb.getThoiGian());
                thongBaoInfo.put("nguoiGui", tb.getNguoiGui().getHoTen());
                
                // Lấy danh sách người nhận thông báo
                List<ThongBaoNhan> nguoiNhans = thongBaoNhanRepository.findByThongBaoGuiIdTB(tb.getIdTB());
                
                // Thêm thông tin số người nhận
                int soNguoiNhan = nguoiNhans.size();
                thongBaoInfo.put("soNguoiNhan", soNguoiNhan);
                
                // Thêm thông tin số người đã đọc
                long soNguoiDaDoc = nguoiNhans.stream()
                    .filter(tbn -> tbn.getTrangThai() == ThongBaoNhan.TrangThai.DADOC)
                    .count();
                thongBaoInfo.put("soNguoiDaDoc", soNguoiDaDoc);
                
                return thongBaoInfo;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(danhSachThongBao);
    }
    
    // 15. Đánh dấu thông báo đã đọc
    @PutMapping("/thongbao/{maThongBao}/daDoc")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> danhDauDaDoc(@PathVariable Integer maThongBao) {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        Optional<ThongBaoNhan> thongBaoOpt = thongBaoNhanRepository.findById(maThongBao);
        if (!thongBaoOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông báo"));
        }
        
        ThongBaoNhan thongBao = thongBaoOpt.get();
        
        // Kiểm tra xem thông báo có phải của giảng viên này không
        if (!thongBao.getNguoiNhan().getIdNguoiDung().equals(giangVien.getNguoiDung().getIdNguoiDung())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new MessageResponse("Bạn không có quyền đánh dấu thông báo này"));
        }
        
        thongBao.setTrangThai(ThongBaoNhan.TrangThai.DADOC);
        thongBaoNhanRepository.save(thongBao);
        
        return ResponseEntity.ok(new MessageResponse("Đã đánh dấu thông báo là đã đọc"));
    }
    
    // 16. Lấy danh sách người dùng có thể nhận thông báo
    @GetMapping("/thongbao/nguoinhan")
    @PreAuthorize("hasRole('GV') or hasRole('SV')")
    public ResponseEntity<?> getDanhSachNguoiNhan() {
        List<NguoiDung> danhSachNguoiDung = nguoiDungRepository.findAll();
        List<Map<String, Object>> result = danhSachNguoiDung.stream()
            .filter(nd -> {
                String tenVaiTro = nd.getVaiTro().getTenVaiTro();
                return tenVaiTro.equals("GV") || tenVaiTro.equals("SV");
            })
            .map(nd -> {
                Map<String, Object> nguoiDungInfo = new HashMap<>();
                nguoiDungInfo.put("idNguoiDung", nd.getIdNguoiDung());
                nguoiDungInfo.put("hoTen", nd.getHoTen());
                // Xác định vai trò
                String vaiTro = "Khác";
                if (nd.getVaiTro().getTenVaiTro().equals("GV")) {
                    vaiTro = "Giảng viên";
                } else if (nd.getVaiTro().getTenVaiTro().equals("SV")) {
                    vaiTro = "Sinh viên";
                    SinhVien sinhVien = sinhVienRepository.findByNguoiDungIdNguoiDung(nd.getIdNguoiDung());
                    if (sinhVien != null && sinhVien.getLopHoc() != null) {
                        nguoiDungInfo.put("maLop", sinhVien.getLopHoc().getMaLop());
                    }
                }
                nguoiDungInfo.put("vaiTro", vaiTro);
                return nguoiDungInfo;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
    
    // 17. Lấy danh sách lớp học mà giảng viên đang dạy
    @GetMapping("/danhsachlop")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> getDanhSachLopHoc() {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        // Lấy danh sách lịch dạy của giảng viên
        List<ThoiKhoaBieu> lichDay = thoiKhoaBieuRepository.findByGiangVienMaGV(giangVien.getMaGV());
        
        // Lọc ra các lớp học duy nhất từ lịch dạy
        Set<String> maLopSet = new HashSet<>();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (ThoiKhoaBieu tkb : lichDay) {
            LopHoc lopHoc = tkb.getLopHoc();
            if (lopHoc != null && !maLopSet.contains(lopHoc.getMaLop())) {
                maLopSet.add(lopHoc.getMaLop());
                
                Map<String, Object> lopHocInfo = new HashMap<>();
                lopHocInfo.put("maLop", lopHoc.getMaLop());
                lopHocInfo.put("tenLop", lopHoc.getTenLop());
                result.add(lopHocInfo);
            }
        }
        
        return ResponseEntity.ok(result);
    }
    
    // 18. Lấy thông tin phản hồi đã gửi
    @GetMapping("/phanhoi/{maYeuCau}")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> getPhanHoi(@PathVariable Integer maYeuCau) {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        // Kiểm tra xem yêu cầu có thuộc giảng viên này không
        Optional<YeuCauMuonPhong> yeuCauOpt = yeuCauMuonPhongRepository.findById(maYeuCau);
        if (!yeuCauOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy yêu cầu mượn phòng"));
        }
        
        YeuCauMuonPhong yeuCau = yeuCauOpt.get();
        
        // Kiểm tra xem yêu cầu có phải của giảng viên này không
        if (!yeuCau.getNguoiMuon().getIdNguoiDung().equals(giangVien.getNguoiDung().getIdNguoiDung())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new MessageResponse("Bạn không có quyền xem phản hồi này"));
        }
        
        // Tìm kiếm lịch sử mượn phòng
        List<LichSuMuonPhong> lichSuList = lichSuMuonPhongRepository.findByYeuCauMuonPhongMaYeuCau(maYeuCau);
        if (lichSuList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy lịch sử mượn phòng"));
        }
        
        LichSuMuonPhong lichSu = lichSuList.get(0);
        
        // Tìm kiếm phản hồi
        List<PhanHoi> phanHoiList = phanHoiRepository.findByLichSuMuonPhongMaLichSu(lichSu.getMaLichSu());
        if (phanHoiList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy phản hồi cho yêu cầu này"));
        }
        
        PhanHoi phanHoi = phanHoiList.get(0);
        
        // Trả về thông tin phản hồi
        Map<String, Object> result = new HashMap<>();
        result.put("maYeuCau", maYeuCau);
        result.put("maLichSu", lichSu.getMaLichSu());
        result.put("danhGia", phanHoi.getDanhGia());
        result.put("nhanXet", phanHoi.getNhanXet());
        result.put("thoiGian", phanHoi.getThoiGian());
        
        return ResponseEntity.ok(result);
    }
    
    // 19. Kiểm tra các yêu cầu đã được đánh giá
    @PostMapping("/kiemtra-danhgia")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> kiemTraDanhGia(@RequestBody Map<String, Object> requestData) {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        // Lấy danh sách mã yêu cầu từ request
        List<Integer> danhSachMaYeuCau = new ArrayList<>();
        if (requestData.containsKey("danhSachMaYeuCau")) {
            Object danhSachObj = requestData.get("danhSachMaYeuCau");
            if (danhSachObj instanceof List) {
                for (Object item : (List<?>) danhSachObj) {
                    if (item instanceof Integer) {
                        danhSachMaYeuCau.add((Integer) item);
                    } else if (item instanceof String) {
                        try {
                            danhSachMaYeuCau.add(Integer.parseInt((String) item));
                        } catch (NumberFormatException e) {
                            // Bỏ qua các giá trị không phải số
                        }
                    }
                }
            }
        }
        
        if (danhSachMaYeuCau.isEmpty()) {
            return ResponseEntity.ok(new HashMap<Integer, Boolean>());
        }
        
        // Tạo map kết quả, mặc định tất cả là chưa đánh giá (false)
        Map<Integer, Boolean> ketQua = new HashMap<>();
        for (Integer maYeuCau : danhSachMaYeuCau) {
            ketQua.put(maYeuCau, false);
        }
        
        // Lấy danh sách lịch sử mượn phòng từ các yêu cầu
        List<LichSuMuonPhong> lichSuList = lichSuMuonPhongRepository.findAll().stream()
            .filter(ls -> ls.getYeuCauMuonPhong() != null && 
                         danhSachMaYeuCau.contains(ls.getYeuCauMuonPhong().getMaYeuCau()))
            .collect(Collectors.toList());
        
        // Kiểm tra xem các lịch sử đã có phản hồi chưa
        for (LichSuMuonPhong lichSu : lichSuList) {
            Integer maYeuCau = lichSu.getYeuCauMuonPhong().getMaYeuCau();
            List<PhanHoi> phanHoiList = phanHoiRepository.findByLichSuMuonPhongMaLichSu(lichSu.getMaLichSu());
            if (!phanHoiList.isEmpty()) {
                ketQua.put(maYeuCau, true);
            }
        }
        
        return ResponseEntity.ok(ketQua);
    }
    
    // 5.2 Cập nhật phản hồi về phòng
    @PutMapping("/phanhoi")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> capNhatPhanHoi(@RequestBody PhanHoiRequest phanHoiRequest) {
        GiangVien giangVien = getCurrentGiangVien();
        if (giangVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
        }
        
        List<PhanHoi> phanHoiList = phanHoiRepository.findByYeuCauMuonPhongMaYeuCau(phanHoiRequest.getMaYeuCau());
        if (phanHoiList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy đánh giá để cập nhật"));
        }
        
        PhanHoi phanHoi = phanHoiList.get(0);
        
        // Kiểm tra xem phản hồi có phải của giảng viên này không
        if (!phanHoi.getLichSuMuonPhong().getYeuCauMuonPhong().getNguoiMuon().getIdNguoiDung().equals(giangVien.getNguoiDung().getIdNguoiDung())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new MessageResponse("Bạn không có quyền cập nhật đánh giá này"));
        }
        
        // Cập nhật thông tin
        phanHoi.setDanhGia(phanHoiRequest.getDanhGia());
        phanHoi.setNhanXet(phanHoiRequest.getNhanXet());
        phanHoi.setThoiGian(new Date());  // Cập nhật lại thời gian
        
        // Lưu cập nhật vào database
        phanHoi = phanHoiRepository.save(phanHoi);

        // Trả về đối tượng phản hồi đã cập nhật để frontend có thể cập nhật UI
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đã cập nhật đánh giá thành công");
        response.put("phanHoi", phanHoi);
        
        return ResponseEntity.ok(response);
    }
    
    // 20. Thay đổi lịch giảng dạy
    @PutMapping("/doilichday")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> thayDoiLichDay(@RequestBody DoiLichDayRequest doiLichDayRequest) {
        
        Optional<ThoiKhoaBieu> optionalTKB = thoiKhoaBieuRepository.findById(doiLichDayRequest.getMaTKB());

        if (optionalTKB.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Không tìm thấy thời khóa biểu với mã: " + doiLichDayRequest.getMaTKB());
        }

        ThoiKhoaBieu tkb = optionalTKB.get();
        
	     // Thời khóa biểu cũ cho chức năng Thông báo
        ThoiKhoaBieu tkbCu = new ThoiKhoaBieu();
        tkbCu.setPhong(tkb.getPhong());
        tkbCu.setLopHoc(tkb.getLopHoc());
        tkbCu.setMonHoc(tkb.getMonHoc());
        tkbCu.setGiangVien(tkb.getGiangVien());
        tkbCu.setThuTrongTuan(tkb.getThuTrongTuan());
        tkbCu.setTietBatDau(tkb.getTietBatDau());
        tkbCu.setTietKetThuc(tkb.getTietKetThuc());
        tkbCu.setTuan(tkb.getTuan());
        tkbCu.setNgayHoc(tkb.getNgayHoc());

        List<ThoiKhoaBieu> lichTrung = thoiKhoaBieuRepository
            .findByNgayHocAndPhongAndMaTKBNotAndTietBatDauLessThanEqualAndTietKetThucGreaterThanEqual(
                doiLichDayRequest.getNgayHoc(),
                tkb.getPhong(),
                doiLichDayRequest.getMaTKB(),
                doiLichDayRequest.getTietKetThuc(),
                doiLichDayRequest.getTietBatDau()
            );
        
        Date now = new Date();
	
	    // Tính giờ bắt đầu từ tiết
	    Date gioBatDau = getTimeFromTiet(doiLichDayRequest.getTietBatDau(), doiLichDayRequest.getNgayHoc());
	    Date gioKetThuc = getTimeFromTiet(doiLichDayRequest.getTietKetThuc(), doiLichDayRequest.getNgayHoc());
//	    Date gioBatDauCu = getTimeFromTiet(tkb.getTietBatDau(), tkb.getNgayHoc());
	    
//		if (gioBatDauCu.before(now)) {
//		    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//		        .body("Không thể chỉnh lịch dạy đã qua");
//		}
		
		if (gioBatDau.before(now)) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			        .body("Không thể chỉnh lịch dạy về quá khứ");
		}

        if (!lichTrung.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Không thể thay đổi lịch dạy. Lịch dạy mong muốn bị trùng với lịch dạy khác!");
        }
        
        List<YeuCauMuonPhong> yeuCauTrung = yeuCauMuonPhongRepository.findByPhongAndTrangThaiNotAndThoiGianTraGreaterThanAndThoiGianMuonLessThan(tkb.getPhong(), TrangThai.KHONGDUOCDUYET, gioBatDau, gioKetThuc);

        if (!yeuCauTrung.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Không thể đổi lịch dạy vì phòng đã có người đặt trước trong khoảng thời gian này.");
        }

        // Cập nhật thông tin
        tkb.setTietBatDau(doiLichDayRequest.getTietBatDau());
        tkb.setTietKetThuc(doiLichDayRequest.getTietKetThuc());
        tkb.setNgayHoc(doiLichDayRequest.getNgayHoc());
        tkb.setTuan(getISOWeekNumber(doiLichDayRequest.getNgayHoc()));
        
        // ✅ Tính và set lại thứ trong tuần
        ThoiKhoaBieu.ThuTrongTuan thu = getThuTrongTuanFromDate(doiLichDayRequest.getNgayHoc());
        tkb.setThuTrongTuan(thu);
        
        thoiKhoaBieuRepository.save(tkb);
        thongBaoService.thongBaoThayDoiTKB(tkbCu, tkb);
        thongBaoService.capNhatLichNhacNho(tkb.getMaTKB());

        return ResponseEntity.ok("Đổi lịch thành công");
    }

    
    private ThoiKhoaBieu.ThuTrongTuan getThuTrongTuanFromDate(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK); // Sunday = 1, Saturday = 7

        // Map dayOfWeek Java -> Enum
        return switch (dayOfWeek) {
            case Calendar.MONDAY -> ThoiKhoaBieu.ThuTrongTuan.MON;
            case Calendar.TUESDAY -> ThoiKhoaBieu.ThuTrongTuan.TUE;
            case Calendar.WEDNESDAY -> ThoiKhoaBieu.ThuTrongTuan.WED;
            case Calendar.THURSDAY -> ThoiKhoaBieu.ThuTrongTuan.THU;
            case Calendar.FRIDAY -> ThoiKhoaBieu.ThuTrongTuan.FRI;
            case Calendar.SATURDAY -> ThoiKhoaBieu.ThuTrongTuan.SAT;
            case Calendar.SUNDAY -> ThoiKhoaBieu.ThuTrongTuan.SUN;
            default -> throw new IllegalArgumentException("Ngày không hợp lệ!");
        };
    }

    private Date getTimeFromTiet(int tiet, Date ngayHoc) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(ngayHoc);
        cal.set(Calendar.HOUR_OF_DAY, 7);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);

        // Mỗi tiết là 45 phút, tiết 1 bắt đầu từ 7h00
        int minutesToAdd = (tiet - 1) * 45;
        cal.add(Calendar.MINUTE, minutesToAdd);

        return cal.getTime();
    }

    
    public int getISOWeekNumber(Date date) {
        // Tạo calendar từ ngày truyền vào
        Calendar calendar = GregorianCalendar.getInstance();

        // Cấu hình chuẩn ISO: tuần bắt đầu từ Thứ Hai
        calendar.setFirstDayOfWeek(Calendar.MONDAY);
        calendar.setMinimalDaysInFirstWeek(4); // ISO: tuần 1 phải có ít nhất 4 ngày

        calendar.setTime(date);

        return calendar.get(Calendar.WEEK_OF_YEAR);
    }

    
    // Phương thức hỗ trợ chuyển đổi Object sang Integer
    // private Integer convertToInteger(Object value) {
    //     if (value == null) {
    //         return null;
    //     }
    //     if (value instanceof Integer) {
    //         return (Integer) value;
    //     }
    //     try {
    //         return Integer.parseInt(value.toString());
    //     } catch (NumberFormatException e) {
    //         return null;
    //     }
    // }
}
