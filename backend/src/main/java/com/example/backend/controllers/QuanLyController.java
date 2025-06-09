package com.example.backend.controllers;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.GiangVien;
import com.example.backend.model.LichSuMuonPhong;
import com.example.backend.model.LopHoc;
import com.example.backend.model.NguoiDung;
import com.example.backend.model.PhanHoi;
import com.example.backend.model.Phong;
import com.example.backend.model.QuanLy;
import com.example.backend.model.Role;
import com.example.backend.model.SinhVien;
import com.example.backend.model.SuCo;
import com.example.backend.model.User;
import com.example.backend.model.YeuCauMuonPhong;
import com.example.backend.payload.request.TaiKhoanRequest;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.repository.GiangVienRepository;
import com.example.backend.repository.LichSuMuonPhongRepository;
import com.example.backend.repository.LopHocRepository;
import com.example.backend.repository.NguoiDungRepository;
import com.example.backend.repository.PhanHoiRepository;
import com.example.backend.repository.PhongRepository;
import com.example.backend.repository.QuanLyRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.SinhVienRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.YeuCauMuonPhongRepository;
import com.example.backend.service.SuCoService;
import com.example.backend.service.ThongBaoService;
import com.example.backend.service.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/quanly")
public class QuanLyController {

    private static final Logger logger = Logger.getLogger(QuanLyController.class.getName());

    @Autowired
    private QuanLyRepository quanLyRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private YeuCauMuonPhongRepository yeuCauMuonPhongRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private SinhVienRepository sinhVienRepository;

    @Autowired
    private GiangVienRepository giangVienRepository;

    @Autowired
    private PhongRepository phongRepository;

    @Autowired
    private PhanHoiRepository phanHoiRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private LopHocRepository lopHocRepository;

    @Autowired
    private LichSuMuonPhongRepository lichSuMuonPhongRepository;

    @Autowired
    private ThongBaoService thongBaoService;

    @Autowired
    private SuCoService suCoService;

    private QuanLy getCurrentQuanLy() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return null;
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String userId = userDetails.getId();

            Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findByTaiKhoanId(userId);
            if (nguoiDungOpt.isPresent()) {
                NguoiDung nguoiDung = nguoiDungOpt.get();
                Optional<QuanLy> quanLyOpt = quanLyRepository.findByNguoiDungIdNguoiDung(nguoiDung.getIdNguoiDung());
                if (quanLyOpt.isPresent()) {
                    return quanLyOpt.get();
                }
            }
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // 1. Lấy danh sách yêu cầu mượn phòng cần duyệt
    @GetMapping("/yeucau/dangxuly")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getDanhSachYeuCauDangXuLy() {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        List<YeuCauMuonPhong> danhSachYeuCau
                = yeuCauMuonPhongRepository.findByTrangThai(YeuCauMuonPhong.TrangThai.DANGXULY);

        return ResponseEntity.ok(danhSachYeuCau);
    }

    // 2. Duyệt yêu cầu mượn phòng
    @PutMapping("/yeucau/duyet/{maYeuCau}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> approveYeuCau(@PathVariable Integer maYeuCau) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<YeuCauMuonPhong> yeuCauOpt = yeuCauMuonPhongRepository.findById(maYeuCau);
        if (!yeuCauOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy yêu cầu mượn phòng"));
        }

        YeuCauMuonPhong yeuCau = yeuCauOpt.get();

        // Kiểm tra trạng thái yêu cầu hiện tại
        if (yeuCau.getTrangThai() != YeuCauMuonPhong.TrangThai.DANGXULY) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Yêu cầu này không ở trạng thái chờ duyệt"));
        }

        // Kiểm tra xung đột với các yêu cầu đã duyệt của phòng
        List<YeuCauMuonPhong> trungLichPhong = yeuCauMuonPhongRepository.kiemTraTrungLichPhongKhiCapNhat(
                yeuCau.getPhong().getMaPhong(),
                yeuCau.getThoiGianMuon(),
                yeuCau.getThoiGianTra(),
                maYeuCau
        );

        List<YeuCauMuonPhong> trungLichDaDuyet = trungLichPhong.stream()
                .filter(yc -> yc.getTrangThai() == YeuCauMuonPhong.TrangThai.DADUYET)
                .collect(Collectors.toList());

