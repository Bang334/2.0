package com.example.backend.controllers;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.logging.Level;
import java.util.logging.Logger;
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

import com.example.backend.model.LopHoc;
import com.example.backend.model.NguoiDung;
import com.example.backend.model.PhanHoi;
import com.example.backend.model.Phong;
import com.example.backend.model.SinhVien;
import com.example.backend.model.ThoiKhoaBieu;
import com.example.backend.model.ThongBaoGui;
import com.example.backend.model.ThongBaoNhan;
import com.example.backend.model.YeuCauMuonPhong;
import com.example.backend.model.LichSuMuonPhong;
import com.example.backend.payload.request.PhanHoiRequest;
import com.example.backend.payload.request.ThongBaoRequest;
import com.example.backend.payload.request.YeuCauMuonPhongRequest;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.repository.NguoiDungRepository;
import com.example.backend.repository.PhanHoiRepository;
import com.example.backend.repository.PhongRepository;
import com.example.backend.repository.SinhVienRepository;
import com.example.backend.repository.ThoiKhoaBieuRepository;
import com.example.backend.repository.ThongBaoGuiRepository;
import com.example.backend.repository.ThongBaoNhanRepository;
import com.example.backend.repository.YeuCauMuonPhongRepository;
import com.example.backend.repository.LichSuMuonPhongRepository;
import com.example.backend.repository.SuCoRepository;
import com.example.backend.service.UserDetailsImpl;
import com.example.backend.service.SuCoService;
import com.example.backend.model.SuCo;
import com.example.backend.service.ThongBaoService;
import com.example.backend.exception.ResourceNotFoundException;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/sinhvien")
public class SinhVienController {
    
    private static final Logger logger = Logger.getLogger(SinhVienController.class.getName());
    
    @Autowired
    private SinhVienRepository sinhVienRepository;
    
    @Autowired
    private NguoiDungRepository nguoiDungRepository;
    
    @Autowired
    private ThoiKhoaBieuRepository thoiKhoaBieuRepository;
    
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
    private LichSuMuonPhongRepository lichSuMuonPhongRepository;
    
    @Autowired
    private SuCoService suCoService;
    
    @Autowired
    private SuCoRepository suCoRepository;
    
    @Autowired
    private ThongBaoService thongBaoService;
    
