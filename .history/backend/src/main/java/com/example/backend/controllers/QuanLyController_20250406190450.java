package com.example.backend.controllers;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;
import java.util.UUID;

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
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.NguoiDung;
import com.example.backend.model.QuanLy;
import com.example.backend.model.YeuCauMuonPhong;
import com.example.backend.model.User;
import com.example.backend.model.Role;
import com.example.backend.model.SinhVien;
import com.example.backend.model.GiangVien;
import com.example.backend.model.Phong;
import com.example.backend.payload.request.YeuCauMuonPhongRequest;
import com.example.backend.payload.request.TaiKhoanRequest;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.repository.NguoiDungRepository;
import com.example.backend.repository.QuanLyRepository;
import com.example.backend.repository.YeuCauMuonPhongRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.SinhVienRepository;
import com.example.backend.repository.GiangVienRepository;
import com.example.backend.repository.PhongRepository;
import com.example.backend.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/quanly")
public class QuanLyController {
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
    private PasswordEncoder passwordEncoder;
    
    private QuanLy getCurrentQuanLy() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
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
        
        List<YeuCauMuonPhong> danhSachYeuCau = 
            yeuCauMuonPhongRepository.findByTrangThai(YeuCauMuonPhong.TrangThai.DANGXULY);
        
        return ResponseEntity.ok(danhSachYeuCau);
    }
    
    // 2. Duyệt yêu cầu mượn phòng
    @PutMapping("/yeucau/duyet/{maYeuCau}")
    @PreAuthorize("hasRole('QL')")
    public ResponseEntity<?> duyetYeuCau(@PathVariable Integer maYeuCau) {
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
        
        // Kiểm tra nếu yêu cầu không ở trạng thái DANGXULY
        if (yeuCau.getTrangThai() != YeuCauMuonPhong.TrangThai.DANGXULY) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse("Yêu cầu này đã được xử lý trước đó"));
        }
        
        // Cập nhật trạng thái và người duyệt
        yeuCau.setTrangThai(YeuCauMuonPhong.TrangThai.DADUYET);
        yeuCau.setNguoiDuyet(quanLy.getNguoiDung());
        
        yeuCauMuonPhongRepository.save(yeuCau);
        
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
                taiKhoanInfo.put("chuyenNganh", giangVien.getKhoa());
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
        
        // Tìm Role
        Optional<Role> roleOpt = roleRepository.findByTenVaiTro(taiKhoanRequest.getVaiTro());
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
        
        // Tạo vai trò cụ thể dựa trên loại tài khoản
        if ("ROLE_SV".equals(taiKhoanRequest.getVaiTro())) {
            SinhVien sinhVien = new SinhVien();
            sinhVien.setMaSV(taiKhoanRequest.getMaUser());
            sinhVien.setNguoiDung(nguoiDung);
            sinhVienRepository.save(sinhVien);
        } else if ("ROLE_GV".equals(taiKhoanRequest.getVaiTro())) {
            GiangVien giangVien = new GiangVien();
            giangVien.setMaGV(taiKhoanRequest.getMaUser());
            giangVien.setNguoiDung(nguoiDung);
            if (taiKhoanRequest.getChuyenNganh() != null) {
                giangVien.setKhoa(taiKhoanRequest.getChuyenNganh());
            }
            giangVienRepository.save(giangVien);
        } else if ("ROLE_QL".equals(taiKhoanRequest.getVaiTro())) {
            QuanLy newQuanLy = new QuanLy();
            newQuanLy.setMaQL(taiKhoanRequest.getMaUser());
            newQuanLy.setNguoiDung(nguoiDung);
            quanLyRepository.save(newQuanLy);
        }
        
        return ResponseEntity.ok(new MessageResponse("Tài khoản đã được tạo thành công"));
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
        if ("ROLE_SV".equals(vaiTroName)) {
            SinhVien sinhVien = sinhVienRepository.findByNguoiDungIdNguoiDung(nguoiDung.getIdNguoiDung());
            if (sinhVien != null && taiKhoanRequest.getMaUser() != null) {
                sinhVien.setMaSV(taiKhoanRequest.getMaUser());
                sinhVienRepository.save(sinhVien);
            }
        } else if ("ROLE_GV".equals(vaiTroName)) {
            Optional<GiangVien> giangVienOpt = giangVienRepository.findByNguoiDungIdNguoiDung(nguoiDung.getIdNguoiDung());
            if (giangVienOpt.isPresent()) {
                GiangVien giangVien = giangVienOpt.get();
                if (taiKhoanRequest.getMaUser() != null) {
                    giangVien.setMaGV(taiKhoanRequest.getMaUser());
                }
                if (taiKhoanRequest.getChuyenNganh() != null) {
                    giangVien.setKhoa(taiKhoanRequest.getChuyenNganh());
                }
                giangVienRepository.save(giangVien);
            }
        } else if ("ROLE_QL".equals(vaiTroName)) {
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
            
            String message = trangThai == User.TrangThai.HoatDong ? 
                "Tài khoản đã được kích hoạt" : "Tài khoản đã bị khóa";
            
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
            Optional<Role> roleOpt = roleRepository.findByTenVaiTro("ROLE_GV");
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
} 