        if (!trungLichDaDuyet.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new MessageResponse("Không thể duyệt yêu cầu vì đã có lịch mượn phòng được duyệt trong khoảng thời gian này"));
        }

        // Kiểm tra xung đột với các yêu cầu đã duyệt của người mượn
        List<YeuCauMuonPhong> trungLichNguoiMuon = yeuCauMuonPhongRepository.kiemTraTrungLichNguoiMuonKhiCapNhat(
                yeuCau.getNguoiMuon().getIdNguoiDung(),
                yeuCau.getThoiGianMuon(),
                yeuCau.getThoiGianTra(),
                maYeuCau
        );

        List<YeuCauMuonPhong> trungLichNguoiMuonDaDuyet = trungLichNguoiMuon.stream()
                .filter(yc -> yc.getTrangThai() == YeuCauMuonPhong.TrangThai.DADUYET)
                .collect(Collectors.toList());

        if (!trungLichNguoiMuonDaDuyet.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new MessageResponse("Không thể duyệt yêu cầu vì người mượn đã được duyệt mượn phòng khác trong khoảng thời gian này"));
        }

        // Cập nhật trạng thái yêu cầu
        yeuCau.setTrangThai(YeuCauMuonPhong.TrangThai.DADUYET);
        yeuCau.setNguoiDuyet(quanLy.getNguoiDung());
        yeuCauMuonPhongRepository.save(yeuCau);

        // Phương thức hỗ trợ định dạng thời gian
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm");

        // Gửi thông báo cho người dùng
        String tieuDe = "Yêu cầu mượn phòng đã được duyệt";
        String noiDung = "Yêu cầu mượn phòng " + yeuCau.getPhong().getMaPhong()
                + " từ " + sdf.format(yeuCau.getThoiGianMuon())
                + " đến " + sdf.format(yeuCau.getThoiGianTra())
                + " đã được duyệt. Nếu bạn đến trễ 30 phút yêu cầu này sẽ bị hủy.";

        thongBaoService.guiThongBao(quanLy.getNguoiDung(), tieuDe, noiDung,
                yeuCau.getNguoiMuon().getIdNguoiDung(), null);

        return ResponseEntity.ok(new MessageResponse("Đã duyệt yêu cầu mượn phòng thành công"));
    }

    // 3. Từ chối yêu cầu mượn phòng
    @PutMapping("/yeucau/tuchoi/{maYeuCau}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> tuChoiYeuCau(
            @PathVariable Integer maYeuCau,
            @RequestBody Map<String, String> request) {

        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        String lyDo = request.get("lyDo");
        if (lyDo == null || lyDo.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Cần cung cấp lý do từ chối"));
        }

        Optional<YeuCauMuonPhong> yeuCauOpt = yeuCauMuonPhongRepository.findById(maYeuCau);
        if (!yeuCauOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy yêu cầu mượn phòng"));
        }

        YeuCauMuonPhong yeuCau = yeuCauOpt.get();

        // Kiểm tra nếu yêu cầu không ở trạng thái DANGXULY
        if (yeuCau.getTrangThai() != YeuCauMuonPhong.TrangThai.DANGXULY) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Yêu cầu này đã được xử lý trước đó"));
        }

        // Cập nhật trạng thái, người duyệt và lý do
        yeuCau.setTrangThai(YeuCauMuonPhong.TrangThai.KHONGDUOCDUYET);
        yeuCau.setNguoiDuyet(quanLy.getNguoiDung());
        yeuCau.setLyDo(lyDo);

        yeuCauMuonPhongRepository.save(yeuCau);

        return ResponseEntity.ok(new MessageResponse("Đã từ chối yêu cầu mượn phòng"));
    }

    // 4. Xem chi tiết yêu cầu mượn phòng
    @GetMapping("/yeucau/{maYeuCau}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getChiTietYeuCau(@PathVariable Integer maYeuCau) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<YeuCauMuonPhong> yeuCauOpt = yeuCauMuonPhongRepository.findById(maYeuCau);
        if (!yeuCauOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy yêu cầu mượn phòng"));
        }

        YeuCauMuonPhong yeuCau = yeuCauOpt.get();

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

    // 5. Lấy tất cả các yêu cầu mượn phòng, sắp xếp theo thời gian
    @GetMapping("/yeucau")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getAllYeuCau() {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        List<YeuCauMuonPhong> danhSachYeuCau = yeuCauMuonPhongRepository.findAll();

        // Sắp xếp theo thời gian mượn mới nhất
        danhSachYeuCau.sort((yc1, yc2) -> yc2.getThoiGianMuon().compareTo(yc1.getThoiGianMuon()));

        List<Map<String, Object>> result = new ArrayList<>();

        for (YeuCauMuonPhong yeuCau : danhSachYeuCau) {
            Map<String, Object> yeuCauInfo = new HashMap<>();
            yeuCauInfo.put("maYeuCau", yeuCau.getMaYeuCau());
            yeuCauInfo.put("nguoiMuon", yeuCau.getNguoiMuon().getHoTen());
            yeuCauInfo.put("phong", yeuCau.getPhong().getMaPhong());
            yeuCauInfo.put("viTri", yeuCau.getPhong().getViTri());
            yeuCauInfo.put("loaiPhong", yeuCau.getPhong().getLoaiPhong().toString());
            yeuCauInfo.put("thoiGianMuon", yeuCau.getThoiGianMuon());
            yeuCauInfo.put("thoiGianTra", yeuCau.getThoiGianTra());
            yeuCauInfo.put("mucDich", yeuCau.getMucDich());
            yeuCauInfo.put("trangThai", yeuCau.getTrangThai().toString());

            // Thêm thông tin người duyệt nếu có
            if (yeuCau.getNguoiDuyet() != null) {
                yeuCauInfo.put("nguoiDuyet", yeuCau.getNguoiDuyet().getHoTen());
            } else {
                yeuCauInfo.put("nguoiDuyet", null);
            }

            result.add(yeuCauInfo);
        }

        return ResponseEntity.ok(result);
    }

    // 1. Lấy danh sách tài khoản
    @GetMapping("/taikhoan")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getAllTaiKhoan() {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        List<User> taiKhoanList = userRepository.findAll();
        List<Map<String, Object>> resultList = new ArrayList<>();

        for (User taiKhoan : taiKhoanList) {
            Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findByTaiKhoanId(taiKhoan.getId());
            if (nguoiDungOpt.isPresent()) {
                NguoiDung nguoiDung = nguoiDungOpt.get();
                Map<String, Object> taiKhoanInfo = new HashMap<>();

                taiKhoanInfo.put("id", taiKhoan.getId());
                taiKhoanInfo.put("idNguoiDung", nguoiDung.getIdNguoiDung());
                taiKhoanInfo.put("hoTen", nguoiDung.getHoTen());
                taiKhoanInfo.put("email", nguoiDung.getEmail());
                taiKhoanInfo.put("lienHe", nguoiDung.getLienHe());
                taiKhoanInfo.put("gioiTinh", nguoiDung.getGioiTinh());
                taiKhoanInfo.put("vaiTro", nguoiDung.getVaiTro().getTenVaiTro());
                taiKhoanInfo.put("trangThai", taiKhoan.getTrangThai().toString());
                taiKhoanInfo.put("thoiGianDangNhapCuoi", taiKhoan.getThoiGianDangNhapCuoi());

                resultList.add(taiKhoanInfo);
            }
        }

        return ResponseEntity.ok(resultList);
    }

    // 2. Xem chi tiết tài khoản
    @GetMapping("/taikhoan/{id}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getTaiKhoanById(@PathVariable String id) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<User> taiKhoanOpt = userRepository.findById(id);
        if (!taiKhoanOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy tài khoản"));
        }

        User taiKhoan = taiKhoanOpt.get();
        Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findByTaiKhoanId(id);

        if (!nguoiDungOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin người dùng"));
        }

        NguoiDung nguoiDung = nguoiDungOpt.get();
        Map<String, Object> taiKhoanInfo = new HashMap<>();

        taiKhoanInfo.put("id", taiKhoan.getId());
        taiKhoanInfo.put("idNguoiDung", nguoiDung.getIdNguoiDung());
        taiKhoanInfo.put("hoTen", nguoiDung.getHoTen());
        taiKhoanInfo.put("email", nguoiDung.getEmail());
        taiKhoanInfo.put("lienHe", nguoiDung.getLienHe());
        taiKhoanInfo.put("gioiTinh", nguoiDung.getGioiTinh());
        taiKhoanInfo.put("vaiTro", nguoiDung.getVaiTro().getTenVaiTro());
        taiKhoanInfo.put("trangThai", taiKhoan.getTrangThai().toString());
        taiKhoanInfo.put("thoiGianDangNhapCuoi", taiKhoan.getThoiGianDangNhapCuoi());

        // Thêm thông tin chi tiết dựa trên vai trò
        String vaiTroName = nguoiDung.getVaiTro().getTenVaiTro();
        if ("ROLE_SV".equals(vaiTroName)) {
            SinhVien sinhVien = sinhVienRepository.findByNguoiDungIdNguoiDung(nguoiDung.getIdNguoiDung());
            if (sinhVien != null) {
                taiKhoanInfo.put("maSinhVien", sinhVien.getMaSV());
                taiKhoanInfo.put("lopHoc", sinhVien.getLopHoc() != null ? sinhVien.getLopHoc().getMaLop() : null);
            }
        } else if ("ROLE_GV".equals(vaiTroName)) {
            Optional<GiangVien> giangVienOpt = giangVienRepository.findByNguoiDungIdNguoiDung(nguoiDung.getIdNguoiDung());
            if (giangVienOpt.isPresent()) {
                GiangVien giangVien = giangVienOpt.get();
                taiKhoanInfo.put("maGiangVien", giangVien.getMaGV());
                taiKhoanInfo.put("khoa", giangVien.getKhoa());
            }
        } else if ("ROLE_QL".equals(vaiTroName)) {
            QuanLy quanLyInfo = quanLyRepository.findByNguoiDungIdNguoiDung(nguoiDung.getIdNguoiDung()).orElse(null);
            if (quanLyInfo != null) {
                taiKhoanInfo.put("maQuanLy", quanLyInfo.getMaQL());
            }
        }

        return ResponseEntity.ok(taiKhoanInfo);
    }

    // 3. Thêm tài khoản mới
    @PostMapping("/taikhoan")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> createTaiKhoan(@RequestBody TaiKhoanRequest taiKhoanRequest) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        // Kiểm tra tài khoản đã tồn tại chưa
        if (userRepository.existsById(taiKhoanRequest.getUserId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Tên đăng nhập đã tồn tại"));
        }

        // Kiểm tra email đã tồn tại chưa
        if (nguoiDungRepository.existsByEmail(taiKhoanRequest.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Email đã được sử dụng"));
        }

        String vaiTro = taiKhoanRequest.getVaiTro();
        if (vaiTro != null && vaiTro.startsWith("ROLE_")) {
            vaiTro = vaiTro.replaceFirst("ROLE_", "");
        }

        // Tìm Role
        Optional<Role> roleOpt = roleRepository.findByTenVaiTro(vaiTro);
        if (!roleOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Vai trò không hợp lệ"));
        }

        // Tạo tài khoản User
        User newUser = new User(
                taiKhoanRequest.getUserId(),
                passwordEncoder.encode(taiKhoanRequest.getPassword()),
                User.TrangThai.HoatDong
        );

        userRepository.save(newUser);
        // Tạo NguoiDung
        NguoiDung nguoiDung = new NguoiDung();
        String idNguoiDung = UUID.randomUUID().toString();
        nguoiDung.setIdNguoiDung(idNguoiDung);
        nguoiDung.setHoTen(taiKhoanRequest.getHoTen());
        nguoiDung.setEmail(taiKhoanRequest.getEmail());
        nguoiDung.setLienHe(taiKhoanRequest.getLienHe());
        nguoiDung.setGioiTinh(NguoiDung.GioiTinh.valueOf(taiKhoanRequest.getGioiTinh()));
        nguoiDung.setTaiKhoan(newUser);
        nguoiDung.setVaiTro(roleOpt.get());

        nguoiDungRepository.save(nguoiDung);
        if ("SV".equals(vaiTro)) {
            // Tự động tạo mã sinh viên
            String maSV = generateCode("SV", sinhVienRepository.count());
            SinhVien sinhVien = new SinhVien();
            sinhVien.setMaSV(maSV);
            sinhVien.setNguoiDung(nguoiDung);
            LopHoc lopHoc = lopHocRepository.findById(taiKhoanRequest.getMaLop()).orElse(null);
            lopHoc.setSiSo(lopHoc.getSiSo() + 1);
            lopHocRepository.save(lopHoc);
            sinhVien.setLopHoc(lopHoc);
            sinhVienRepository.save(sinhVien);
        } else if ("GV".equals(vaiTro)) {
            // Tự động tạo mã giảng viên
            String maGV = generateCode("GV", giangVienRepository.count());

            GiangVien giangVien = new GiangVien();
            giangVien.setMaGV(maGV);
            giangVien.setNguoiDung(nguoiDung);
            if (taiKhoanRequest.getKhoa() != null) {
                giangVien.setKhoa(taiKhoanRequest.getKhoa());
            }
            giangVienRepository.save(giangVien);
        } else if ("QL".equals(vaiTro)) {
            // Tự động tạo mã quản lý
            String maQL = generateCode("QL", quanLyRepository.count());

            QuanLy newQuanLy = new QuanLy();
            newQuanLy.setMaQL(maQL);
            newQuanLy.setNguoiDung(nguoiDung);
            quanLyRepository.save(newQuanLy);
        }

        return ResponseEntity.ok(new MessageResponse("Tài khoản đã được tạo thành công"));
    }

    // Hàm tạo mã cho người dùng dựa trên loại và số lượng hiện tại
    private String generateCode(String prefix, long count) {
        // Format số với độ dài 3 chữ số, bắt đầu từ 001
        long nextNumber = count + 1;
        return prefix + String.format("%03d", nextNumber);
    }

    // 4. Cập nhật tài khoản
    @PutMapping("/taikhoan/{id}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> updateTaiKhoan(@PathVariable String id, @RequestBody TaiKhoanRequest taiKhoanRequest) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        // Tìm tài khoản
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy tài khoản"));
        }

        User user = userOpt.get();

        // Tìm người dùng
        Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findByTaiKhoanId(id);
        if (!nguoiDungOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin người dùng"));
        }

        NguoiDung nguoiDung = nguoiDungOpt.get();

        // Cập nhật thông tin người dùng
        if (taiKhoanRequest.getHoTen() != null) {
            nguoiDung.setHoTen(taiKhoanRequest.getHoTen());
        }

        // Kiểm tra email mới nếu có thay đổi
        if (taiKhoanRequest.getEmail() != null && !taiKhoanRequest.getEmail().equals(nguoiDung.getEmail())) {
            if (nguoiDungRepository.existsByEmail(taiKhoanRequest.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Email đã được sử dụng"));
            }
            nguoiDung.setEmail(taiKhoanRequest.getEmail());
        }

        if (taiKhoanRequest.getLienHe() != null) {
            nguoiDung.setLienHe(taiKhoanRequest.getLienHe());
        }

        if (taiKhoanRequest.getGioiTinh() != null) {
            nguoiDung.setGioiTinh(NguoiDung.GioiTinh.valueOf(taiKhoanRequest.getGioiTinh()));
        }

        // Cập nhật mật khẩu nếu có
        if (taiKhoanRequest.getPassword() != null && !taiKhoanRequest.getPassword().isEmpty()) {
            user.setMatKhau(passwordEncoder.encode(taiKhoanRequest.getPassword()));
        }

        // Cập nhật trạng thái nếu có
        if (taiKhoanRequest.getTrangThai() != null) {
            user.setTrangThai(User.TrangThai.valueOf(taiKhoanRequest.getTrangThai()));
        }

        // Lưu thay đổi
        userRepository.save(user);
        nguoiDungRepository.save(nguoiDung);

        // Cập nhật thông tin vai trò cụ thể
        String vaiTroName = nguoiDung.getVaiTro().getTenVaiTro();
        if ("SV".equals(vaiTroName)) {
            SinhVien sinhVien = sinhVienRepository.findByNguoiDungIdNguoiDung(nguoiDung.getIdNguoiDung());
            if (sinhVien != null && taiKhoanRequest.getMaUser() != null) {
                sinhVien.setMaSV(taiKhoanRequest.getMaUser());
                sinhVienRepository.save(sinhVien);
            }
        } else if ("GV".equals(vaiTroName)) {
            Optional<GiangVien> giangVienOpt = giangVienRepository.findByNguoiDungIdNguoiDung(nguoiDung.getIdNguoiDung());
            if (giangVienOpt.isPresent()) {
                GiangVien giangVien = giangVienOpt.get();
                if (taiKhoanRequest.getMaUser() != null) {
                    giangVien.setMaGV(taiKhoanRequest.getMaUser());
                }
                if (taiKhoanRequest.getKhoa() != null) {
                    giangVien.setKhoa(taiKhoanRequest.getKhoa());
                }
                giangVienRepository.save(giangVien);
            }
        } else if ("QL".equals(vaiTroName)) {
            Optional<QuanLy> quanLyInfoOpt = quanLyRepository.findByNguoiDungIdNguoiDung(nguoiDung.getIdNguoiDung());
            if (quanLyInfoOpt.isPresent()) {
                QuanLy quanLyInfo = quanLyInfoOpt.get();
                if (taiKhoanRequest.getMaUser() != null) {
                    quanLyInfo.setMaQL(taiKhoanRequest.getMaUser());
                }
                quanLyRepository.save(quanLyInfo);
            }
        }

        return ResponseEntity.ok(new MessageResponse("Cập nhật tài khoản thành công"));
    }

    // 5. Khóa/Mở khóa tài khoản
    @PutMapping("/taikhoan/{id}/trangthai")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> toggleTaiKhoanStatus(@PathVariable String id, @RequestBody Map<String, String> request) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy tài khoản"));
        }

        User user = userOpt.get();
        String trangThaiStr = request.get("trangThai");

        if (trangThaiStr == null || trangThaiStr.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Trạng thái không được để trống"));
        }

        try {
            User.TrangThai trangThai = User.TrangThai.valueOf(trangThaiStr);
            user.setTrangThai(trangThai);
            userRepository.save(user);

            String message = trangThai == User.TrangThai.HoatDong
                    ? "Tài khoản đã được kích hoạt" : "Tài khoản đã bị khóa";

            return ResponseEntity.ok(new MessageResponse(message));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Trạng thái không hợp lệ"));
        }
    }

    // 6. Xóa tài khoản
    @DeleteMapping("/taikhoan/{id}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> deleteTaiKhoan(@PathVariable String id) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy tài khoản"));
        }

        // Không cho phép xóa tài khoản của chính mình
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        if (userDetails.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Không thể xóa tài khoản của chính mình"));
        }

        // Tìm người dùng để xóa sau
        Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findByTaiKhoanId(id);
        if (nguoiDungOpt.isPresent()) {
            NguoiDung nguoiDung = nguoiDungOpt.get();

            // Xác định và xóa thực thể con dựa trên vai trò
            String vaiTroName = nguoiDung.getVaiTro().getTenVaiTro();
            if ("ROLE_SV".equals(vaiTroName)) {
                SinhVien sinhVien = sinhVienRepository.findByNguoiDungIdNguoiDung(nguoiDung.getIdNguoiDung());
                if (sinhVien != null) {
                    sinhVienRepository.delete(sinhVien);
                }
            } else if ("ROLE_GV".equals(vaiTroName)) {
                Optional<GiangVien> giangVienOpt = giangVienRepository.findByNguoiDungIdNguoiDung(nguoiDung.getIdNguoiDung());
                if (giangVienOpt.isPresent()) {
                    giangVienRepository.delete(giangVienOpt.get());
                }
            } else if ("ROLE_QL".equals(vaiTroName)) {
                Optional<QuanLy> quanLyOpt = quanLyRepository.findByNguoiDungIdNguoiDung(nguoiDung.getIdNguoiDung());
                if (quanLyOpt.isPresent()) {
                    quanLyRepository.delete(quanLyOpt.get());
                }
            }

            // Xóa NguoiDung
            nguoiDungRepository.delete(nguoiDung);
        }

        // Xóa User
        userRepository.deleteById(id);

        return ResponseEntity.ok(new MessageResponse("Tài khoản đã được xóa thành công"));
    }

    // QUẢN LÝ PHÒNG HỌC
    // 1. Lấy danh sách phòng học
    @GetMapping("/phong")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getAllPhong() {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        List<Phong> danhSachPhong = phongRepository.findAll();
        return ResponseEntity.ok(danhSachPhong);
    }

    // 2. Xem chi tiết phòng học
    @GetMapping("/phong/{maPhong}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getPhongById(@PathVariable String maPhong) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<Phong> phongOpt = phongRepository.findById(maPhong);
        if (!phongOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy phòng học"));
        }

        return ResponseEntity.ok(phongOpt.get());
    }

    // 3. Thêm phòng học mới
    @PostMapping("/phong")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> createPhong(@RequestBody Phong phongRequest) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        // Kiểm tra mã phòng đã tồn tại chưa
        if (phongRepository.existsById(phongRequest.getMaPhong())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Mã phòng đã tồn tại"));
        }

        try {
            Phong phong = new Phong(
                    phongRequest.getMaPhong(),
                    phongRequest.getLoaiPhong(),
                    Phong.TrangThai.TRONG, // Mặc định là trống khi tạo mới
                    phongRequest.getSucChua(),
                    phongRequest.getViTri()
            );

            phongRepository.save(phong);
            return ResponseEntity.ok(new MessageResponse("Phòng học đã được tạo thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi tạo phòng học: " + e.getMessage()));
        }
    }

    // 4. Cập nhật phòng học
    @PutMapping("/phong/{maPhong}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> updatePhong(@PathVariable String maPhong, @RequestBody Phong phongRequest) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<Phong> phongOpt = phongRepository.findById(maPhong);
        if (!phongOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy phòng học"));
        }

        Phong phong = phongOpt.get();

        // Cập nhật thông tin phòng
        if (phongRequest.getLoaiPhong() != null) {
            phong.setLoaiPhong(phongRequest.getLoaiPhong());
        }

        if (phongRequest.getTrangThai() != null) {
            phong.setTrangThai(phongRequest.getTrangThai());
        }

        if (phongRequest.getSucChua() != null) {
            phong.setSucChua(phongRequest.getSucChua());
        }

        if (phongRequest.getViTri() != null && !phongRequest.getViTri().isEmpty()) {
            phong.setViTri(phongRequest.getViTri());
        }

        try {
            phongRepository.save(phong);
            return ResponseEntity.ok(new MessageResponse("Phòng học đã được cập nhật thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi cập nhật phòng học: " + e.getMessage()));
        }
    }

    // 5. Xóa phòng học
    @DeleteMapping("/phong/{maPhong}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> deletePhong(@PathVariable String maPhong) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<Phong> phongOpt = phongRepository.findById(maPhong);
        if (!phongOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy phòng học"));
        }

        // Kiểm tra nếu phòng đang được sử dụng
        if (phongOpt.get().getTrangThai() == Phong.TrangThai.DANGSUDUNG) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Không thể xóa phòng đang được sử dụng"));
        }

        try {
            phongRepository.deleteById(maPhong);
            return ResponseEntity.ok(new MessageResponse("Phòng học đã được xóa thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi xóa phòng học: " + e.getMessage()));
        }
    }

    // 6. Cập nhật trạng thái phòng học
    @PutMapping("/phong/{maPhong}/trangthai")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> updatePhongStatus(@PathVariable String maPhong, @RequestBody Map<String, String> request) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<Phong> phongOpt = phongRepository.findById(maPhong);
        if (!phongOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy phòng học"));
        }

        Phong phong = phongOpt.get();
        String trangThaiStr = request.get("trangThai");

        if (trangThaiStr == null || trangThaiStr.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Trạng thái không được để trống"));
        }

        try {
            Phong.TrangThai trangThai = Phong.TrangThai.valueOf(trangThaiStr);
            phong.setTrangThai(trangThai);
            phongRepository.save(phong);

            return ResponseEntity.ok(new MessageResponse("Trạng thái phòng học đã được cập nhật thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Trạng thái không hợp lệ"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi cập nhật trạng thái phòng học: " + e.getMessage()));
        }
    }

    // QUẢN LÝ GIẢNG VIÊN
    // 1. Lấy danh sách giảng viên
    @GetMapping("/giangvien")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getAllGiangVien() {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        List<GiangVien> danhSachGV = giangVienRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (GiangVien gv : danhSachGV) {
            Map<String, Object> giangVienInfo = new HashMap<>();
            giangVienInfo.put("maGV", gv.getMaGV());
            giangVienInfo.put("khoa", gv.getKhoa());

            NguoiDung nguoiDung = gv.getNguoiDung();
            if (nguoiDung != null) {
                giangVienInfo.put("idNguoiDung", nguoiDung.getIdNguoiDung());
                giangVienInfo.put("hoTen", nguoiDung.getHoTen());
                giangVienInfo.put("email", nguoiDung.getEmail());
                giangVienInfo.put("lienHe", nguoiDung.getLienHe());
                giangVienInfo.put("gioiTinh", nguoiDung.getGioiTinh());
                giangVienInfo.put("avatarURL", nguoiDung.getAvatarURL());
            }

            result.add(giangVienInfo);
        }

        return ResponseEntity.ok(result);
    }

    // 2. Xem chi tiết giảng viên
    @GetMapping("/giangvien/{maGV}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getGiangVienById(@PathVariable String maGV) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<GiangVien> giangVienOpt = giangVienRepository.findById(maGV);
        if (!giangVienOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy giảng viên"));
        }

        GiangVien giangVien = giangVienOpt.get();
        Map<String, Object> giangVienInfo = new HashMap<>();
        giangVienInfo.put("maGV", giangVien.getMaGV());
        giangVienInfo.put("khoa", giangVien.getKhoa());

        NguoiDung nguoiDung = giangVien.getNguoiDung();
        if (nguoiDung != null) {
            giangVienInfo.put("idNguoiDung", nguoiDung.getIdNguoiDung());
            giangVienInfo.put("hoTen", nguoiDung.getHoTen());
            giangVienInfo.put("email", nguoiDung.getEmail());
            giangVienInfo.put("lienHe", nguoiDung.getLienHe());
            giangVienInfo.put("gioiTinh", nguoiDung.getGioiTinh());
            giangVienInfo.put("avatarURL", nguoiDung.getAvatarURL());

            User taiKhoan = nguoiDung.getTaiKhoan();
            if (taiKhoan != null) {
                giangVienInfo.put("taiKhoanId", taiKhoan.getId());
                giangVienInfo.put("trangThai", taiKhoan.getTrangThai());
            }
        }

        return ResponseEntity.ok(giangVienInfo);
    }

    // 3. Thêm giảng viên mới
    @PostMapping("/giangvien")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> createGiangVien(@RequestBody Map<String, Object> request) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        // Lấy thông tin từ request
        String maGV = (String) request.get("maGV");
        String hoTen = (String) request.get("hoTen");
        String email = (String) request.get("email");
        String gioiTinh = (String) request.get("gioiTinh");
        String lienHe = (String) request.get("lienHe");
        String khoa = (String) request.get("khoa");

        // Kiểm tra các trường bắt buộc
        if (maGV == null || hoTen == null || email == null || gioiTinh == null || khoa == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Vui lòng cung cấp đầy đủ thông tin bắt buộc"));
        }

        // Kiểm tra mã giảng viên đã tồn tại chưa
        if (giangVienRepository.existsById(maGV)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Mã giảng viên đã tồn tại"));
        }

        // Kiểm tra email đã tồn tại chưa
        if (nguoiDungRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Email đã được sử dụng"));
        }

        try {
            // Tạo tài khoản cho giảng viên (nếu cung cấp)
            String userId = (String) request.get("userId");
            String password = (String) request.get("password");
            User newUser = null;

            if (userId != null && password != null) {
                // Kiểm tra tài khoản đã tồn tại chưa
                if (userRepository.existsById(userId)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new MessageResponse("Tên đăng nhập đã tồn tại"));
                }

                newUser = new User(
                        userId,
                        passwordEncoder.encode(password),
                        User.TrangThai.HoatDong
                );
                userRepository.save(newUser);
            }

            // Tạo người dùng
            NguoiDung nguoiDung = new NguoiDung();
            String idNguoiDung = UUID.randomUUID().toString();
            nguoiDung.setIdNguoiDung(idNguoiDung);
            nguoiDung.setHoTen(hoTen);
            nguoiDung.setEmail(email);
            nguoiDung.setLienHe(lienHe);
            nguoiDung.setGioiTinh(NguoiDung.GioiTinh.valueOf(gioiTinh));

            if (newUser != null) {
                nguoiDung.setTaiKhoan(newUser);
            }

            // Gán vai trò giảng viên
            Optional<Role> roleOpt = roleRepository.findByTenVaiTro("GV");
            if (roleOpt.isPresent()) {
                nguoiDung.setVaiTro(roleOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new MessageResponse("Không tìm thấy vai trò giảng viên"));
            }

            nguoiDungRepository.save(nguoiDung);

            // Tạo giảng viên
            GiangVien giangVien = new GiangVien();
            giangVien.setMaGV(maGV);
            giangVien.setNguoiDung(nguoiDung);
            giangVien.setKhoa(khoa);

            giangVienRepository.save(giangVien);

            return ResponseEntity.ok(new MessageResponse("Giảng viên đã được tạo thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi tạo giảng viên: " + e.getMessage()));
        }
    }

    // 4. Cập nhật giảng viên
    @PutMapping("/giangvien/{maGV}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> updateGiangVien(@PathVariable String maGV, @RequestBody Map<String, Object> request) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<GiangVien> giangVienOpt = giangVienRepository.findById(maGV);
        if (!giangVienOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy giảng viên"));
        }

        GiangVien giangVien = giangVienOpt.get();
        NguoiDung nguoiDung = giangVien.getNguoiDung();

        if (nguoiDung == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin người dùng"));
        }

        // Cập nhật thông tin giảng viên
        String khoa = (String) request.get("khoa");
        if (khoa != null) {
            giangVien.setKhoa(khoa);
        }

        // Cập nhật thông tin người dùng
        String hoTen = (String) request.get("hoTen");
        if (hoTen != null) {
            nguoiDung.setHoTen(hoTen);
        }

        String email = (String) request.get("email");
        if (email != null && !email.equals(nguoiDung.getEmail())) {
            // Kiểm tra email mới đã tồn tại chưa
            if (nguoiDungRepository.existsByEmail(email)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Email đã được sử dụng"));
            }
            nguoiDung.setEmail(email);
        }

        String lienHe = (String) request.get("lienHe");
        if (lienHe != null) {
            nguoiDung.setLienHe(lienHe);
        }

        String gioiTinh = (String) request.get("gioiTinh");
        if (gioiTinh != null) {
            nguoiDung.setGioiTinh(NguoiDung.GioiTinh.valueOf(gioiTinh));
        }

        // Cập nhật tài khoản nếu có
        String password = (String) request.get("password");
        if (password != null && !password.isEmpty()) {
            User taiKhoan = nguoiDung.getTaiKhoan();
            if (taiKhoan != null) {
                taiKhoan.setMatKhau(passwordEncoder.encode(password));
                userRepository.save(taiKhoan);
            }
        }

        // Lưu các thay đổi
        nguoiDungRepository.save(nguoiDung);
        giangVienRepository.save(giangVien);

        return ResponseEntity.ok(new MessageResponse("Cập nhật thông tin giảng viên thành công"));
    }

    // 5. Xóa giảng viên
    @DeleteMapping("/giangvien/{maGV}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> deleteGiangVien(@PathVariable String maGV) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<GiangVien> giangVienOpt = giangVienRepository.findById(maGV);
        if (!giangVienOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy giảng viên"));
        }

        GiangVien giangVien = giangVienOpt.get();
        NguoiDung nguoiDung = giangVien.getNguoiDung();

        try {
            // Xóa giảng viên
            giangVienRepository.delete(giangVien);

            // Xóa người dùng và tài khoản nếu có
            if (nguoiDung != null) {
                User taiKhoan = nguoiDung.getTaiKhoan();

                nguoiDungRepository.delete(nguoiDung);

                if (taiKhoan != null) {
                    userRepository.delete(taiKhoan);
                }
            }

            return ResponseEntity.ok(new MessageResponse("Giảng viên đã được xóa thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi xóa giảng viên: " + e.getMessage()));
        }
    }

    // QUẢN LÝ SINH VIÊN
    // 1. Lấy danh sách sinh viên
    @GetMapping("/sinhvien")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getAllSinhVien() {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        List<SinhVien> danhSachSV = sinhVienRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (SinhVien sv : danhSachSV) {
            Map<String, Object> sinhVienInfo = new HashMap<>();
            sinhVienInfo.put("maSV", sv.getMaSV());
            if (sv.getLopHoc() != null) {
                sinhVienInfo.put("maLop", sv.getLopHoc().getMaLop());
                sinhVienInfo.put("tenLop", sv.getLopHoc().getTenLop());
            } else {
                sinhVienInfo.put("maLop", null);
                sinhVienInfo.put("tenLop", null);
            }

            NguoiDung nguoiDung = sv.getNguoiDung();
            if (nguoiDung != null) {
                sinhVienInfo.put("idNguoiDung", nguoiDung.getIdNguoiDung());
                sinhVienInfo.put("hoTen", nguoiDung.getHoTen());
                sinhVienInfo.put("email", nguoiDung.getEmail());
                sinhVienInfo.put("lienHe", nguoiDung.getLienHe());
                sinhVienInfo.put("gioiTinh", nguoiDung.getGioiTinh());
                sinhVienInfo.put("avatarURL", nguoiDung.getAvatarURL());
            }

            result.add(sinhVienInfo);
        }

        return ResponseEntity.ok(result);
    }

    // 2. Xem chi tiết sinh viên
    @GetMapping("/sinhvien/{maSV}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getSinhVienById(@PathVariable String maSV) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<SinhVien> sinhVienOpt = sinhVienRepository.findById(maSV);
        if (!sinhVienOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy sinh viên"));
        }

        SinhVien sinhVien = sinhVienOpt.get();
        Map<String, Object> sinhVienInfo = new HashMap<>();
        sinhVienInfo.put("maSV", sinhVien.getMaSV());

        if (sinhVien.getLopHoc() != null) {
            sinhVienInfo.put("maLop", sinhVien.getLopHoc().getMaLop());
            sinhVienInfo.put("tenLop", sinhVien.getLopHoc().getTenLop());
        } else {
            sinhVienInfo.put("maLop", null);
            sinhVienInfo.put("tenLop", null);
        }

        NguoiDung nguoiDung = sinhVien.getNguoiDung();
        if (nguoiDung != null) {
            sinhVienInfo.put("idNguoiDung", nguoiDung.getIdNguoiDung());
            sinhVienInfo.put("hoTen", nguoiDung.getHoTen());
            sinhVienInfo.put("email", nguoiDung.getEmail());
            sinhVienInfo.put("lienHe", nguoiDung.getLienHe());
            sinhVienInfo.put("gioiTinh", nguoiDung.getGioiTinh());
            sinhVienInfo.put("avatarURL", nguoiDung.getAvatarURL());

            User taiKhoan = nguoiDung.getTaiKhoan();
            if (taiKhoan != null) {
                sinhVienInfo.put("taiKhoanId", taiKhoan.getId());
                sinhVienInfo.put("trangThai", taiKhoan.getTrangThai());
            }
        }

        return ResponseEntity.ok(sinhVienInfo);
    }

    // 3. Thêm sinh viên mới
    @PostMapping("/sinhvien")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> createSinhVien(@RequestBody Map<String, Object> request) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        // Lấy thông tin từ request
        String maSV = (String) request.get("maSV");
        String hoTen = (String) request.get("hoTen");
        String email = (String) request.get("email");
        String gioiTinh = (String) request.get("gioiTinh");
        String lienHe = (String) request.get("lienHe");
        String maLop = (String) request.get("maLop");
        // Kiểm tra các trường bắt buộc
        if (maSV == null || hoTen == null || email == null || gioiTinh == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Vui lòng cung cấp đầy đủ thông tin bắt buộc"));
        }

        // Kiểm tra mã sinh viên đã tồn tại chưa
        if (sinhVienRepository.existsById(maSV)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Mã sinh viên đã tồn tại"));
        }

        // Kiểm tra email đã tồn tại chưa
        if (nguoiDungRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Email đã được sử dụng"));
        }

        try {
            // Tạo tài khoản cho sinh viên (nếu cung cấp)
            String userId = (String) request.get("userId");
            String password = (String) request.get("password");
            User newUser = null;

            if (userId != null && password != null) {
                // Kiểm tra tài khoản đã tồn tại chưa
                if (userRepository.existsById(userId)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new MessageResponse("Tên đăng nhập đã tồn tại"));
                }

                newUser = new User(
                        userId,
                        passwordEncoder.encode(password),
                        User.TrangThai.HoatDong
                );
                userRepository.save(newUser);
            }

            // Tạo người dùng
            NguoiDung nguoiDung = new NguoiDung();
            String idNguoiDung = UUID.randomUUID().toString();
            nguoiDung.setIdNguoiDung(idNguoiDung);
            nguoiDung.setHoTen(hoTen);
            nguoiDung.setEmail(email);
            nguoiDung.setLienHe(lienHe);
            nguoiDung.setGioiTinh(NguoiDung.GioiTinh.valueOf(gioiTinh));

            if (newUser != null) {
                nguoiDung.setTaiKhoan(newUser);
            }

            // Gán vai trò sinh viên
            Optional<Role> roleOpt = roleRepository.findByTenVaiTro("SV");
            if (roleOpt.isPresent()) {
                nguoiDung.setVaiTro(roleOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new MessageResponse("Không tìm thấy vai trò sinh viên"));
            }

            nguoiDungRepository.save(nguoiDung);

            // Tạo sinh viên
            SinhVien sinhVien = new SinhVien();
            sinhVien.setMaSV(maSV);
            sinhVien.setNguoiDung(nguoiDung);

            // Thêm lớp học nếu cung cấp
            if (maLop != null && !maLop.isEmpty()) {
                Optional<LopHoc> lopHocOpt = lopHocRepository.findById(maLop);
                if (lopHocOpt.isPresent()) {
                    LopHoc lopHoc = lopHocOpt.get();
                    sinhVien.setLopHoc(lopHoc);
                    lopHoc.setSiSo(lopHoc.getSiSo() + 1);
                    lopHocRepository.save(lopHoc);
                }
            }

            sinhVienRepository.save(sinhVien);

            return ResponseEntity.ok(new MessageResponse("Sinh viên đã được tạo thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi tạo sinh viên: " + e.getMessage()));
        }
    }

    // 4. Cập nhật sinh viên
    @PutMapping("/sinhvien/{maSV}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> updateSinhVien(@PathVariable String maSV, @RequestBody Map<String, Object> request) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<SinhVien> sinhVienOpt = sinhVienRepository.findById(maSV);
        if (!sinhVienOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy sinh viên"));
        }

        SinhVien sinhVien = sinhVienOpt.get();
        NguoiDung nguoiDung = sinhVien.getNguoiDung();

        if (nguoiDung == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin người dùng"));
        }

        // Cập nhật thông tin lớp học nếu có
        String maLop = (String) request.get("maLop");
        if (maLop != null) {
            if (sinhVien.getLopHoc() != null) {
                LopHoc oldLopHoc = sinhVien.getLopHoc();
                oldLopHoc.setSiSo(oldLopHoc.getSiSo() - 1);
                lopHocRepository.save(oldLopHoc);
                sinhVien.setLopHoc(null);
            }

            // Cập nhật lớp học mới nếu có
            if (maLop != null && !maLop.isEmpty()) {
                Optional<LopHoc> lopHocOpt = lopHocRepository.findById(maLop);
                if (lopHocOpt.isPresent()) {
                    LopHoc newLopHoc = lopHocOpt.get();
                    sinhVien.setLopHoc(newLopHoc);
                    // Tăng sĩ số lớp học mới
                    newLopHoc.setSiSo(newLopHoc.getSiSo() + 1);
                    lopHocRepository.save(newLopHoc);
                }
            }

        }

        // Cập nhật thông tin người dùng
        String hoTen = (String) request.get("hoTen");
        if (hoTen != null) {
            nguoiDung.setHoTen(hoTen);
        }

        String email = (String) request.get("email");
        if (email != null && !email.equals(nguoiDung.getEmail())) {
            // Kiểm tra email mới đã tồn tại chưa
            if (nguoiDungRepository.existsByEmail(email)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Email đã được sử dụng"));
            }
            nguoiDung.setEmail(email);
        }

        String lienHe = (String) request.get("lienHe");
        if (lienHe != null) {
            nguoiDung.setLienHe(lienHe);
        }

        String gioiTinh = (String) request.get("gioiTinh");
        if (gioiTinh != null) {
            nguoiDung.setGioiTinh(NguoiDung.GioiTinh.valueOf(gioiTinh));
        }

        // Cập nhật tài khoản nếu có
        String password = (String) request.get("password");
        if (password != null && !password.isEmpty()) {
            User taiKhoan = nguoiDung.getTaiKhoan();
            if (taiKhoan != null) {
                taiKhoan.setMatKhau(passwordEncoder.encode(password));
                userRepository.save(taiKhoan);
            }
        }

        // Lưu các thay đổi
        nguoiDungRepository.save(nguoiDung);
        sinhVienRepository.save(sinhVien);

        return ResponseEntity.ok(new MessageResponse("Cập nhật thông tin sinh viên thành công"));
    }

    // 5. Xóa sinh viên
    @DeleteMapping("/sinhvien/{maSV}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> deleteSinhVien(@PathVariable String maSV) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<SinhVien> sinhVienOpt = sinhVienRepository.findById(maSV);
        if (!sinhVienOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy sinh viên"));
        }

        SinhVien sinhVien = sinhVienOpt.get();
        NguoiDung nguoiDung = sinhVien.getNguoiDung();

        try {
            LopHoc lopHoc = sinhVien.getLopHoc();
            lopHoc.setSiSo(lopHoc.getSiSo() - 1);
            lopHocRepository.save(lopHoc);
            sinhVienRepository.delete(sinhVien);

            // Xóa người dùng và tài khoản nếu có
            if (nguoiDung != null) {
                User taiKhoan = nguoiDung.getTaiKhoan();

                nguoiDungRepository.delete(nguoiDung);

                if (taiKhoan != null) {
                    userRepository.delete(taiKhoan);
                }
            }

            return ResponseEntity.ok(new MessageResponse("Sinh viên đã được xóa thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi xóa sinh viên: " + e.getMessage()));
        }
    }

    // Lấy thống kê về tần suất mượn phòng
    @GetMapping("/phong/thongke")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getPhongStatistics() {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        List<Map<String, Object>> result = new ArrayList<>();
        List<Phong> danhSachPhong = phongRepository.findAll();

        for (Phong phong : danhSachPhong) {
            Map<String, Object> phongStats = new HashMap<>();
            phongStats.put("maPhong", phong.getMaPhong());
            phongStats.put("viTri", phong.getViTri());
            phongStats.put("loaiPhong", phong.getLoaiPhong().toString());
            phongStats.put("trangThai", phong.getTrangThai().toString());
            phongStats.put("sucChua", phong.getSucChua());

            // Đếm số lần phòng đã được mượn
            List<YeuCauMuonPhong> yeuCauList = yeuCauMuonPhongRepository.findByPhongMaPhong(phong.getMaPhong());
            int totalBookings = yeuCauList.size();

            // Đếm số lần phòng đã được duyệt mượn
            long approvedBookings = yeuCauList.stream()
                    .filter(yc -> yc.getTrangThai() == YeuCauMuonPhong.TrangThai.DADUYET)
                    .count();

            // Đếm số lần phòng đã bị từ chối mượn
            long rejectedBookings = yeuCauList.stream()
                    .filter(yc -> yc.getTrangThai() == YeuCauMuonPhong.TrangThai.KHONGDUOCDUYET)
                    .count();

            // Đếm số lần phòng còn đang xử lý
            long pendingBookings = yeuCauList.stream()
                    .filter(yc -> yc.getTrangThai() == YeuCauMuonPhong.TrangThai.DANGXULY)
                    .count();

            phongStats.put("totalBookings", totalBookings);
            phongStats.put("approvedBookings", approvedBookings);
            phongStats.put("rejectedBookings", rejectedBookings);
            phongStats.put("pendingBookings", pendingBookings);

            result.add(phongStats);
        }

        // Sắp xếp theo số lần mượn giảm dần
        result.sort((a, b) -> {
            Integer bookingsA = (Integer) a.get("totalBookings");
            Integer bookingsB = (Integer) b.get("totalBookings");
            return bookingsB.compareTo(bookingsA);
        });

        return ResponseEntity.ok(result);
    }

    // Lấy thống kê tần suất sử dụng phòng
    @GetMapping("/phong/thongke-tan-suat")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getPhongTanSuatThongKe(
            @RequestParam(required = false) String loaiThongKe,
            @RequestParam(required = false) String tuNgay,
            @RequestParam(required = false) String denNgay) {

        try {
            // Ghi log bắt đầu xử lý API
            logger.info("Bắt đầu xử lý API thống kê tần suất với loại: " + loaiThongKe + 
                        ", từ ngày: " + tuNgay + ", đến ngày: " + denNgay);
            
            // Lấy thông tin quản lý từ authentication hiện tại
            QuanLy quanLy = getCurrentQuanLy();
            if (quanLy == null) {
                logger.warning("Không tìm thấy thông tin quản lý khi gọi API thống kê tần suất");
                // Trả về dữ liệu rỗng thay vì báo lỗi
                return ResponseEntity.ok(createEmptyStatisticsResponse(loaiThongKe));
            }

            // Mặc định là thống kê theo tuần nếu không chỉ định
            if (loaiThongKe == null) {
                loaiThongKe = "TUAN";
            }

            // Parse date range if provided
            Date fromDate = null;
            Date toDate = null;
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

            try {
                if (tuNgay != null && !tuNgay.isEmpty()) {
                    fromDate = dateFormat.parse(tuNgay);
                }
                if (denNgay != null && !denNgay.isEmpty()) {
                    toDate = dateFormat.parse(denNgay);
                    // Set time to end of day
                    Calendar cal = Calendar.getInstance();
                    cal.setTime(toDate);
                    cal.set(Calendar.HOUR_OF_DAY, 23);
                    cal.set(Calendar.MINUTE, 59);
                    cal.set(Calendar.SECOND, 59);
                    toDate = cal.getTime();
                }
            } catch (Exception e) {
                logger.warning("Lỗi định dạng ngày: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Định dạng ngày không hợp lệ. Sử dụng định dạng yyyy-MM-dd"));
            }

            // Nếu không chỉ định khoảng thời gian, lấy dữ liệu của 12 tháng trở lại
            if (fromDate == null) {
                Calendar cal = Calendar.getInstance();
                cal.add(Calendar.MONTH, -12);
                fromDate = cal.getTime();
                logger.info("Ngày bắt đầu thống kê mặc định (12 tháng trước): " + fromDate);
            }
            if (toDate == null) {
                toDate = new Date(); // Hiện tại
                logger.info("Ngày kết thúc thống kê mặc định (hiện tại): " + toDate);
            }

            // Tạo biến final để sử dụng trong lambda
            final Date finalFromDate = fromDate;
            final Date finalToDate = toDate;

            // Lấy tất cả các phòng
            List<Phong> danhSachPhong = phongRepository.findAll();
            if (danhSachPhong.isEmpty()) {
                logger.warning("Không tìm thấy phòng nào trong hệ thống");
                return ResponseEntity.ok(createEmptyStatisticsResponse(loaiThongKe));
            }

            // Map kết quả
            Map<String, Object> response = new HashMap<>();

            // Thống kê theo từng phòng
            Map<String, Integer> thongKeTheoPhong = new HashMap<>();

            // Dữ liệu theo thời gian
            Map<String, Map<String, Integer>> thongKeTheoThoiGian = new HashMap<>();

            // Xử lý từng phòng
            for (Phong phong : danhSachPhong) {
                String maPhong = phong.getMaPhong();

                // Lấy danh sách yêu cầu đã được duyệt của phòng
                List<YeuCauMuonPhong> yeuCauList = yeuCauMuonPhongRepository.findByPhongMaPhong(maPhong);
                if (yeuCauList == null) {
                    yeuCauList = new ArrayList<>();
                }
                logger.info("Tổng số yêu cầu mượn phòng cho " + maPhong + " (trước lọc): " + yeuCauList.size());

                // Lọc theo trạng thái DADUYET và theo khoảng thời gian
                List<YeuCauMuonPhong> filteredRequests = yeuCauList.stream()
                        .filter(yc -> yc.getTrangThai() == YeuCauMuonPhong.TrangThai.DADUYET
                        && yc.getThoiGianMuon() != null
                        && yc.getThoiGianMuon().after(finalFromDate)
                        && yc.getThoiGianMuon().before(finalToDate))
                        .collect(Collectors.toList());

                logger.info("Số yêu cầu DADUYET trong khoảng thời gian cho " + maPhong + ": " + filteredRequests.size());

                // Cập nhật thống kê theo phòng
                thongKeTheoPhong.put(maPhong, filteredRequests.size());

                // Thống kê theo thời gian
                for (YeuCauMuonPhong yeuCau : filteredRequests) {
                    String timeKey;
                    Calendar cal = Calendar.getInstance();
                    cal.setTime(yeuCau.getThoiGianMuon());

                    if ("TUAN".equals(loaiThongKe)) {
                        // Thống kê theo tuần
                        int tuan = cal.get(Calendar.WEEK_OF_YEAR);
                        int nam = cal.get(Calendar.YEAR);
                        timeKey = nam + "-W" + (tuan < 10 ? "0" + tuan : tuan);
                    } else if ("THANG".equals(loaiThongKe)) {
                        // Thống kê theo tháng
                        int thang = cal.get(Calendar.MONTH) + 1; // Tháng trong Calendar bắt đầu từ 0
                        int nam = cal.get(Calendar.YEAR);
                        timeKey = nam + "-" + (thang < 10 ? "0" + thang : thang);
                    } else if ("NAM".equals(loaiThongKe)) {
                        // Thống kê theo năm
                        int nam = cal.get(Calendar.YEAR);
                        timeKey = String.valueOf(nam);
                    } else {
                        // Mặc định là theo tuần nếu loại không hợp lệ
                        int tuan = cal.get(Calendar.WEEK_OF_YEAR);
                        int nam = cal.get(Calendar.YEAR);
                        timeKey = nam + "-W" + (tuan < 10 ? "0" + tuan : tuan);
                    }

                    // Cập nhật thống kê theo thời gian
                    thongKeTheoThoiGian.putIfAbsent(timeKey, new HashMap<>());
                    Map<String, Integer> phongMap = thongKeTheoThoiGian.get(timeKey);
                    phongMap.put(maPhong, phongMap.getOrDefault(maPhong, 0) + 1);
                }
            }

            // Sắp xếp kết quả theo thời gian
            List<Map<String, Object>> timeSeriesData = new ArrayList<>();
            List<String> timeLabels = new ArrayList<>(thongKeTheoThoiGian.keySet());

            // Kiểm tra nếu không có dữ liệu thời gian, tạo dữ liệu mẫu
            if (timeLabels.isEmpty()) {
                // Tạo ít nhất một nhãn thời gian dựa trên loại thống kê
                Calendar now = Calendar.getInstance();
                if ("TUAN".equals(loaiThongKe)) {
                    int tuan = now.get(Calendar.WEEK_OF_YEAR);
                    int nam = now.get(Calendar.YEAR);
                    timeLabels.add(nam + "-W" + (tuan < 10 ? "0" + tuan : tuan));
                } else if ("THANG".equals(loaiThongKe)) {
                    int thang = now.get(Calendar.MONTH) + 1;
                    int nam = now.get(Calendar.YEAR);
                    timeLabels.add(nam + "-" + (thang < 10 ? "0" + thang : thang));
                } else {
                    timeLabels.add(String.valueOf(now.get(Calendar.YEAR)));
                }
                
                // Tạo dữ liệu trống cho thời gian này
                for (String timeLabel : timeLabels) {
                    thongKeTheoThoiGian.put(timeLabel, new HashMap<>());
                }
            }

            // Sắp xếp nhãn thời gian
            Collections.sort(timeLabels);

            // Tìm danh sách tất cả các phòng đã được mượn
            Set<String> allRooms = new HashSet<>();
            for (Phong phong : danhSachPhong) {
                    allRooms.add(phong.getMaPhong());
            }
            
            // Nếu không có phòng nào được mượn, sử dụng tất cả phòng (điều kiện này giờ ít cần thiết nhưng vẫn giữ lại)
            if (allRooms.isEmpty()) {
                for (Phong phong : danhSachPhong) {
                    allRooms.add(phong.getMaPhong());
                }
            }
            
            List<String> roomList = new ArrayList<>(allRooms);
            Collections.sort(roomList);

            // Tạo dữ liệu chuỗi thời gian
            for (String timeLabel : timeLabels) {
                Map<String, Integer> phongData = thongKeTheoThoiGian.get(timeLabel);
                Map<String, Object> entry = new HashMap<>();
                entry.put("thoiGian", timeLabel);

                // Thêm dữ liệu cho mỗi phòng
                int totalUsage = 0;
                for (String room : roomList) {
                    int usage = phongData.getOrDefault(room, 0);
                    entry.put(room, usage);
                    totalUsage += usage;
                }
                entry.put("tongSoLanMuon", totalUsage);
                timeSeriesData.add(entry);
            }

            // Chuẩn bị dữ liệu cho biểu đồ
            response.put("thongKeTheoPhong", thongKeTheoPhong);
            response.put("thongKeTheoThoiGian", timeSeriesData);
            response.put("danhSachPhong", roomList);
            response.put("nhanThoiGian", timeLabels);
            response.put("loaiThongKe", loaiThongKe);
            response.put("isLimitedData", false); // Thêm dòng này

            logger.info("Hoàn thành xử lý API thống kê tần suất. Số phòng: " + roomList.size() + 
                       ", Số điểm thời gian: " + timeLabels.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Ghi log lỗi và trả về dữ liệu rỗng thay vì báo lỗi
            logger.log(Level.SEVERE, "Lỗi khi xử lý API thống kê tần suất phòng: " + e.getMessage(), e);
            return ResponseEntity.ok(createEmptyStatisticsResponse(loaiThongKe));
        }
    }

    // Phương thức trợ giúp để tạo phản hồi rỗng
    private Map<String, Object> createEmptyStatisticsResponse(String loaiThongKe) {
        if (loaiThongKe == null) {
            loaiThongKe = "TUAN";
        }
        
        Map<String, Object> response = new HashMap<>();
        Map<String, Integer> emptyRoomStats = new HashMap<>();
        List<Map<String, Object>> emptyTimeSeriesData = new ArrayList<>();
        List<String> emptyLabels = new ArrayList<>();
        List<String> emptyRoomList = new ArrayList<>();
        
        // Lấy danh sách phòng nếu có
        try {
            List<Phong> danhSachPhong = phongRepository.findAll();
            if (!danhSachPhong.isEmpty()) {
                for (Phong phong : danhSachPhong) {
                    emptyRoomStats.put(phong.getMaPhong(), 0);
                    emptyRoomList.add(phong.getMaPhong());
                }
            }
        } catch (Exception e) {
            logger.warning("Không thể lấy danh sách phòng cho phản hồi rỗng: " + e.getMessage());
        }
        
        // Tạo nhãn thời gian mẫu
        Calendar now = Calendar.getInstance();
        if ("TUAN".equals(loaiThongKe)) {
            int tuan = now.get(Calendar.WEEK_OF_YEAR);
            int nam = now.get(Calendar.YEAR);
            emptyLabels.add(nam + "-W" + (tuan < 10 ? "0" + tuan : tuan));
        } else if ("THANG".equals(loaiThongKe)) {
            int thang = now.get(Calendar.MONTH) + 1;
            int nam = now.get(Calendar.YEAR);
            emptyLabels.add(nam + "-" + (thang < 10 ? "0" + thang : thang));
        } else {
            emptyLabels.add(String.valueOf(now.get(Calendar.YEAR)));
        }
        
        // Tạo dữ liệu mẫu cho thời gian
        if (!emptyLabels.isEmpty() && !emptyRoomList.isEmpty()) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("thoiGian", emptyLabels.get(0));
            entry.put("tongSoLanMuon", 0);
            
            for (String room : emptyRoomList) {
                entry.put(room, 0);
            }
            
            emptyTimeSeriesData.add(entry);
        }
        
        response.put("thongKeTheoPhong", emptyRoomStats);
        response.put("thongKeTheoThoiGian", emptyTimeSeriesData);
        response.put("danhSachPhong", emptyRoomList);
        response.put("nhanThoiGian", emptyLabels);
        response.put("loaiThongKe", loaiThongKe);
        response.put("isEmptyData", true);
        
        return response;
    }

    // Lấy thống kê về việc trả phòng (đúng hạn/trễ hạn)
    @GetMapping("/yeucau/thongke-tra-phong")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getReturnStatistics() {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        // Lấy danh sách tất cả các yêu cầu đã duyệt
        List<YeuCauMuonPhong> approvedRequests = yeuCauMuonPhongRepository.findByTrangThai(YeuCauMuonPhong.TrangThai.DADUYET);

        // Thống kê tổng quát
        Map<String, Object> generalStats = new HashMap<>();
        int totalApprovedRequests = approvedRequests.size();
        generalStats.put("totalApprovedRequests", totalApprovedRequests);

        // Kiểm tra và đếm số yêu cầu trả phòng đúng hạn/trễ hạn
        // Nếu thời gian trả là trong tương lai thì không tính
        Date currentDate = new Date();

        // Tính tổng số yêu cầu đã đến thời hạn trả
        List<YeuCauMuonPhong> dueRequests = approvedRequests.stream()
                .filter(yc -> yc.getThoiGianTra() != null && yc.getThoiGianTra().before(currentDate))
                .collect(Collectors.toList());

        int totalDueRequests = dueRequests.size();
        generalStats.put("totalDueRequests", totalDueRequests);

        // Đếm số yêu cầu trả đúng hạn (giả định: nếu phòng có trạng thái TRONG thì đã được trả)
        // Trong thực tế, có thể cần thêm trường để đánh dấu đã trả phòng
        List<YeuCauMuonPhong> onTimeReturns = dueRequests.stream()
                .filter(yc -> yc.getPhong().getTrangThai() == Phong.TrangThai.TRONG)
                .collect(Collectors.toList());

        int onTimeCount = onTimeReturns.size();
        generalStats.put("onTimeCount", onTimeCount);

        // Đếm số yêu cầu trả trễ hạn
        List<YeuCauMuonPhong> lateReturns = dueRequests.stream()
                .filter(yc -> yc.getPhong().getTrangThai() != Phong.TrangThai.TRONG)
                .collect(Collectors.toList());

        int lateCount = lateReturns.size();
        generalStats.put("lateCount", lateCount);

        // Tính tỷ lệ phần trăm
        double onTimePercent = totalDueRequests > 0 ? (double) onTimeCount / totalDueRequests * 100 : 0;
        double latePercent = totalDueRequests > 0 ? (double) lateCount / totalDueRequests * 100 : 0;

        generalStats.put("onTimePercent", Math.round(onTimePercent * 100.0) / 100.0); // làm tròn 2 chữ số
        generalStats.put("latePercent", Math.round(latePercent * 100.0) / 100.0);

        // Thống kê người dùng hay trả trễ nhất
        Map<String, Map<String, Object>> userStats = new HashMap<>();

        for (YeuCauMuonPhong yeuCau : dueRequests) {
            NguoiDung nguoiMuon = yeuCau.getNguoiMuon();
            String idNguoiDung = nguoiMuon.getIdNguoiDung();
            String hoTen = nguoiMuon.getHoTen();

            boolean isLate = yeuCau.getPhong().getTrangThai() != Phong.TrangThai.TRONG;

            if (!userStats.containsKey(idNguoiDung)) {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("idNguoiDung", idNguoiDung);
                userInfo.put("hoTen", hoTen);
                userInfo.put("totalRequests", 0);
                userInfo.put("lateReturns", 0);
                userInfo.put("onTimeReturns", 0);
                userStats.put(idNguoiDung, userInfo);
            }

            Map<String, Object> userInfo = userStats.get(idNguoiDung);
            userInfo.put("totalRequests", (int) userInfo.get("totalRequests") + 1);

            if (isLate) {
                userInfo.put("lateReturns", (int) userInfo.get("lateReturns") + 1);
            } else {
                userInfo.put("onTimeReturns", (int) userInfo.get("onTimeReturns") + 1);
            }
        }

        // Chuyển userStats thành danh sách và sắp xếp theo số lần trả trễ
        List<Map<String, Object>> topLateUsers = new ArrayList<>(userStats.values());
        topLateUsers.sort((a, b) -> {
            Integer lateA = (Integer) a.get("lateReturns");
            Integer lateB = (Integer) b.get("lateReturns");
            return lateB.compareTo(lateA); // sắp xếp giảm dần
        });

        // Giới hạn chỉ lấy top 10 người dùng
        if (topLateUsers.size() > 10) {
            topLateUsers = topLateUsers.subList(0, 10);
        }

        // Thống kê phòng hay bị trả trễ nhất
        Map<String, Map<String, Object>> roomStats = new HashMap<>();

        for (YeuCauMuonPhong yeuCau : dueRequests) {
            Phong phong = yeuCau.getPhong();
            String maPhong = phong.getMaPhong();

            boolean isLate = phong.getTrangThai() != Phong.TrangThai.TRONG;

            if (!roomStats.containsKey(maPhong)) {
                Map<String, Object> roomInfo = new HashMap<>();
                roomInfo.put("maPhong", maPhong);
                roomInfo.put("viTri", phong.getViTri());
                roomInfo.put("loaiPhong", phong.getLoaiPhong().toString());
                roomInfo.put("totalRequests", 0);
                roomInfo.put("lateReturns", 0);
                roomInfo.put("onTimeReturns", 0);
                roomStats.put(maPhong, roomInfo);
            }

            Map<String, Object> roomInfo = roomStats.get(maPhong);
            roomInfo.put("totalRequests", (int) roomInfo.get("totalRequests") + 1);

            if (isLate) {
                roomInfo.put("lateReturns", (int) roomInfo.get("lateReturns") + 1);
            } else {
                roomInfo.put("onTimeReturns", (int) roomInfo.get("onTimeReturns") + 1);
            }
        }

        // Chuyển roomStats thành danh sách và sắp xếp theo số lần trả trễ
        List<Map<String, Object>> topLateRooms = new ArrayList<>(roomStats.values());
        topLateRooms.sort((a, b) -> {
            Integer lateA = (Integer) a.get("lateReturns");
            Integer lateB = (Integer) b.get("lateReturns");
            return lateB.compareTo(lateA); // sắp xếp giảm dần
        });

        // Giới hạn chỉ lấy top 10 phòng
        if (topLateRooms.size() > 10) {
            topLateRooms = topLateRooms.subList(0, 10);
        }

        // Tổng hợp kết quả
        Map<String, Object> result = new HashMap<>();
        result.put("generalStats", generalStats);
        result.put("topLateUsers", topLateUsers);
        result.put("topLateRooms", topLateRooms);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/giangvien/thongke")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getLecturerStatistics() {
        try {
            // Lấy thông tin quản lý hiện tại
            QuanLy quanLy = getCurrentQuanLy();
            if (quanLy == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Không tìm thấy thông tin quản lý!"));
            }

            // Lấy danh sách tất cả giảng viên
            List<GiangVien> allLecturers = giangVienRepository.findAll();

            // Kết quả thống kê
            Map<String, Object> result = new HashMap<>();
            result.put("tongSo", allLecturers.size());

            // Thống kê theo khoa
            Map<String, Long> thongKeTheoKhoa = allLecturers.stream()
                    .collect(Collectors.groupingBy(
                            gv -> gv.getKhoa() != null ? gv.getKhoa() : "Chưa phân khoa",
                            Collectors.counting()
                    ));
            result.put("thongKeTheoKhoa", thongKeTheoKhoa);

            // Thống kê giới tính
            Map<String, Long> thongKeGioiTinh = allLecturers.stream()
                    .filter(gv -> gv.getNguoiDung() != null && gv.getNguoiDung().getGioiTinh() != null)
                    .collect(Collectors.groupingBy(
                            gv -> gv.getNguoiDung().getGioiTinh().toString(),
                            Collectors.counting()
                    ));
            result.put("thongKeGioiTinh", thongKeGioiTinh);

            // Thống kê tài khoản
            long daCoTaiKhoan = allLecturers.stream()
                    .filter(gv -> gv.getNguoiDung() != null && gv.getNguoiDung().getTaiKhoan() != null)
                    .count();

            result.put("thongKeTaiKhoan", Map.of(
                    "daCoTaiKhoan", daCoTaiKhoan,
                    "chuaCoTaiKhoan", allLecturers.size() - daCoTaiKhoan,
                    "tyLe", allLecturers.isEmpty() ? 0
                    : Math.round((double) daCoTaiKhoan / allLecturers.size() * 100)
            ));

            // Thống kê mượn phòng cho từng giảng viên
            List<YeuCauMuonPhong> allRequests = yeuCauMuonPhongRepository.findAll();
            Map<String, Integer> giangVienMuonPhongMap = new HashMap<>();

            // Tạo map với key là mã giảng viên, value là số lần mượn phòng
            for (GiangVien gv : allLecturers) {
                if (gv.getNguoiDung() != null) {
                    String idNguoiDung = gv.getNguoiDung().getIdNguoiDung();
                    int count = 0;

                    for (YeuCauMuonPhong yeuCau : allRequests) {
                        if (yeuCau.getNguoiMuon() != null
                                && idNguoiDung.equals(yeuCau.getNguoiMuon().getIdNguoiDung())) {
                            count++;
                        }
                    }

                    giangVienMuonPhongMap.put(gv.getMaGV(), count);
                }
            }

            // Chuyển map thành list để frontend dễ xử lý
            List<Map<String, Object>> thongKeMuonPhong = new ArrayList<>();
            for (GiangVien gv : allLecturers) {
                if (gv.getNguoiDung() != null) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("maGV", gv.getMaGV());
                    item.put("hoTen", gv.getNguoiDung().getHoTen());
                    item.put("khoa", gv.getKhoa());
                    item.put("soLanMuon", giangVienMuonPhongMap.getOrDefault(gv.getMaGV(), 0));
                    thongKeMuonPhong.add(item);
                }
            }

            // Sắp xếp theo số lần mượn giảm dần
            thongKeMuonPhong.sort((a, b)
                    -> Integer.compare((int) b.get("soLanMuon"), (int) a.get("soLanMuon")));

            result.put("thongKeMuonPhong", thongKeMuonPhong);

            // Top 5 giảng viên mượn phòng nhiều nhất
            List<Map<String, Object>> topMuonPhong = thongKeMuonPhong.stream()
                    .limit(5)
                    .collect(Collectors.toList());

            result.put("topMuonPhong", topMuonPhong);

            // Tổng số yêu cầu mượn phòng của giảng viên
            long soYeuCauMuonPhong = allRequests.stream()
                    .filter(req -> {
                        if (req.getNguoiMuon() == null) {
                            return false;
                        }

                        String idNguoiDung = req.getNguoiMuon().getIdNguoiDung();
                        return giangVienRepository.findByNguoiDungIdNguoiDung(idNguoiDung).isPresent();
                    })
                    .count();

            result.put("soYeuCauMuonPhong", soYeuCauMuonPhong);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Lỗi khi lấy thống kê giảng viên", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi lấy thống kê giảng viên: " + e.getMessage()));
        }
    }

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getDashboardStats() {
        try {
            // Lấy thông tin quản lý hiện tại
            QuanLy quanLy = getCurrentQuanLy();
            if (quanLy == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Không tìm thấy thông tin quản lý!"));
            }

            // Lấy các thống kê cần thiết
            Map<String, Object> stats = new HashMap<>();

            // Tổng số phòng
            long totalRooms = phongRepository.count();
            stats.put("totalRooms", totalRooms);

            // Tổng số giảng viên
            long totalLecturers = giangVienRepository.count();
            stats.put("totalLecturers", totalLecturers);

            // Tổng số sinh viên (nếu có)
            long totalStudents = sinhVienRepository.count();
            stats.put("totalStudents", totalStudents);

            // Tổng số người dùng
            long totalUsers = nguoiDungRepository.count();
            stats.put("totalUsers", totalUsers);

            // Số lượng phòng theo trạng thái
            Map<String, Long> roomStatusCounts = new HashMap<>();
            List<Phong> allRooms = phongRepository.findAll();
            for (Phong phong : allRooms) {
                String status = phong.getTrangThai().toString();
                roomStatusCounts.put(
                        status,
                        roomStatusCounts.getOrDefault(status, 0L) + 1
                );
            }
            stats.put("roomStatusCounts", roomStatusCounts);

            // Số lượng yêu cầu mượn phòng đang diễn ra
            List<YeuCauMuonPhong> approvedRequests = yeuCauMuonPhongRepository.findByTrangThai(YeuCauMuonPhong.TrangThai.DADUYET);
            Date now = new Date();
            long activeBookings = approvedRequests.stream()
                    .filter(req -> req.getThoiGianTra() != null && req.getThoiGianTra().after(now))
                    .count();
            stats.put("activeBookings", activeBookings);

            // Số lượng yêu cầu mượn phòng đang chờ duyệt
            long pendingBookings = yeuCauMuonPhongRepository.findByTrangThai(YeuCauMuonPhong.TrangThai.DANGXULY).size();
            stats.put("pendingBookings", pendingBookings);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi lấy thống kê dashboard: " + e.getMessage()));
        }
    }

    @GetMapping("/phong/feedback")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getRoomFeedbackStatistics() {
        try {
            // Lấy thông tin quản lý hiện tại
            QuanLy quanLy = getCurrentQuanLy();
            if (quanLy == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Không tìm thấy thông tin quản lý!"));
            }

            Map<String, Object> result = new HashMap<>();

            // Lấy tất cả phản hồi
            List<PhanHoi> allFeedbacks = phanHoiRepository.findAll();

            // Thông tin tổng quát
            Map<String, Object> generalStats = new HashMap<>();

            // Tính điểm đánh giá trung bình
            double averageRating = 0;
            if (!allFeedbacks.isEmpty()) {
                averageRating = allFeedbacks.stream()
                        .mapToDouble(PhanHoi::getDanhGia)
                        .average()
                        .orElse(0);
            }

            // Tính tỷ lệ đánh giá tích cực (>= 4 điểm)
            int totalFeedbackCount = allFeedbacks.size();
            long positiveCount = allFeedbacks.stream()
                    .filter(f -> f.getDanhGia() >= 4)
                    .count();
            int positivePercentage = totalFeedbackCount > 0
                    ? (int) Math.round((double) positiveCount / totalFeedbackCount * 100)
                    : 0;

            generalStats.put("averageRating", Math.round(averageRating * 10) / 10.0); // Làm tròn 1 chữ số thập phân
            generalStats.put("totalFeedbackCount", totalFeedbackCount);
            generalStats.put("positivePercentage", positivePercentage);
            result.put("generalStats", generalStats);

            // Chuẩn bị danh sách các phòng có đánh giá cao nhất và thấp nhất
            List<Map<String, Object>> topRatedRooms = new ArrayList<>();
            List<Map<String, Object>> lowRatedRooms = new ArrayList<>();

            // Tạo map để theo dõi đánh giá cho mỗi phòng
            Map<Phong, List<Integer>> roomRatings = new HashMap<>();

            // Thu thập dữ liệu đánh giá cho từng phòng
            for (PhanHoi phanHoi : allFeedbacks) {
                try {
                    if (phanHoi.getLichSuMuonPhong() != null
                            && phanHoi.getLichSuMuonPhong().getYeuCauMuonPhong() != null
                            && phanHoi.getLichSuMuonPhong().getYeuCauMuonPhong().getPhong() != null) {

                        Phong phong = phanHoi.getLichSuMuonPhong().getYeuCauMuonPhong().getPhong();
                        if (!roomRatings.containsKey(phong)) {
                            roomRatings.put(phong, new ArrayList<>());
                        }
                        roomRatings.get(phong).add(phanHoi.getDanhGia());
                    }
                } catch (Exception e) {
                    // Bỏ qua các phản hồi có lỗi khi truy cập dữ liệu
                    continue;
                }
            }

            // Tính điểm đánh giá trung bình cho mỗi phòng
            List<Map.Entry<Phong, Double>> roomAverageRatings = roomRatings.entrySet().stream()
                    .map(entry -> {
                        double avgRating = entry.getValue().stream().mapToInt(Integer::intValue).average().orElse(0);
                        return Map.entry(entry.getKey(), avgRating);
                    })
                    .collect(Collectors.toList());

            // Sắp xếp phòng theo điểm đánh giá cao nhất
            List<Map.Entry<Phong, Double>> sortedByHighestRating = new ArrayList<>(roomAverageRatings);
            sortedByHighestRating.sort((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()));

            // Lấy top 3 phòng có đánh giá cao nhất
            for (int i = 0; i < Math.min(3, sortedByHighestRating.size()); i++) {
                Map.Entry<Phong, Double> entry = sortedByHighestRating.get(i);
                Phong phong = entry.getKey();
                Double rating = entry.getValue();
                Long count = (long) roomRatings.get(phong).size();

                Map<String, Object> roomInfo = new HashMap<>();
                roomInfo.put("maPhong", phong.getMaPhong());
                roomInfo.put("viTri", phong.getViTri());
                roomInfo.put("rating", Math.round(rating * 10) / 10.0); // Làm tròn 1 chữ số thập phân
                roomInfo.put("feedbackCount", count);
                topRatedRooms.add(roomInfo);
            }

            // Sắp xếp phòng theo điểm đánh giá thấp nhất
            List<Map.Entry<Phong, Double>> sortedByLowestRating = new ArrayList<>(roomAverageRatings);
            sortedByLowestRating.sort(Comparator.comparingDouble(Map.Entry::getValue));

            // Lấy top 3 phòng có đánh giá thấp nhất
            for (int i = 0; i < Math.min(3, sortedByLowestRating.size()); i++) {
                Map.Entry<Phong, Double> entry = sortedByLowestRating.get(i);
                Phong phong = entry.getKey();
                Double rating = entry.getValue();
                Long count = (long) roomRatings.get(phong).size();

                Map<String, Object> roomInfo = new HashMap<>();
                roomInfo.put("maPhong", phong.getMaPhong());
                roomInfo.put("viTri", phong.getViTri());
                roomInfo.put("rating", Math.round(rating * 10) / 10.0);
                roomInfo.put("feedbackCount", count);
                lowRatedRooms.add(roomInfo);
            }

            // Phản hồi gần đây (top 5)
            List<Map<String, Object>> recentFeedbacks = new ArrayList<>();
            List<PhanHoi> recentFeedbacksData = allFeedbacks.stream()
                    .sorted(Comparator.comparing(PhanHoi::getThoiGian).reversed())
                    .limit(5)
                    .collect(Collectors.toList());

            for (PhanHoi feedback : recentFeedbacksData) {
                try {
                    if (feedback.getLichSuMuonPhong() != null
                            && feedback.getLichSuMuonPhong().getYeuCauMuonPhong() != null
                            && feedback.getLichSuMuonPhong().getYeuCauMuonPhong().getPhong() != null) {

                        Map<String, Object> feedbackInfo = new HashMap<>();
                        // Lấy thông tin phòng từ phản hồi
                        Phong phong = feedback.getLichSuMuonPhong().getYeuCauMuonPhong().getPhong();
                        feedbackInfo.put("maPhong", phong.getMaPhong());
                        feedbackInfo.put("viTri", phong.getViTri());
                        feedbackInfo.put("rating", feedback.getDanhGia());
                        feedbackInfo.put("comment", feedback.getNhanXet());
                        feedbackInfo.put("idPhanHoi", feedback.getIdPhanHoi());

                        // Lấy thông tin người dùng
                        if (feedback.getLichSuMuonPhong().getYeuCauMuonPhong().getNguoiMuon() != null) {
                            NguoiDung nguoiDung = feedback.getLichSuMuonPhong().getYeuCauMuonPhong().getNguoiMuon();
                            feedbackInfo.put("userName", nguoiDung.getHoTen());
                        } else {
                            feedbackInfo.put("userName", "Không xác định");
                        }

                        // Tính số ngày từ thời điểm phản hồi đến hiện tại
                        long diffInMillies = new Date().getTime() - feedback.getThoiGian().getTime();
                        long diffInDays = TimeUnit.DAYS.convert(diffInMillies, TimeUnit.MILLISECONDS);
                        feedbackInfo.put("daysAgo", diffInDays);

                        recentFeedbacks.add(feedbackInfo);
                    }
                } catch (Exception e) {
                    // Bỏ qua phản hồi lỗi
                    continue;
                }
            }

            result.put("topRatedRooms", topRatedRooms);
            result.put("lowRatedRooms", lowRatedRooms);
            result.put("recentFeedbacks", recentFeedbacks);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi lấy thống kê phản hồi: " + e.getMessage()));
        }
    }

    // API lấy danh sách lớp học
    @GetMapping("/lophoc")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getAllLopHoc() {
        try {
            List<LopHoc> lopHocList = lopHocRepository.findAll();
            return ResponseEntity.ok(lopHocList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi lấy danh sách lớp học: " + e.getMessage()));
        }
    }

    @GetMapping("/sinhvien/khonglop")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getSinhVienKhongLop() {
        try {
            // Lấy danh sách sinh viên từ repository
            List<SinhVien> allSinhVien = sinhVienRepository.findAll();

            // Lọc sinh viên chưa có lớp (lopHoc là null)
            List<SinhVien> sinhVienKhongLop = allSinhVien.stream()
                    .filter(sv -> sv.getLopHoc() == null)
                    .collect(Collectors.toList());

            // Convert sang dạng DTO để trả về
            List<Map<String, Object>> result = new ArrayList<>();
            for (SinhVien sv : sinhVienKhongLop) {
                Map<String, Object> svInfo = new HashMap<>();
                svInfo.put("maSV", sv.getMaSV());

                // Lấy thông tin từ NguoiDung nếu có
                NguoiDung nguoiDung = sv.getNguoiDung();
                if (nguoiDung != null) {
                    svInfo.put("hoTen", nguoiDung.getHoTen());
                    svInfo.put("email", nguoiDung.getEmail());
                    svInfo.put("lienHe", nguoiDung.getLienHe());
                    svInfo.put("gioiTinh", nguoiDung.getGioiTinh());
                }

                result.add(svInfo);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi lấy danh sách sinh viên chưa có lớp: " + e.getMessage()));
        }
    }

    // API tạo lớp học mới
    @PostMapping("/lophoc")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> createLopHoc(@RequestBody Map<String, Object> request) {
        try {
            // Đọc thông tin từ request
            String maLop = (String) request.get("maLop");
            String tenLop = (String) request.get("tenLop");
            Integer siSo = 0; // Mặc định là 0

            // Nếu có siSo trong request, lấy giá trị đó
            if (request.containsKey("siSo")) {
                try {
                    siSo = Integer.parseInt(request.get("siSo").toString());
                } catch (NumberFormatException e) {
                    // Nếu siSo không phải số, dùng giá trị mặc định là 0
                    siSo = 0;
                }
            }

            // Kiểm tra dữ liệu đầu vào
            if (maLop == null || maLop.trim().isEmpty() || tenLop == null || tenLop.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Mã lớp và tên lớp không được để trống"));
            }

            // Kiểm tra xem mã lớp đã tồn tại chưa
            if (lopHocRepository.existsById(maLop)) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Mã lớp đã tồn tại"));
            }

            // Tạo lớp học mới
            LopHoc lopHoc = new LopHoc(maLop, tenLop, 0); // Explicitly set siSo to 0 for new classes
            lopHocRepository.save(lopHoc);

            return ResponseEntity.status(HttpStatus.CREATED).body(lopHoc);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi tạo lớp học: " + e.getMessage()));
        }
    }

    // API phân lớp cho sinh viên
    @PostMapping("/sinhvien/phanlop")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> phanLopSinhVien(@RequestBody Map<String, Object> request) {
        try {
            // Đọc thông tin từ request
            String maLop = (String) request.get("maLop");
            @SuppressWarnings("unchecked")
            List<String> maSinhViens = (List<String>) request.get("maSinhViens");

            // Kiểm tra dữ liệu đầu vào
            if (maLop == null || maLop.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Mã lớp không được để trống"));
            }

            if (maSinhViens == null || maSinhViens.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Danh sách sinh viên không được để trống"));
            }

            // Tìm lớp học theo mã
            Optional<LopHoc> lopHocOpt = lopHocRepository.findById(maLop);
            if (!lopHocOpt.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Không tìm thấy lớp học với mã " + maLop));
            }

            LopHoc lopHoc = lopHocOpt.get();

            // Cập nhật sinh viên vào lớp
            int successCount = 0;
            for (String maSV : maSinhViens) {
                try {
                    Optional<SinhVien> sinhVienOpt = sinhVienRepository.findById(maSV);
                    if (sinhVienOpt.isPresent()) {
                        SinhVien sinhVien = sinhVienOpt.get();
                        sinhVien.setLopHoc(lopHoc);
                        sinhVienRepository.save(sinhVien);
                        successCount++;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            // Cập nhật sĩ số lớp học
            lopHoc.setSiSo(lopHoc.getSiSo() + successCount);
            lopHocRepository.save(lopHoc);

            Map<String, Object> response = new HashMap<>();
            response.put("maLop", maLop);
            response.put("tenLop", lopHoc.getTenLop());
            response.put("soLuongSinhVien", maSinhViens.size());
            response.put("soLuongThanhCong", successCount);
            response.put("siSoMoi", lopHoc.getSiSo());
            response.put("message", "Đã phân lớp thành công cho " + successCount + "/" + maSinhViens.size() + " sinh viên");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi phân lớp cho sinh viên: " + e.getMessage()));
        }
    }

    // Thêm endpoint cho chức năng "Cho Mượn"
    @PutMapping("/yeucau/chomuon/{maYeuCau}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> choMuonPhong(@PathVariable Long maYeuCau) {
        QuanLy quanLy = getCurrentQuanLy();
        if (quanLy == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin quản lý"));
        }

        Optional<YeuCauMuonPhong> yeuCauOpt = yeuCauMuonPhongRepository.findById(maYeuCau.intValue());
        if (!yeuCauOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy yêu cầu mượn phòng"));
        }

        YeuCauMuonPhong yeuCau = yeuCauOpt.get();

        // Kiểm tra nếu yêu cầu không ở trạng thái DADUYET
        if (yeuCau.getTrangThai() != YeuCauMuonPhong.TrangThai.DADUYET) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Yêu cầu này chưa được duyệt hoặc đã bị từ chối"));
        }

        // Kiểm tra xem đã có bản ghi lịch sử cho yêu cầu này chưa
        List<LichSuMuonPhong> existingLichSu = lichSuMuonPhongRepository.findByYeuCauMuonPhongMaYeuCau(maYeuCau.intValue());
        if (!existingLichSu.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Đã có bản ghi cho mượn phòng cho yêu cầu này"));
        }

        // Cập nhật trạng thái phòng
        Phong phong = yeuCau.getPhong();
        phong.setTrangThai(Phong.TrangThai.DANGSUDUNG);
        phongRepository.save(phong);

        // Tạo bản ghi mới cho LichSuMuonPhong
        LichSuMuonPhong lichSu = new LichSuMuonPhong();
        lichSu.setYeuCauMuonPhong(yeuCau);
        lichSu.setThoiGianMuon(new Date()); // Thời gian hiện tại
        lichSu.setTrangThaiTra(LichSuMuonPhong.TrangThaiTra.DungHan); // Mặc định là đúng hạn, sẽ được cập nhật khi trả phòng

        lichSuMuonPhongRepository.save(lichSu);

        return ResponseEntity.ok(new MessageResponse("Đã ghi nhận việc cho mượn phòng thành công"));
    }

    // Phương thức lấy danh sách yêu cầu đã cho mượn
    @GetMapping("/yeucau/dachophep")
    public ResponseEntity<List<Integer>> getDanhSachDaChoMuon() {
        try {
            List<LichSuMuonPhong> lichSuList = lichSuMuonPhongRepository.findAll();
            List<Integer> maYeuCauList = lichSuList.stream()
                    .filter(lichSu -> lichSu.getYeuCauMuonPhong() != null)
                    .map(lichSu -> lichSu.getYeuCauMuonPhong().getMaYeuCau())
                    .distinct()
                    .collect(Collectors.toList());

            return ResponseEntity.ok(maYeuCauList);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Lỗi khi lấy danh sách yêu cầu đã cho mượn", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    // API lấy danh sách sự cố
    @GetMapping("/suco")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getAllSuCo() {
        return ResponseEntity.ok(suCoService.getAllSuCo());
    }

    // API lấy danh sách sự cố theo trạng thái
    @GetMapping("/suco/trangthai/{trangThai}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getSuCoByTrangThai(@PathVariable SuCo.TrangThai trangThai) {
        return ResponseEntity.ok(suCoService.getSuCoByTrangThai(trangThai));
    }

    // API cập nhật trạng thái sự cố
    @PutMapping("/suco/{id}/trangthai")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> updateTrangThaiSuCo(
            @PathVariable Integer id,
            @RequestParam SuCo.TrangThai trangThai) {
        return ResponseEntity.ok(suCoService.updateTrangThaiSuCo(id, trangThai));
    }

    // API lấy thống kê sự cố
    @GetMapping("/suco/thongke")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getThongKeSuCo() {
        return ResponseEntity.ok(suCoService.getThongKeSuCo());
    }

    // Lấy tất cả lịch sử mượn phòng
    @GetMapping("/lichsumuon/tatca")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getAllLichSuMuonPhong() {
        try {
            List<LichSuMuonPhong> allLichSu = lichSuMuonPhongRepository.findAll();

            // Sắp xếp theo thời gian mượn giảm dần
            allLichSu.sort((ls1, ls2) -> ls2.getThoiGianMuon().compareTo(ls1.getThoiGianMuon()));

            // Chuyển đổi dữ liệu sang định dạng dễ hiểu hơn
            List<Map<String, Object>> result = allLichSu.stream()
                    .map(ls -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("maLichSu", ls.getMaLichSu());

                        // Thông tin từ YeuCauMuonPhong
                        if (ls.getYeuCauMuonPhong() != null) {
                            map.put("maYeuCau", ls.getYeuCauMuonPhong().getMaYeuCau());

                            // Thông tin phòng
                            if (ls.getYeuCauMuonPhong().getPhong() != null) {
                                map.put("maPhong", ls.getYeuCauMuonPhong().getPhong().getMaPhong());
                                map.put("viTri", ls.getYeuCauMuonPhong().getPhong().getViTri());
                                map.put("loaiPhong", ls.getYeuCauMuonPhong().getPhong().getLoaiPhong().toString());
                            }

                            // Thông tin người mượn
                            if (ls.getYeuCauMuonPhong().getNguoiMuon() != null) {
                                map.put("maNguoiMuon", ls.getYeuCauMuonPhong().getNguoiMuon().getIdNguoiDung());
                                map.put("tenNguoiMuon", ls.getYeuCauMuonPhong().getNguoiMuon().getHoTen());
                                map.put("loaiNguoiMuon", ls.getYeuCauMuonPhong().getNguoiMuon().getVaiTro());
                            }

                            map.put("mucDich", ls.getYeuCauMuonPhong().getMucDich());
                            map.put("thoiGianMuon", ls.getThoiGianMuon());
                            map.put("thoiGianTraDuKien", ls.getYeuCauMuonPhong().getThoiGianTra());
                        }

                        map.put("thoiGianTraThucTe", ls.getThoiGianTraThucTe());
                        map.put("trangThaiTra", ls.getTrangThaiTra().toString());

                        return map;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Lỗi khi lấy lịch sử mượn phòng", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi lấy lịch sử mượn phòng: " + e.getMessage()));
        }
    }

    // Thống kê trả phòng đúng hạn/trễ hạn
    @GetMapping("/lichsumuon/thongke")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> getThongKeTraPhong(
            @RequestParam(required = false) String tuNgay,
            @RequestParam(required = false) String denNgay) {
        try {
            List<LichSuMuonPhong> allLichSu = lichSuMuonPhongRepository.findAll();

            // Lọc những phòng đã được trả (có thoiGianTraThucTe)
            List<LichSuMuonPhong> lichSuDaTra = allLichSu.stream()
                    .filter(ls -> ls.getThoiGianTraThucTe() != null)
                    .collect(Collectors.toList());

            // Tính toán thống kê
            int tongSoLuot = lichSuDaTra.size();
            long dungHan = lichSuDaTra.stream()
                    .filter(ls -> ls.getTrangThaiTra() == LichSuMuonPhong.TrangThaiTra.DungHan)
                    .count();
            long treHan = lichSuDaTra.stream()
                    .filter(ls -> ls.getTrangThaiTra() == LichSuMuonPhong.TrangThaiTra.TreHan)
                    .count();

            // Tính phần trăm
            double phanTramDungHan = tongSoLuot > 0 ? (dungHan * 100.0 / tongSoLuot) : 0;
            double phanTramTreHan = tongSoLuot > 0 ? (treHan * 100.0 / tongSoLuot) : 0;

            // Thống kê theo người mượn
            Map<String, Map<String, Object>> thongKeTheoNguoiMuon = new HashMap<>();

            // Thống kê theo phòng
            Map<String, Map<String, Object>> thongKeTheoPhong = new HashMap<>();

            for (LichSuMuonPhong ls : lichSuDaTra) {
                if (ls.getYeuCauMuonPhong() != null) {
                    // Thống kê theo người mượn
                    NguoiDung nguoiMuon = ls.getYeuCauMuonPhong().getNguoiMuon();
                    if (nguoiMuon != null) {
                        String idNguoiMuon = nguoiMuon.getIdNguoiDung();
                        thongKeTheoNguoiMuon.putIfAbsent(idNguoiMuon, new HashMap<>());
                        Map<String, Object> thongKeNguoi = thongKeTheoNguoiMuon.get(idNguoiMuon);

                        thongKeNguoi.putIfAbsent("tenNguoiMuon", nguoiMuon.getHoTen());
                        thongKeNguoi.putIfAbsent("tongSoLuot", 0);
                        thongKeNguoi.putIfAbsent("dungHan", 0);
                        thongKeNguoi.putIfAbsent("treHan", 0);

                        thongKeNguoi.put("tongSoLuot", (int) thongKeNguoi.get("tongSoLuot") + 1);
                        if (ls.getTrangThaiTra() == LichSuMuonPhong.TrangThaiTra.DungHan) {
                            thongKeNguoi.put("dungHan", (int) thongKeNguoi.get("dungHan") + 1);
                        } else {
                            thongKeNguoi.put("treHan", (int) thongKeNguoi.get("treHan") + 1);
                        }
                    }

                    // Thống kê theo phòng
                    Phong phong = ls.getYeuCauMuonPhong().getPhong();
                    if (phong != null) {
                        String maPhong = phong.getMaPhong();
                        thongKeTheoPhong.putIfAbsent(maPhong, new HashMap<>());
                        Map<String, Object> thongKePhong = thongKeTheoPhong.get(maPhong);

                        thongKePhong.putIfAbsent("viTri", phong.getViTri());
                        thongKePhong.putIfAbsent("tongSoLuot", 0);
                        thongKePhong.putIfAbsent("dungHan", 0);
                        thongKePhong.putIfAbsent("treHan", 0);

                        thongKePhong.put("tongSoLuot", (int) thongKePhong.get("tongSoLuot") + 1);
                        if (ls.getTrangThaiTra() == LichSuMuonPhong.TrangThaiTra.DungHan) {
                            thongKePhong.put("dungHan", (int) thongKePhong.get("dungHan") + 1);
                        } else {
                            thongKePhong.put("treHan", (int) thongKePhong.get("treHan") + 1);
                        }
                    }
                }
            }

            // Chuyển đổi Map thành List để dễ sắp xếp
            List<Map<String, Object>> danhSachTheoNguoiMuon = thongKeTheoNguoiMuon.values().stream()
                    .sorted((a, b) -> ((Integer) b.get("tongSoLuot")).compareTo((Integer) a.get("tongSoLuot")))
                    .collect(Collectors.toList());

            List<Map<String, Object>> danhSachTheoPhong = thongKeTheoPhong.entrySet().stream()
                    .map(entry -> {
                        Map<String, Object> map = entry.getValue();
                        map.put("maPhong", entry.getKey());
                        return map;
                    })
                    .sorted((a, b) -> ((Integer) b.get("tongSoLuot")).compareTo((Integer) a.get("tongSoLuot")))
                    .collect(Collectors.toList());

            // Kết quả tổng hợp
            Map<String, Object> ketQua = new HashMap<>();
            ketQua.put("tongSoLuot", tongSoLuot);
            ketQua.put("dungHan", dungHan);
            ketQua.put("treHan", treHan);
            ketQua.put("phanTramDungHan", phanTramDungHan);
            ketQua.put("phanTramTreHan", phanTramTreHan);
            ketQua.put("thongKeTheoNguoiMuon", danhSachTheoNguoiMuon);
            ketQua.put("thongKeTheoPhong", danhSachTheoPhong);

            return ResponseEntity.ok(ketQua);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Lỗi khi thống kê trả phòng", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi thống kê trả phòng: " + e.getMessage()));
        }
    }
}
