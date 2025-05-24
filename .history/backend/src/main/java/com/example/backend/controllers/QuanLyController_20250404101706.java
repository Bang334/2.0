package com.example.backend.controllers;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.NguoiDung;
import com.example.backend.model.QuanLy;
import com.example.backend.model.YeuCauMuonPhong;
import com.example.backend.payload.request.YeuCauMuonPhongRequest;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.repository.NguoiDungRepository;
import com.example.backend.repository.QuanLyRepository;
import com.example.backend.repository.YeuCauMuonPhongRepository;
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
} 