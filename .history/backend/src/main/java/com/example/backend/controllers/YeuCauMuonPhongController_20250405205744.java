package com.example.backend.controllers;

import com.example.backend.model.Phong;
import com.example.backend.model.SinhVien;
import com.example.backend.model.YeuCauMuonPhong;
import com.example.backend.model.YeuCauMuonPhong.TrangThai;
import com.example.backend.payload.request.YeuCauMuonPhongRequest;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.repository.PhongRepository;
import com.example.backend.repository.SinhVienRepository;
import com.example.backend.repository.YeuCauMuonPhongRepository;
import com.example.backend.security.services.UserDetailsImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Optional;

@RestController
@RequestMapping("/api/yeucaumuon")
public class YeuCauMuonPhongController {

    @Autowired
    private YeuCauMuonPhongRepository yeuCauMuonPhongRepository;

    @Autowired
    private SinhVienRepository sinhVienRepository;

    @Autowired
    private PhongRepository phongRepository;

    @PostMapping("/gui")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> guiYeuCauMuonPhong(@RequestBody YeuCauMuonPhongRequest yeuCauRequest) {
        try {
            // Kiểm tra người dùng hiện tại
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String userId = userDetails.getId();
            
            SinhVien sinhVien = sinhVienRepository.findByNguoiDungIdNguoiDung(userId);
            if (sinhVien == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
            }
            
            // Tạo yêu cầu mượn phòng mới
            YeuCauMuonPhong yeuCauMuonPhong = new YeuCauMuonPhong();
            yeuCauMuonPhong.setNguoiMuon(sinhVien.getNguoiDung());
            yeuCauMuonPhong.setTrangThai(TrangThai.DANGXULY);
            yeuCauMuonPhong.setLyDo(yeuCauRequest.getLyDo());
            yeuCauMuonPhong.setMucDich(yeuCauRequest.getMucDich());
            
            // Thiết lập thông tin phòng
            Optional<Phong> phongOptional = phongRepository.findById(yeuCauRequest.getMaPhong());
            if (!phongOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin phòng"));
            }
            
            yeuCauMuonPhong.setPhong(phongOptional.get());
            
            // Thiết lập thời gian
            yeuCauMuonPhong.setThoiGianMuon(yeuCauRequest.getThoiGianMuon());
            yeuCauMuonPhong.setThoiGianTra(yeuCauRequest.getThoiGianTra());
            
            // Lưu yêu cầu vào database
            yeuCauMuonPhongRepository.save(yeuCauMuonPhong);
            
            return ResponseEntity.ok(new MessageResponse("Gửi yêu cầu mượn phòng thành công"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Lỗi khi xử lý yêu cầu: " + e.getMessage()));
        }
    }
} 