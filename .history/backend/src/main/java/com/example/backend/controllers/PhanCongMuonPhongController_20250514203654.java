package com.example.backend.controllers;

import com.example.backend.model.PhanCongMuonPhong;
import com.example.backend.model.SinhVien;
import com.example.backend.model.ThoiKhoaBieu;
import com.example.backend.model.NguoiDung;
import com.example.backend.payload.request.PhanCongMuonPhongRequest;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.payload.response.PhanCongMuonPhongResponse;
import com.example.backend.repository.SinhVienRepository;
import com.example.backend.repository.ThoiKhoaBieuRepository;
import com.example.backend.repository.NguoiDungRepository;
import com.example.backend.service.PhanCongMuonPhongService;
import com.example.backend.service.UserDetailsImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/phancong")
public class PhanCongMuonPhongController {

    @Autowired
    private PhanCongMuonPhongService phanCongMuonPhongService;

    @Autowired
    private SinhVienRepository sinhVienRepository;

    @Autowired
    private ThoiKhoaBieuRepository thoiKhoaBieuRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    /**
     * Tạo phân công mượn phòng mới (chỉ dành cho cán bộ lớp)
     */
    @PostMapping
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> taoPhanCong(@Valid @RequestBody PhanCongMuonPhongRequest request) {
        try {
            // Lấy thông tin sinh viên phân công (cán bộ lớp)
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String userId = userDetails.getId();
            
            // Tìm sinh viên từ userId
            Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findByTaiKhoanId(userId);
            if (!nguoiDungOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Không tìm thấy thông tin người dùng"));
            }
            
            String idNguoiDung = nguoiDungOpt.get().getIdNguoiDung();
            SinhVien sinhVien = sinhVienRepository.findByNguoiDungIdNguoiDung(idNguoiDung);
            
            if (sinhVien == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
            }
            
            // Kiểm tra vai trò cán bộ
            if (sinhVien.getVaiTro() != SinhVien.VaiTroSinhVien.CANBO) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Bạn không có quyền phân công mượn phòng"));
            }
            
            // Tạo phân công
            PhanCongMuonPhong phanCong = phanCongMuonPhongService.taoPhanCong(
                sinhVien.getMaSV(),
                request.getMaSVNguoiDuocPhanCong(),
                request.getMaTKB(),
                request.getGhiChu()
            );
            
            return ResponseEntity.ok(new MessageResponse("Phân công mượn phòng thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Lỗi: " + e.getMessage()));
        }
    }

    /**
     * Lấy danh sách phân công của cán bộ lớp
     */
    @GetMapping("/canbo")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> layDanhSachPhanCongCuaCanBo() {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String userId = userDetails.getId();
            System.out.println("DEBUG: layDanhSachPhanCongCuaCanBo - userId: " + userId);
            
            // Tìm sinh viên từ userId
            Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findByTaiKhoanId(userId);
            if (!nguoiDungOpt.isPresent()) {
                System.out.println("DEBUG: Không tìm thấy người dùng có userId: " + userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Không tìm thấy thông tin người dùng"));
            }
            
            String idNguoiDung = nguoiDungOpt.get().getIdNguoiDung();
            System.out.println("DEBUG: idNguoiDung: " + idNguoiDung);
            SinhVien sinhVien = sinhVienRepository.findByNguoiDungIdNguoiDung(idNguoiDung);
            
            if (sinhVien == null) {
                System.out.println("DEBUG: Không tìm thấy sinh viên có idNguoiDung: " + idNguoiDung);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
            }
            
            System.out.println("DEBUG: Sinh viên MaSV: " + sinhVien.getMaSV() + ", VaiTro: " + sinhVien.getVaiTro());
            
            // Kiểm tra vai trò cán bộ
            if (sinhVien.getVaiTro() != SinhVien.VaiTroSinhVien.CANBO) {
                System.out.println("DEBUG: Sinh viên không có vai trò CANBO, vai trò hiện tại: " + sinhVien.getVaiTro());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Bạn không có quyền xem phân công"));
            }
            
            // Lấy danh sách phân công
            List<PhanCongMuonPhong> danhSachPhanCong = phanCongMuonPhongService.layDanhSachPhanCongCuaCanBo(sinhVien.getMaSV());
            List<PhanCongMuonPhongResponse> responseList = chuyenDoiDanhSachPhanCong(danhSachPhanCong);
            System.out.println("DEBUG: Số lượng phân công: " + danhSachPhanCong.size());
            
            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            System.out.println("DEBUG: Exception in layDanhSachPhanCongCuaCanBo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi: " + e.getMessage()));
        }
    }

    /**
     * Lấy danh sách phân công cho sinh viên
     */
    @GetMapping("/sinhvien")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> layDanhSachPhanCongChoSinhVien() {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String userId = userDetails.getId();
            
            // Tìm sinh viên từ userId
            Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findByTaiKhoanId(userId);
            if (!nguoiDungOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Không tìm thấy thông tin người dùng"));
            }
            
            String idNguoiDung = nguoiDungOpt.get().getIdNguoiDung();
            SinhVien sinhVien = sinhVienRepository.findByNguoiDungIdNguoiDung(idNguoiDung);
            
            if (sinhVien == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
            }
            
            // Lấy danh sách phân công
            List<PhanCongMuonPhong> danhSachPhanCong = phanCongMuonPhongService.layDanhSachPhanCongChoSinhVien(sinhVien.getMaSV());
            List<PhanCongMuonPhongResponse> responseList = chuyenDoiDanhSachPhanCong(danhSachPhanCong);
            
            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi: " + e.getMessage()));
        }
    }

    /**
     * Hủy phân công (chỉ dành cho cán bộ lớp)
     */
    @DeleteMapping("/{maPhanCong}")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> huyPhanCong(@PathVariable Integer maPhanCong) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String userId = userDetails.getId();
            
            // Tìm sinh viên từ userId
            Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findByTaiKhoanId(userId);
            if (!nguoiDungOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Không tìm thấy thông tin người dùng"));
            }
            
            String idNguoiDung = nguoiDungOpt.get().getIdNguoiDung();
            SinhVien sinhVien = sinhVienRepository.findByNguoiDungIdNguoiDung(idNguoiDung);
            
            if (sinhVien == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("Không tìm thấy thông tin sinh viên"));
            }
            
            // Kiểm tra vai trò cán bộ
            if (sinhVien.getVaiTro() != SinhVien.VaiTroSinhVien.CANBO) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Bạn không có quyền hủy phân công"));
            }
            
            // Hủy phân công
            phanCongMuonPhongService.huyPhanCong(maPhanCong, sinhVien.getMaSV());
            
            return ResponseEntity.ok(new MessageResponse("Hủy phân công thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Lỗi: " + e.getMessage()));
        }
    }

    /**
     * Cập nhật trạng thái phân công
     */
    @PutMapping("/{maPhanCong}/trangthai")
    @PreAuthorize("hasRole('SV')")
    public ResponseEntity<?> capNhatTrangThaiPhanCong(
            @PathVariable Integer maPhanCong,
            @RequestParam PhanCongMuonPhong.TrangThai trangThai) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String userId = userDetails.getId();
            
            // Cập nhật trạng thái
            PhanCongMuonPhong phanCong = phanCongMuonPhongService.capNhatTrangThai(maPhanCong, trangThai);
            
            return ResponseEntity.ok(new MessageResponse("Cập nhật trạng thái phân công thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Lỗi: " + e.getMessage()));
        }
    }

    /**
     * Chuyển đổi danh sách phân công thành đối tượng response
     */
    private List<PhanCongMuonPhongResponse> chuyenDoiDanhSachPhanCong(List<PhanCongMuonPhong> danhSachPhanCong) {
        List<PhanCongMuonPhongResponse> responseList = new ArrayList<>();
        
        for (PhanCongMuonPhong phanCong : danhSachPhanCong) {
            PhanCongMuonPhongResponse response = new PhanCongMuonPhongResponse();
            
            response.setMaPhanCong(phanCong.getMaPhanCong());
            
            // Thông tin người phân công
            SinhVien nguoiPhanCong = phanCong.getNguoiPhanCong();
            response.setMaSVNguoiPhanCong(nguoiPhanCong.getMaSV());
            response.setTenNguoiPhanCong(nguoiPhanCong.getNguoiDung().getHoTen());
            
            // Thông tin người được phân công
            SinhVien nguoiDuocPhanCong = phanCong.getNguoiDuocPhanCong();
            response.setMaSVNguoiDuocPhanCong(nguoiDuocPhanCong.getMaSV());
            response.setTenNguoiDuocPhanCong(nguoiDuocPhanCong.getNguoiDung().getHoTen());
            
            // Thông tin thời khóa biểu
            ThoiKhoaBieu tkb = phanCong.getThoiKhoaBieu();
            response.setMaTKB(tkb.getMaTKB());
            
            // Thông tin khác
            response.setThoiGianPhanCong(phanCong.getThoiGianPhanCong());
            response.setTrangThai(phanCong.getTrangThai().toString());
            response.setGhiChu(phanCong.getGhiChu());
            
            responseList.add(response);
        }
        
        return responseList;
    }
    
    /**
     * Tính thời gian bắt đầu của tiết học
     */
    private Date tinhThoiGianBatDau(Integer tietBatDau, Date ngayHoc) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(ngayHoc);
        
        // Thiết lập giờ và phút theo tiết học
        switch (tietBatDau) {
            case 1: // Tiết 1: 7:00
                calendar.set(Calendar.HOUR_OF_DAY, 7);
                calendar.set(Calendar.MINUTE, 0);
                break;
            case 2: // Tiết 2: 7:50
                calendar.set(Calendar.HOUR_OF_DAY, 7);
                calendar.set(Calendar.MINUTE, 50);
                break;
            case 3: // Tiết 3: 8:40
                calendar.set(Calendar.HOUR_OF_DAY, 8);
                calendar.set(Calendar.MINUTE, 40);
                break;
            case 4: // Tiết 4: 9:30
                calendar.set(Calendar.HOUR_OF_DAY, 9);
                calendar.set(Calendar.MINUTE, 30);
                break;
            case 5: // Tiết 5: 10:20
                calendar.set(Calendar.HOUR_OF_DAY, 10);
                calendar.set(Calendar.MINUTE, 20);
                break;
            case 6: // Tiết 6: 13:30
                calendar.set(Calendar.HOUR_OF_DAY, 13);
                calendar.set(Calendar.MINUTE, 30);
                break;
            case 7: // Tiết 7: 14:20
                calendar.set(Calendar.HOUR_OF_DAY, 14);
                calendar.set(Calendar.MINUTE, 20);
                break;
            case 8: // Tiết 8: 15:10
                calendar.set(Calendar.HOUR_OF_DAY, 15);
                calendar.set(Calendar.MINUTE, 10);
                break;
            case 9: // Tiết 9: 16:00
                calendar.set(Calendar.HOUR_OF_DAY, 16);
                calendar.set(Calendar.MINUTE, 0);
                break;
            case 10: // Tiết 10: 16:50
                calendar.set(Calendar.HOUR_OF_DAY, 16);
                calendar.set(Calendar.MINUTE, 50);
                break;
            default:
                calendar.set(Calendar.HOUR_OF_DAY, 7);
                calendar.set(Calendar.MINUTE, 0);
                break;
        }
        
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        
        return calendar.getTime();
    }
    
    /**
     * Tính thời gian kết thúc của tiết học
     */
    private Date tinhThoiGianKetThuc(Integer tietKetThuc, Date ngayHoc) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(ngayHoc);
        
        // Thiết lập giờ và phút theo tiết học (mỗi tiết 50 phút)
        switch (tietKetThuc) {
            case 1: // Tiết 1 kết thúc: 7:50
                calendar.set(Calendar.HOUR_OF_DAY, 7);
                calendar.set(Calendar.MINUTE, 50);
                break;
            case 2: // Tiết 2 kết thúc: 8:40
                calendar.set(Calendar.HOUR_OF_DAY, 8);
                calendar.set(Calendar.MINUTE, 40);
                break;
            case 3: // Tiết 3 kết thúc: 9:30
                calendar.set(Calendar.HOUR_OF_DAY, 9);
                calendar.set(Calendar.MINUTE, 30);
                break;
            case 4: // Tiết 4 kết thúc: 10:20
                calendar.set(Calendar.HOUR_OF_DAY, 10);
                calendar.set(Calendar.MINUTE, 20);
                break;
            case 5: // Tiết 5 kết thúc: 11:10
                calendar.set(Calendar.HOUR_OF_DAY, 11);
                calendar.set(Calendar.MINUTE, 10);
                break;
            case 6: // Tiết 6 kết thúc: 14:20
                calendar.set(Calendar.HOUR_OF_DAY, 14);
                calendar.set(Calendar.MINUTE, 20);
                break;
            case 7: // Tiết 7 kết thúc: 15:10
                calendar.set(Calendar.HOUR_OF_DAY, 15);
                calendar.set(Calendar.MINUTE, 10);
                break;
            case 8: // Tiết 8 kết thúc: 16:00
                calendar.set(Calendar.HOUR_OF_DAY, 16);
                calendar.set(Calendar.MINUTE, 0);
                break;
            case 9: // Tiết 9 kết thúc: 16:50
                calendar.set(Calendar.HOUR_OF_DAY, 16);
                calendar.set(Calendar.MINUTE, 50);
                break;
            case 10: // Tiết 10 kết thúc: 17:40
                calendar.set(Calendar.HOUR_OF_DAY, 17);
                calendar.set(Calendar.MINUTE, 40);
                break;
            default:
                calendar.set(Calendar.HOUR_OF_DAY, 17);
                calendar.set(Calendar.MINUTE, 40);
                break;
        }
        
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        
        return calendar.getTime();
    }
} 