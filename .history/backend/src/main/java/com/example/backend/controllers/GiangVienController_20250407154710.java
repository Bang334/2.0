package com.example.backend.controllers;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
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
import com.example.backend.model.ThongBaoGui;
import com.example.backend.model.ThongBaoNhan;
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
import com.example.backend.security.services.UserDetailsImpl;
import com.example.backend.service.ThongBaoService;

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
        return ResponseEntity.ok(phongRepository.findAll());
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
        
        // Kiểm tra xung đột với các yêu cầu đã tồn tại của phòng
        List<YeuCauMuonPhong> trungLichPhong = yeuCauMuonPhongRepository.kiemTraTrungLichPhong(
            yeuCauRequest.getMaPhong(),
            yeuCauRequest.getThoiGianMuon(),
            yeuCauRequest.getThoiGianTra()
        );
        
        if (!trungLichPhong.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new MessageResponse("Phòng đã được đăng ký mượn trong khoảng thời gian này"));
        }
        
        // Kiểm tra xung đột với các yêu cầu đã tồn tại của người mượn
        List<YeuCauMuonPhong> trungLichNguoiMuon = yeuCauMuonPhongRepository.kiemTraTrungLichNguoiMuon(
            giangVien.getNguoiDung().getIdNguoiDung(),
            yeuCauRequest.getThoiGianMuon(),
            yeuCauRequest.getThoiGianTra()
        );
        
        if (!trungLichNguoiMuon.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new MessageResponse("Bạn đã đăng ký mượn phòng trong khoảng thời gian này"));
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
        Date thoiGianTraDuKien = yeuCau.getThoiGianTra();
        
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
        if (thoiGianTraThucTe.after(thoiGianTraDuKien)) {
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
        
        return ResponseEntity.ok(yeuCauList);
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
            
            // Tạo bản ghi lịch sử mượn phòng
            lichSuMuonPhong = new LichSuMuonPhong();
            lichSuMuonPhong.setYeuCauMuonPhong(yeuCau);
            lichSuMuonPhong.setThoiGianMuon(yeuCau.getThoiGianMuon());
            lichSuMuonPhong.setThoiGianTraThucTe(yeuCau.getThoiGianTra());
            lichSuMuonPhong.setTrangThaiTra(LichSuMuonPhong.TrangThaiTra.DungHan);
            
            // Lưu bản ghi lịch sử trước
            lichSuMuonPhong = lichSuMuonPhongRepository.save(lichSuMuonPhong);
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
        Integer maLichSu = null;
        String moTa = (String) suCoData.get("moTa");
        
        if (suCoData.containsKey("maYeuCau")) {
            try {
                maYeuCau = Integer.parseInt(suCoData.get("maYeuCau").toString());
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Mã yêu cầu không hợp lệ"));
            }
        }
        
        if (suCoData.containsKey("maLichSu")) {
            try {
                maLichSu = Integer.parseInt(suCoData.get("maLichSu").toString());
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Mã lịch sử không hợp lệ"));
            }
        }
        
        // Kiểm tra thông tin
        if ((maYeuCau == null && maLichSu == null) || moTa == null || moTa.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse("Thông tin báo cáo sự cố không hợp lệ"));
        }
        
        // Kiểm tra xem phòng đã trả hay chưa
        YeuCauMuonPhong yeuCau = null;
        
        if (maYeuCau != null) {
            Optional<YeuCauMuonPhong> yeuCauOpt = yeuCauMuonPhongRepository.findById(maYeuCau);
            if (!yeuCauOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy yêu cầu mượn phòng"));
            }
            
            yeuCau = yeuCauOpt.get();
            
            // Kiểm tra xem yêu cầu có thuộc về giảng viên này không
            if (!yeuCau.getNguoiMuon().getIdNguoiDung().equals(giangVien.getNguoiDung().getIdNguoiDung())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Bạn không có quyền báo cáo sự cố cho phòng này"));
            }
            
            // Nếu phòng đã được trả (thoiGianTra đã có giá trị và không phải là thời gian trong tương lai)
            Date now = new Date();
            if (yeuCau.getThoiGianTra() != null && yeuCau.getThoiGianTra().before(now)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Không thể báo cáo sự cố cho phòng đã trả"));
            }
        } else if (maLichSu != null) {
            // Nếu có mã lịch sử, kiểm tra xem phòng đã được trả hay chưa
            Optional<LichSuMuonPhong> lichSuOpt = lichSuMuonPhongRepository.findById(maLichSu);
            if (!lichSuOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy lịch sử mượn phòng"));
            }
            
            LichSuMuonPhong lichSu = lichSuOpt.get();
            yeuCau = lichSu.getYeuCauMuonPhong();
            
            // Kiểm tra xem yêu cầu có thuộc về giảng viên này không
            if (!yeuCau.getNguoiMuon().getIdNguoiDung().equals(giangVien.getNguoiDung().getIdNguoiDung())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Bạn không có quyền báo cáo sự cố cho phòng này"));
            }
            
            // Nếu phòng đã được trả (có thời gian trả thực tế)
            if (lichSu.getThoiGianTraThucTe() != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Không thể báo cáo sự cố cho phòng đã trả"));
            }
        }
        
        // Tạo và lưu báo cáo sự cố
        // TODO: Tạo model và repository cho báo cáo sự cố
        
        // Tạm thời chỉ trả về thông báo thành công
        return ResponseEntity.ok(new MessageResponse("Đã gửi báo cáo sự cố thành công"));
    }
    
    // 12. Gửi thông báo
    @PostMapping("/thongbao")
    @PreAuthorize("hasRole('GV')")
    public ResponseEntity<?> guiThongBao(@RequestBody ThongBaoRequest thongBaoRequest) {
        try {
            GiangVien giangVien = getCurrentGiangVien();
            if (giangVien == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin giảng viên"));
            }

            // Gửi thông báo cho từng người nhận cụ thể
            if (thongBaoRequest.getDanhSachNguoiNhan() != null && !thongBaoRequest.getDanhSachNguoiNhan().isEmpty()) {
                for (String idNguoiNhan : thongBaoRequest.getDanhSachNguoiNhan()) {
                    thongBaoService.guiThongBao(
                        giangVien.getNguoiDung(),
                        thongBaoRequest.getTieuDe(),
                        thongBaoRequest.getNoiDung(),
                        idNguoiNhan,
                        null
                    );
                }
            }

            // Gửi thông báo cho lớp
            if (thongBaoRequest.getGuiChoLop() != null && thongBaoRequest.getGuiChoLop() 
                && thongBaoRequest.getMaLop() != null && !thongBaoRequest.getMaLop().isEmpty()) {
                thongBaoService.guiThongBao(
                    giangVien.getNguoiDung(),
                    thongBaoRequest.getTieuDe(),
                    thongBaoRequest.getNoiDung(),
                    null,
                    thongBaoRequest.getMaLop()
                );
            }

            return ResponseEntity.ok(new MessageResponse("Đã gửi thông báo thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Đã xảy ra lỗi khi gửi thông báo"));
        }
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
            thongBaoNhanRepository.findByNguoiNhanIdNguoiDung(giangVien.getNguoiDung().getIdNguoiDung());
        
        return ResponseEntity.ok(danhSachThongBao);
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
