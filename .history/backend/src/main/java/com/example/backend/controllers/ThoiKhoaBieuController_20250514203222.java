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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.LopHoc;
import com.example.backend.model.NguoiDung;
import com.example.backend.model.SinhVien;
import com.example.backend.model.ThoiKhoaBieu;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.repository.NguoiDungRepository;
import com.example.backend.repository.SinhVienRepository;
import com.example.backend.repository.ThoiKhoaBieuRepository;
import com.example.backend.service.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/thoikhoabieu")
public class ThoiKhoaBieuController {

    @Autowired
    private ThoiKhoaBieuRepository thoiKhoaBieuRepository;

    @Autowired
    private SinhVienRepository sinhVienRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

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

    // Lấy thời khóa biểu của lớp hiện tại của sinh viên
    @GetMapping("/lop")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> getTimeTableForCurrentClass() {
        System.out.println("DEBUG: getTimeTableForCurrentClass endpoint called");
        
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

        // Lấy thời khóa biểu của lớp
        List<ThoiKhoaBieu> danhSachTKB = thoiKhoaBieuRepository.findByLopHocMaLop(lopHoc.getMaLop());
        System.out.println("DEBUG: Found " + danhSachTKB.size() + " schedule entries for lớp");
        
        // Chuyển đổi dữ liệu trả về
        List<Map<String, Object>> result = danhSachTKB.stream()
            .map(tkb -> {
                Map<String, Object> tkbInfo = new HashMap<>();
                tkbInfo.put("maTKB", tkb.getMaTKB());
                tkbInfo.put("monHoc", Map.of(
                    "maMon", tkb.getMonHoc().getMaMon(),
                    "tenMon", tkb.getMonHoc().getTenMon()
                ));
                tkbInfo.put("lopHoc", Map.of(
                    "maLop", tkb.getLopHoc().getMaLop(),
                    "tenLop", tkb.getLopHoc().getTenLop()
                ));
                tkbInfo.put("phong", Map.of(
                    "maPhong", tkb.getPhong().getMaPhong(),
                    "loaiPhong", tkb.getPhong().getLoaiPhong().toString(),
                    "sucChua", tkb.getPhong().getSucChua()
                ));
                tkbInfo.put("thuTrongTuan", tkb.getThuTrongTuan().toString());
                tkbInfo.put("tietBatDau", tkb.getTietBatDau());
                tkbInfo.put("tietKetThuc", tkb.getTietKetThuc());
                tkbInfo.put("ngayHoc", tkb.getNgayHoc());
                tkbInfo.put("tuan", tkb.getTuan());
                if (tkb.getGiangVien() != null) {
                    tkbInfo.put("giangVien", Map.of(
                        "maGV", tkb.getGiangVien().getMaGV(),
                        "hoTen", tkb.getGiangVien().getNguoiDung().getHoTen()
                    ));
                }
                return tkbInfo;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
} 