    // Helper method to get current authenticated student
    private SinhVien getCurrentSinhVien() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String userId = userDetails.getId();
        
        Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findByTaiKhoanId(userId);
        if (nguoiDungOpt.isPresent()) {
            NguoiDung nguoiDung = nguoiDungOpt.get();
            return sinhVienRepository.findByNguoiDungIdNguoiDung(nguoiDung.getIdNguoiDung());
        }
        return null;
    }
    
    // 1. Xem thông tin cá nhân
    @GetMapping("/thongtin")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> getThongTinSinhVien() {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        return ResponseEntity.ok(sinhVien);
    }
    
    // 2. Xem lịch học của lớp
    @GetMapping("/lichhoc")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> getLichHocLop() {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        LopHoc lopHoc = sinhVien.getLopHoc();
        List<ThoiKhoaBieu> lichHoc = thoiKhoaBieuRepository.findByLopHocMaLop(lopHoc.getMaLop());
        
        return ResponseEntity.ok(lichHoc);
    }
    
    // 2.1 Xem lịch học của lớp theo tuần
    @GetMapping("/lichhoc/{tuan}")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> getLichHocLopTheoTuan(@PathVariable Integer tuan) {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        LopHoc lopHoc = sinhVien.getLopHoc();
        List<ThoiKhoaBieu> lichHoc = thoiKhoaBieuRepository.findByLopHocMaLopAndTuan(lopHoc.getMaLop(), tuan);
        
        return ResponseEntity.ok(lichHoc);
    }
    
    // 2.2 Xem lịch học của lớp cụ thể theo tuần
    @GetMapping("/thoikhoabieu/{maLop}/{tuan}")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> getLichHocTheoLopVaTuan(@PathVariable String maLop, @PathVariable Integer tuan) {
        List<ThoiKhoaBieu> lichHoc = thoiKhoaBieuRepository.findByLopHocMaLopAndTuan(maLop, tuan);
        return ResponseEntity.ok(lichHoc);
    }
    
    // 3. Yêu cầu mượn phòng học
    @PostMapping("/muonphong")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> yeuCauMuonPhong(@RequestBody YeuCauMuonPhongRequest yeuCauRequest) {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        List<YeuCauMuonPhong> yeuCauHienTai = yeuCauMuonPhongRepository.findByNguoiMuonAndTrangThaiInOrderByThoiGianMuonDesc(
            sinhVien.getNguoiDung(),
            Arrays.asList(YeuCauMuonPhong.TrangThai.DADUYET, YeuCauMuonPhong.TrangThai.DANGXULY)
        );

        // Kiểm tra xem có yêu cầu nào chưa có lịch sử mượn không
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
        
        // Kiểm tra xung đột với các yêu cầu đã tồn tại của phòng
        List<YeuCauMuonPhong> trungLichPhong = yeuCauMuonPhongRepository.kiemTraTrungLichPhong(
            yeuCauRequest.getMaPhong(),
            yeuCauRequest.getThoiGianMuon(),
            yeuCauRequest.getThoiGianTra()
        );
        
        if (!trungLichPhong.isEmpty()) {
            YeuCauMuonPhong yeuCauTrung = trungLichPhong.get(0);
            String thongBao = String.format("Phòng %s đã được đăng ký mượn bởi %s từ %s đến %s",
                yeuCauTrung.getPhong().getMaPhong(),
                yeuCauTrung.getNguoiMuon().getHoTen(),
                yeuCauTrung.getThoiGianMuon(),
                yeuCauTrung.getThoiGianTra()
            );
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new MessageResponse(thongBao));
        }

        // Kiểm tra xung đột với thời khóa biểu của các lớp học
        Date ngayMuon = yeuCauRequest.getThoiGianMuon();
        Date ngayTra = yeuCauRequest.getThoiGianTra();
        Phong phong = phongOpt.get();
        
        // Lấy tất cả thời khóa biểu của phòng trong ngày đó
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
                    // Kiểm tra nếu lớp học trong thời khóa biểu là lớp của sinh viên đang đăng ký
                    // thì cho phép mượn phòng (không báo lỗi xung đột)
                    if (tkb.getLopHoc() != null && sinhVien.getLopHoc() != null && 
                        tkb.getLopHoc().getMaLop().equals(sinhVien.getLopHoc().getMaLop())) {
                        // Đây là lớp học của sinh viên, cho phép mượn phòng
                        continue;
                    }
                    
                    String thongBao = String.format("Phòng %s đã có lịch học của lớp %s, môn %s từ tiết %d đến tiết %d vào ngày %s",
                        phong.getMaPhong(),
                        tkb.getLopHoc().getMaLop(),
                        tkb.getMonHoc().getTenMon(),
                        tkb.getTietBatDau(),
                        tkb.getTietKetThuc(),
                        tkb.getNgayHoc().toString()
                    );
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new MessageResponse(thongBao));
                }
            }
        }
        
        // Kiểm tra xung đột với các yêu cầu đã tồn tại của người mượn
        List<YeuCauMuonPhong> trungLichNguoiMuon = yeuCauMuonPhongRepository.kiemTraTrungLichNguoiMuon(
            sinhVien.getNguoiDung().getIdNguoiDung(),
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
        yeuCau.setNguoiMuon(sinhVien.getNguoiDung());
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
    
        // Ánh xạ số phút sang tiết học
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
    
    // 4. Trả phòng học
    @PutMapping("/traphong/{maYeuCau}")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> traPhongHoc(@PathVariable Integer maYeuCau) {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        Optional<YeuCauMuonPhong> yeuCauOpt = yeuCauMuonPhongRepository.findById(maYeuCau);
        if (!yeuCauOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy yêu cầu mượn phòng"));
        }
        
        YeuCauMuonPhong yeuCau = yeuCauOpt.get();
        
        // Kiểm tra xem yêu cầu có phải của sinh viên này không
        if (!yeuCau.getNguoiMuon().getIdNguoiDung().equals(sinhVien.getNguoiDung().getIdNguoiDung())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new MessageResponse("Bạn không có quyền trả phòng này"));
        }
        
        // Lấy bản sao thời gian trả dự kiến trước khi cập nhật
        Date thoiGianTraDuKien = yeuCau.getThoiGianTra();
        
        // Thời gian trả phòng thực tế (hiện tại)
        Date thoiGianTraThucTe = new Date();
        
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
        // So sánh với thời gian trả dự kiến ban đầu
        if (thoiGianTraThucTe.after(thoiGianTraDuKien)) {
            lichSu.setTrangThaiTra(LichSuMuonPhong.TrangThaiTra.TreHan);
        } else {
            lichSu.setTrangThaiTra(LichSuMuonPhong.TrangThaiTra.DungHan);
        }
        
        // Lưu bản ghi lịch sử
        lichSuMuonPhongRepository.save(lichSu);
        
        return ResponseEntity.ok(new MessageResponse("Đã trả phòng thành công"));
    }
    
    // 5. Gửi phản hồi về phòng đã mượn
    @PostMapping("/phanhoi")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> guiPhanHoi(@RequestBody PhanHoiRequest phanHoiRequest) {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        // Nếu có maLichSu, sử dụng nó để tìm LichSuMuonPhong
        LichSuMuonPhong lichSuMuonPhong = null;
        
        if (phanHoiRequest.getMaLichSu() != null) {
            Optional<LichSuMuonPhong> lichSuOpt = lichSuMuonPhongRepository.findById(phanHoiRequest.getMaLichSu());
            if (lichSuOpt.isPresent()) {
                lichSuMuonPhong = lichSuOpt.get();
                
                // Kiểm tra xem lịch sử có phải của sinh viên này không
                if (!lichSuMuonPhong.getYeuCauMuonPhong().getNguoiMuon().getIdNguoiDung().equals(sinhVien.getNguoiDung().getIdNguoiDung())) {
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
            
            // Kiểm tra xem yêu cầu có phải của sinh viên này không
            if (!yeuCau.getNguoiMuon().getIdNguoiDung().equals(sinhVien.getNguoiDung().getIdNguoiDung())) {
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
    
    // 5.1 Xem phản hồi đã gửi về phòng
    @GetMapping("/phanhoi/{maYeuCau}")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> getPhanHoi(@PathVariable Integer maYeuCau) {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        List<PhanHoi> phanHoiList = phanHoiRepository.findByYeuCauMuonPhongMaYeuCau(maYeuCau);
        if (phanHoiList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy đánh giá"));
        }
        
        PhanHoi phanHoi = phanHoiList.get(0);
        
        // Kiểm tra xem phản hồi có phải của sinh viên này không
        if (!phanHoi.getLichSuMuonPhong().getYeuCauMuonPhong().getNguoiMuon().getIdNguoiDung().equals(sinhVien.getNguoiDung().getIdNguoiDung())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new MessageResponse("Bạn không có quyền xem đánh giá này"));
        }
        
        return ResponseEntity.ok(phanHoi);
    }
    
    // 5.2 Cập nhật phản hồi về phòng
    @PutMapping("/phanhoi/{id}")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> updatePhanHoi(@PathVariable Integer id, @RequestBody PhanHoiRequest phanHoiRequest) {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        // Tìm phản hồi theo ID
        Optional<PhanHoi> phanHoiOpt = phanHoiRepository.findById(id);
        if (!phanHoiOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy phản hồi"));
        }
        
        PhanHoi phanHoi = phanHoiOpt.get();
        LichSuMuonPhong lichSuMuonPhong = phanHoi.getLichSuMuonPhong();
        
        // Kiểm tra quyền cập nhật - chỉ người tạo phản hồi mới được cập nhật
        if (!lichSuMuonPhong.getYeuCauMuonPhong().getNguoiMuon().getIdNguoiDung().equals(sinhVien.getNguoiDung().getIdNguoiDung())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new MessageResponse("Bạn không có quyền cập nhật phản hồi này"));
        }
        
        // Cập nhật thông tin phản hồi
        phanHoi.setDanhGia(phanHoiRequest.getDanhGia());
        phanHoi.setNhanXet(phanHoiRequest.getNhanXet());
        phanHoi.setThoiGian(new Date());
        
        phanHoiRepository.save(phanHoi);
        
        return ResponseEntity.ok(new MessageResponse("Cập nhật phản hồi thành công"));
    }
    
    // 6. Gửi thông báo
    @PostMapping("/thongbao")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> guiThongBao(@RequestBody ThongBaoRequest thongBaoRequest) {
        SinhVien sinhVien = getCurrentSinhVien();
        
        ThongBaoGui thongBaoGui = new ThongBaoGui();
        thongBaoGui.setNguoiGui(sinhVien.getNguoiDung());
        thongBaoGui.setTieuDe(thongBaoRequest.getTieuDe());
        thongBaoGui.setNoiDung(thongBaoRequest.getNoiDung());
        thongBaoGui.setThoiGian(new Date());
        
        thongBaoGui = thongBaoGuiRepository.save(thongBaoGui);
        
        int countNguoiNhan = 0;
        
        // Tạo thông báo nhận cho từng người nhận cụ thể
        if (thongBaoRequest.getDanhSachNguoiNhan() != null && !thongBaoRequest.getDanhSachNguoiNhan().isEmpty()) {
            for (String idNguoiNhan : thongBaoRequest.getDanhSachNguoiNhan()) {
                if (idNguoiNhan.equals(sinhVien.getNguoiDung().getIdNguoiDung())) {
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
            
            for (SinhVien sv : danhSachSinhVien) {
                System.out.println("sv.getNguoiDung().getIdNguoiDung():"+sv.getNguoiDung().getIdNguoiDung());
                System.out.println("sinhVien.getNguoiDung().getIdNguoiDung():"+sinhVien.getNguoiDung().getIdNguoiDung());
                if (sv.getNguoiDung().getIdNguoiDung().equals(sinhVien.getNguoiDung().getIdNguoiDung())) {
                    continue;
                }
                ThongBaoNhan thongBaoNhan = new ThongBaoNhan();
                thongBaoNhan.setThongBaoGui(thongBaoGui);
                thongBaoNhan.setNguoiNhan(sv.getNguoiDung());
                thongBaoNhan.setTrangThai(ThongBaoNhan.TrangThai.CHUADOC);
                
                thongBaoNhanRepository.save(thongBaoNhan);
                countNguoiNhan++;
            }
        }
        
        if (countNguoiNhan == 0) {
            thongBaoGuiRepository.delete(thongBaoGui);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse("Không có người nhận nào được thêm vào thông báo"));
        }
        
        return ResponseEntity.ok(new MessageResponse("Đã gửi thông báo thành công cho " + countNguoiNhan + " người nhận"));
    }

    
    // 13. Xem thông báo đã nhận
    @GetMapping("/thongbao/nhan")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> getThongBaoNhan() {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        List<ThongBaoNhan> danhSachThongBao = 
            thongBaoNhanRepository.findByNguoiNhanIdNguoiDungOrderByThongBaoGuiThoiGianDesc(sinhVien.getNguoiDung().getIdNguoiDung());
        
        return ResponseEntity.ok(danhSachThongBao);
    }
    
    // 13.1 Xóa thông báo đã nhận
    @DeleteMapping("/thongbao/{id}")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> xoaThongBao(@PathVariable Integer id) {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        try {
            boolean ketQua = thongBaoService.xoaThongBaoNhan(id, sinhVien.getNguoiDung().getIdNguoiDung());
            
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
    
    // 7.1 Xem danh sách thông báo đã gửi
    @GetMapping("/thongbao/gui")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> getThongBaoGui() {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        List<ThongBaoGui> danhSachThongBaoGoc = 
            thongBaoGuiRepository.findByNguoiGuiIdNguoiDungOrderByThoiGianDesc(sinhVien.getNguoiDung().getIdNguoiDung());
        
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
    
    // 8. Xem danh sách phòng học có thể mượn
    @GetMapping("/danhsachphong")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> getDanhSachPhong() {
        List<Phong> danhSachPhong = phongRepository.findByTrangThaiIn(
            Arrays.asList(Phong.TrangThai.TRONG, Phong.TrangThai.DANGSUDUNG)
        );
        return ResponseEntity.ok(danhSachPhong);
    }
    
    // 9. Xem yêu cầu mượn phòng của mình
    @GetMapping("/yeucaumuonphong")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> getLichSuMuonPhong() {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        List<YeuCauMuonPhong> lichSuMuon = 
            yeuCauMuonPhongRepository.findByNguoiMuonIdNguoiDungOrderByThoiGianMuonDesc(sinhVien.getNguoiDung().getIdNguoiDung());
        
        // Chuyển đổi dữ liệu và thêm trường daMuon vào mỗi yêu cầu
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (YeuCauMuonPhong yeuCau : lichSuMuon) {
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
    
    // 9.1. Xem lịch sử mượn phòng đã trả
    @GetMapping("/lichsu-datra")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> getLichSuDaTra() {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        // Lấy tất cả yêu cầu mượn phòng của sinh viên
        List<YeuCauMuonPhong> yeuCauList = 
            yeuCauMuonPhongRepository.findByNguoiMuonIdNguoiDungOrderByThoiGianMuonDesc(sinhVien.getNguoiDung().getIdNguoiDung());
        
        // Lấy tất cả mã yêu cầu
        List<Integer> maYeuCauList = yeuCauList.stream()
            .map(YeuCauMuonPhong::getMaYeuCau)
            .collect(Collectors.toList());
        
        // Lấy tất cả bản ghi lịch sử mượn phòng
        List<LichSuMuonPhong> lichSuList = new ArrayList<>();
        
        // Thay vì lặp qua từng mã yêu cầu, chúng ta sẽ lấy tất cả bản ghi lịch sử liên quan
        // đến các yêu cầu của sinh viên này
        List<LichSuMuonPhong> allLichSu = lichSuMuonPhongRepository.findAll();
        lichSuList = allLichSu.stream()
            .filter(ls -> {
                // Chỉ giữ lại các bản ghi có liên quan đến yêu cầu của sinh viên này
                return ls.getYeuCauMuonPhong() != null && 
                       maYeuCauList.contains(ls.getYeuCauMuonPhong().getMaYeuCau());
            })
            .sorted((ls1, ls2) -> ls2.getThoiGianMuon().compareTo(ls1.getThoiGianMuon())) // Sắp xếp giảm dần theo thời gian mượn
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
    
    // 10. Kiểm tra trạng thái đánh giá của danh sách yêu cầu
    @PostMapping("/kiemtra-danhgia")
    @PreAuthorize("hasRole('SV') or hasRole('GV')")
    public ResponseEntity<?> kiemTraDanhGia(@RequestBody Map<String, List<Integer>> requestBody) {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        List<Integer> maYeuCauList = requestBody.get("danhSachMaYeuCau");
        if (maYeuCauList == null || maYeuCauList.isEmpty()) {
            return ResponseEntity.ok(new HashMap<>());
        }
        
        // Tìm tất cả đánh giá đã tồn tại
        List<PhanHoi> danhSachPhanHoi = phanHoiRepository.findByYeuCauMuonPhongMaYeuCauIn(maYeuCauList);
        
        // Tạo map để trả về kết quả
        Map<Integer, Boolean> ketQua = new HashMap<>();
        for (Integer maYeuCau : maYeuCauList) {
            ketQua.put(maYeuCau, false);
        }
        
        // Cập nhật các yêu cầu đã có đánh giá
        for (PhanHoi phanHoi : danhSachPhanHoi) {
            ketQua.put(phanHoi.getLichSuMuonPhong().getYeuCauMuonPhong().getMaYeuCau(), true);
        }
        
        return ResponseEntity.ok(ketQua);
    }
    
    // 11. Báo cáo sự cố
    @PostMapping("/baosuco")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> baoSuCo(@RequestBody Map<String, Object> suCoData) {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        // Lấy các thông tin cần thiết từ request
        Integer maYeuCau = suCoData.containsKey("maYeuCau") ? convertToInteger(suCoData.get("maYeuCau")) : null;
        String moTa = (String) suCoData.get("moTa");
        
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
            
            // Kiểm tra xem yêu cầu có thuộc về sinh viên này không
            if (!yeuCau.getNguoiMuon().getIdNguoiDung().equals(sinhVien.getNguoiDung().getIdNguoiDung())) {
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
            logger.log(Level.SEVERE, "Lỗi khi báo cáo sự cố", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Lỗi khi gửi báo cáo sự cố: " + e.getMessage()));
        }
    }
    // Phương thức hỗ trợ chuyển đổi Object sang Integer
    private Integer convertToInteger(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Integer) {
            return (Integer) value;
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    // 12. Xem chi tiết yêu cầu mượn phòng
    @GetMapping("/yeucau/{maYeuCau}")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> getChiTietYeuCau(@PathVariable Integer maYeuCau) {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        Optional<YeuCauMuonPhong> yeuCauOpt = yeuCauMuonPhongRepository.findById(maYeuCau);
        if (!yeuCauOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy yêu cầu mượn phòng"));
        }
        
        YeuCauMuonPhong yeuCau = yeuCauOpt.get();
        
        // Kiểm tra xem yêu cầu có phải của sinh viên này không
        if (!yeuCau.getNguoiMuon().getIdNguoiDung().equals(sinhVien.getNguoiDung().getIdNguoiDung())) {
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

    // Lấy danh sách sinh viên trong lớp của mình
    @GetMapping("/danhsach-lop")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> getDanhSachLop() {
        System.out.println("DEBUG: getDanhSachLop endpoint called");
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("DEBUG: Authenticated user: " + authentication.getName());
        System.out.println("DEBUG: User authorities: " + authentication.getAuthorities());
        
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            System.out.println("DEBUG: Sinh viên not found in database");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        System.out.println("DEBUG: Found sinh viên: " + sinhVien.getMaSV());

        // Lấy lớp của sinh viên hiện tại
        LopHoc lopHoc = sinhVien.getLopHoc();
        if (lopHoc == null) {
            System.out.println("DEBUG: Lớp học not found for sinh viên");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Sinh viên chưa được phân lớp"));
        }
        System.out.println("DEBUG: Found lớp học: " + lopHoc.getMaLop());

        // Lấy danh sách sinh viên trong lớp đó
        List<SinhVien> danhSachSinhVien = sinhVienRepository.findByLopHocMaLop(lopHoc.getMaLop());
        System.out.println("DEBUG: Found " + danhSachSinhVien.size() + " sinh viên in lớp");
        
        // Chuyển đổi dữ liệu trả về
        List<Map<String, Object>> result = danhSachSinhVien.stream()
            .map(sv -> {
                Map<String, Object> sinhVienInfo = new HashMap<>();
                sinhVienInfo.put("maSV", sv.getMaSV());
                sinhVienInfo.put("hoTen", sv.getNguoiDung().getHoTen());
                sinhVienInfo.put("vaiTro", sv.getVaiTro().toString());
                return sinhVienInfo;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
} 
