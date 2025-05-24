package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;

import com.example.backend.service.ThongBaoService;
import com.example.backend.service.NguoiDungService;
import com.example.backend.service.LopHocService;
import com.example.backend.security.services.UserDetailsImpl;
import com.example.backend.model.NguoiDung;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.example.backend.exception.ResourceNotFoundException;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ThongBaoController {

    @Autowired
    private ThongBaoService thongBaoService;

    @Autowired
    private NguoiDungService nguoiDungService;

    @Autowired
    private LopHocService lopHocService;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping("/thongbao/gui")
    @PreAuthorize("hasRole('GV') or hasRole('SV')")
    public ResponseEntity<?> getThongBaoGui() {
        return ResponseEntity.ok(thongBaoService.getThongBaoGui(getCurrentUserId()));
    }
    
    @GetMapping("/thongbao/da-gui")
    @PreAuthorize("hasRole('GV') or hasRole('SV')")
    public ResponseEntity<?> getThongBaoDaGui() {
        return ResponseEntity.ok(thongBaoService.getThongBaoDaGui(getCurrentUserId()));
    }
    
    @GetMapping("/thongbao/da-gui/{id}/nguoi-nhan")
    @PreAuthorize("hasRole('GV') or hasRole('SV')")
    public ResponseEntity<?> getNguoiNhanThongBao(@PathVariable Integer id) {
        try {
            String userId = getCurrentUserId();
            System.out.println("API được gọi với ID thông báo: " + id);
            Optional<NguoiDung> nguoiDung = nguoiDungService.findByTaiKhoanId(userId);
            
            if (!nguoiDung.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Không tìm thấy thông tin người dùng");
            }
            
            if (id == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("ID thông báo không hợp lệ");
            }
            
            List<Map<String, Object>> nguoiNhanList = thongBaoService.getNguoiNhanThongBao(id, nguoiDung.get().getIdNguoiDung());
            
            // Tính số người đã đọc
            long soNguoiDaDoc = nguoiNhanList.stream()
                .filter(user -> (boolean) user.get("daDoc"))
                .count();
            
            Map<String, Object> response = new HashMap<>();
            response.put("danhSachNguoiNhan", nguoiNhanList);
            response.put("soNguoiNhan", nguoiNhanList.size());
            response.put("soNguoiDaDoc", soNguoiDaDoc);
            
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            System.out.println("Lỗi ResourceNotFoundException: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            System.out.println("Lỗi Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi lấy danh sách người nhận: " + e.getMessage());
        }
    }

    @GetMapping("/thongbao/nguoinhan")
    @PreAuthorize("hasRole('GV') or hasRole('SV')")
    public ResponseEntity<?> getDanhSachNguoiNhan() {
        Map<String, Object> result = thongBaoService.getDanhSachNguoiNhan();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/thongbao/lophoc")
    @PreAuthorize("hasRole('GV') or hasRole('SV')")
    public ResponseEntity<?> getDanhSachLop() {
        String userId = getCurrentUserId();
        Optional<NguoiDung> nguoiDung = nguoiDungService.findByTaiKhoanId(userId);
        
        if (!nguoiDung.isPresent()) {
            return ResponseEntity.badRequest().body("Không tìm thấy thông tin người dùng");
        }
        
        // Giảng viên sẽ thấy tất cả các lớp
        if (nguoiDung.get().getVaiTro().getTenVaiTro().equals("ROLE_GV")) {
            return ResponseEntity.ok(lopHocService.getAllLopHoc());
        }
        
        // Sinh viên chỉ thấy lớp của mình
        return ResponseEntity.ok(lopHocService.getLopHocOfSinhVien(nguoiDung.get().getIdNguoiDung()));
    }

    @PutMapping("/sinhvien/thongbao/{id}/daDoc")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> danhDauDaDoc(@PathVariable Integer id) {
        thongBaoService.danhDauDaDoc(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/thongbao/gui")
    @PreAuthorize("hasRole('GV') or hasRole('SV')")
    public ResponseEntity<?> guiThongBao(@RequestBody Map<String, Object> request) {
        String userId = getCurrentUserId();
        Optional<NguoiDung> nguoiGui = nguoiDungService.findByTaiKhoanId(userId);
        
        if (!nguoiGui.isPresent()) {
            return ResponseEntity.badRequest().body("Không tìm thấy thông tin người gửi");
        }
        
        String tieuDe = (String) request.get("tieuDe");
        String noiDung = (String) request.get("noiDung");
        String idNguoiNhan = (String) request.get("idNguoiNhan");
        String maLop = (String) request.get("maLop");
        
        return ResponseEntity.ok(thongBaoService.guiThongBao(nguoiGui.get(), tieuDe, noiDung, idNguoiNhan, maLop));
    }
} 