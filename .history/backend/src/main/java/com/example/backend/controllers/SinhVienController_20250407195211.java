package com.example.backend.controllers;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.ArrayList;

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
import com.example.backend.security.services.UserDetailsImpl;
import java.util.Arrays;
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/sinhvien")
public class SinhVienController {
    
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
        List<YeuCauMuonPhong> yeuCauHienTai = yeuCauMuonPhongRepository.findByNguoiMuonAndTrangThaiIn(
            sinhVien.getNguoiDung(),
            Arrays.asList(YeuCauMuonPhong.TrangThai.DADUYET, YeuCauMuonPhong.TrangThai.DANGXULY)
        );

        // Kiểm tra xem có yêu cầu nào chưa có lịch sử mượn không
        boolean coYeuCauChuaCoLichSu = false;
        for (YeuCauMuonPhong yeuCau : yeuCauHienTai) {
            List<LichSuMuonPhong> lichSu = lichSuMuonPhongRepository.findByYeuCauMuonPhong(yeuCau);
            if (lichSu.isEmpty()) {
                coYeuCauChuaCoLichSu = true;
                break;
            }
        }

        if (yeuCauHienTai.size() >= 3 && coYeuCauChuaCoLichSu) {
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
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new MessageResponse("Phòng đã được đăng ký mượn trong khoảng thời gian này"));
        }
        
        // Kiểm tra xung đột với các yêu cầu đã tồn tại của người mượn
        List<YeuCauMuonPhong> trungLichNguoiMuon = yeuCauMuonPhongRepository.kiemTraTrungLichNguoiMuon(
            sinhVien.getNguoiDung().getIdNguoiDung(),
            yeuCauRequest.getThoiGianMuon(),
            yeuCauRequest.getThoiGianTra()
        );
        
        if (!trungLichNguoiMuon.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new MessageResponse("Bạn đã đăng ký mượn phòng trong khoảng thời gian này"));
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

    
    // 7. Xem danh sách thông báo đã nhận
    @GetMapping("/thongbao/nhan")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> getThongBaoNhan() {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        List<ThongBaoNhan> danhSachThongBao = 
            thongBaoNhanRepository.findByNguoiNhanIdNguoiDung(sinhVien.getNguoiDung().getIdNguoiDung());
        
        return ResponseEntity.ok(danhSachThongBao);
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
        List<Phong> danhSachPhong = phongRepository.findAll();
        return ResponseEntity.ok(danhSachPhong);
    }
    
    // 9. Xem lịch sử mượn phòng của mình
    @GetMapping("/lichsumuon")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> getLichSuMuonPhong() {
        SinhVien sinhVien = getCurrentSinhVien();
        if (sinhVien == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
        }
        
        List<YeuCauMuonPhong> lichSuMuon = 
            yeuCauMuonPhongRepository.findByNguoiMuonIdNguoiDung(sinhVien.getNguoiDung().getIdNguoiDung());
        
        return ResponseEntity.ok(lichSuMuon);
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
            yeuCauMuonPhongRepository.findByNguoiMuonIdNguoiDung(sinhVien.getNguoiDung().getIdNguoiDung());
        
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
        Integer maYeuCau = null;
        Integer maLichSu = null;
        String moTa = (String) suCoData.get("moTa");
        
        if (suCoData.containsKey("maYeuCau")) {
            maYeuCau = convertToInteger(suCoData.get("maYeuCau"));
        }
        
        if (suCoData.containsKey("maLichSu")) {
            maLichSu = convertToInteger(suCoData.get("maLichSu"));
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
            
            // Kiểm tra xem yêu cầu có thuộc về sinh viên này không
            if (!yeuCau.getNguoiMuon().getIdNguoiDung().equals(sinhVien.getNguoiDung().getIdNguoiDung())) {
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
            
            // Kiểm tra xem yêu cầu có thuộc về sinh viên này không
            if (!yeuCau.getNguoiMuon().getIdNguoiDung().equals(sinhVien.getNguoiDung().getIdNguoiDung())) {
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
        
        // Tạm thời chỉ trả về thông báo thành công
        return ResponseEntity.ok(new MessageResponse("Đã gửi báo cáo sự cố thành công"));
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
} 
