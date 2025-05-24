package com.example.backend.controllers;

import com.example.backend.model.NguoiDung;
import com.example.backend.model.Phong;
import com.example.backend.model.SinhVien;
import com.example.backend.model.GiangVien;
import com.example.backend.model.YeuCauMuonPhong;
import com.example.backend.model.YeuCauMuonPhong.TrangThai;
import com.example.backend.model.ThoiKhoaBieu;
import com.example.backend.payload.request.YeuCauMuonPhongRequest;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.repository.NguoiDungRepository;
import com.example.backend.repository.PhongRepository;
import com.example.backend.repository.SinhVienRepository;
import com.example.backend.repository.GiangVienRepository;
import com.example.backend.repository.YeuCauMuonPhongRepository;
import com.example.backend.repository.ThoiKhoaBieuRepository;
import com.example.backend.service.UserDetailsImpl;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Calendar;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/yeucaumuon")
public class YeuCauMuonPhongController {

    @Autowired
    private YeuCauMuonPhongRepository yeuCauMuonPhongRepository;

    @Autowired
    private SinhVienRepository sinhVienRepository;

    @Autowired
    private PhongRepository phongRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private ThoiKhoaBieuRepository thoiKhoaBieuRepository;

    @Autowired
    private GiangVienRepository giangVienRepository;

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
                userId,
                yeuCauRequest.getThoiGianMuon(),
                yeuCauRequest.getThoiGianTra()
            );
            
            if (!trungLichNguoiMuon.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new MessageResponse("Bạn đã đăng ký mượn phòng trong khoảng thời gian này"));
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

    @DeleteMapping("/huy/{maYeuCau}")
    @PreAuthorize("hasRole('SV') or hasRole('GV')")
    public ResponseEntity<?> huyYeuCau(@PathVariable Integer maYeuCau) {
        try {
            // Kiểm tra người dùng hiện tại
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String userId = userDetails.getId();
            
            // Lấy idNguoiDung từ userId
            Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findByTaiKhoanId(userId);
            if (!nguoiDungOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thông tin người dùng"));
            }
            String idNguoiDung = nguoiDungOpt.get().getIdNguoiDung();
            
            // Lấy yêu cầu từ database
            Optional<YeuCauMuonPhong> yeuCauOpt = yeuCauMuonPhongRepository.findById(maYeuCau);
            if (!yeuCauOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy yêu cầu mượn phòng"));
            }
            
            YeuCauMuonPhong yeuCau = yeuCauOpt.get();
            if (!yeuCau.getNguoiMuon().getIdNguoiDung().equals(idNguoiDung)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Bạn không có quyền hủy yêu cầu này"));
            }
            
            Date now = new Date();
            if (now.after(yeuCau.getThoiGianMuon())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Không thể hủy yêu cầu đã quá thời gian mượn"));
            }
            
            // Xóa yêu cầu
            yeuCauMuonPhongRepository.delete(yeuCau);
            
            return ResponseEntity.ok(new MessageResponse("Đã hủy yêu cầu mượn phòng thành công"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Lỗi khi xử lý yêu cầu: " + e.getMessage()));
        }
    }   

    @GetMapping("/phongtrong")
    @PreAuthorize("hasRole('SV') or hasRole('GV')")
    public ResponseEntity<?> timPhongTrong(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date thoiGianMuon,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date thoiGianTra,
            @RequestParam(required = false) Integer soChoDat,
            @RequestParam(required = false) String loaiPhong,
            @RequestParam(required = false) String idTaiKhoan) {
        try {
            // Kiểm tra thời gian có hợp lệ không
            if (thoiGianMuon == null || thoiGianTra == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Thời gian mượn và trả không được để trống"));
            }

            if (thoiGianMuon.after(thoiGianTra)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Thời gian mượn phải trước thời gian trả"));
            }
            
            // Convert account ID to user ID if provided
            String idNguoiDung = null;
            if (idTaiKhoan != null && !idTaiKhoan.isEmpty()) {
                Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findByTaiKhoanId(idTaiKhoan);
                if (nguoiDungOpt.isPresent()) {
                    idNguoiDung = nguoiDungOpt.get().getIdNguoiDung();
                    System.out.println("Converted ID: " + idTaiKhoan + " to " + idNguoiDung);
                }
            }
            
            long duration = thoiGianTra.getTime() - thoiGianMuon.getTime();

            // Lấy danh sách tất cả phòng
            List<Phong> danhSachPhong;

            // Lọc theo loại phòng nếu có
            if (loaiPhong != null && !loaiPhong.isEmpty()) {
                try {
                    Phong.LoaiPhong loaiPhongEnum = Phong.LoaiPhong.valueOf(loaiPhong);
                    danhSachPhong = phongRepository.findByLoaiPhong(loaiPhongEnum);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Loại phòng không hợp lệ: " + loaiPhong));
                }
            } else {
                danhSachPhong = phongRepository.findAll();
            }

            // Lọc theo số chỗ ngồi nếu có
            if (soChoDat != null && soChoDat > 0) {
                danhSachPhong.removeIf(phong -> phong.getSucChua() < soChoDat);
            }

            List<Phong> phongTrongList = new ArrayList<>();
            for (Phong phong : danhSachPhong) {
                // Kiểm tra trùng với yêu cầu mượn phòng
                List<YeuCauMuonPhong> trungLichPhong = yeuCauMuonPhongRepository.kiemTraTrungLichPhong(
                        phong.getMaPhong(), thoiGianMuon, thoiGianTra);
                if (trungLichPhong.isEmpty() && phong.getTrangThai() != Phong.TrangThai.BAOTRI) {
                    // Kiểm tra trùng với thời khóa biểu
                    List<ThoiKhoaBieu> tkbList = thoiKhoaBieuRepository.findByPhongAndNgayHoc(phong, thoiGianMuon);
                    boolean isConflict = false;
                    
                    // Get user information to check for exceptions
                    SinhVien sinhVien = null;
                    GiangVien giangVien = null;
                    if (idNguoiDung != null && !idNguoiDung.isEmpty()) {
                        sinhVien = sinhVienRepository.findByNguoiDungIdNguoiDung(idNguoiDung);
                        Optional<GiangVien> giangVienOpt = giangVienRepository.findByNguoiDungIdNguoiDung(idNguoiDung);
                        if (giangVienOpt.isPresent()) {
                            giangVien = giangVienOpt.get();
                        }
                    }
                    for (ThoiKhoaBieu tkb : tkbList) {
                        Date tkbStart = getThoiGianBatDauFromTiet(tkb.getTietBatDau(), tkb.getNgayHoc());
                        Date tkbEnd = getThoiGianKetThucFromTiet(tkb.getTietKetThuc(), tkb.getNgayHoc());
                        if (thoiGianMuon.before(tkbEnd) && thoiGianTra.after(tkbStart)) {
                            // Check if this is the student's own class
                            if (sinhVien != null && tkb.getLopHoc() != null && sinhVien.getLopHoc() != null 
                                && tkb.getLopHoc().getMaLop().equals(sinhVien.getLopHoc().getMaLop())) {
                                // This is student's own class, no conflict
                                continue;
                            }
                            // Check if this is the lecturer's own teaching schedule
                            if (giangVien != null && tkb.getGiangVien() != null 
                                && tkb.getGiangVien().getMaGV().equals(giangVien.getMaGV())) {
                                // This is lecturer's own teaching schedule, no conflict
                                continue;
                            }
                            
                            // If we reach here, there's a conflict
                            isConflict = true;
                            break;
                        }
                    }
                    if (!isConflict) {
                        phongTrongList.add(phong);
                    }
                }
            }

            // Nếu có phòng trống, trả về danh sách phòng trống
            if (!phongTrongList.isEmpty()) {
                return ResponseEntity.ok(
                        java.util.Map.of(
                                "phongTrongList", phongTrongList,
                                "goiYPhongGanNhat", Collections.emptyList()
                        )
                );
            }

            List<Map<String, Object>> goiYPhongGanNhat = new ArrayList<>();

            // Xác định khoảng thời gian rộng hơn (từ 7h sáng đến 22h tối)
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(thoiGianMuon);
            calendar.set(Calendar.HOUR_OF_DAY, 7);
            calendar.set(Calendar.MINUTE, 0);
            calendar.set(Calendar.SECOND, 0);
            Date startOfDay = calendar.getTime();
            
            calendar.set(Calendar.HOUR_OF_DAY, 22);
            calendar.set(Calendar.MINUTE, 0);
            calendar.set(Calendar.SECOND, 0);
            Date endOfDay = calendar.getTime();
            
            for (Phong phong : danhSachPhong) {
                if (phong.getTrangThai() == Phong.TrangThai.BAOTRI) {
                    continue;
                }
            
                // Lấy danh sách yêu cầu mượn phòng và thời khóa biểu trong ngày
                List<YeuCauMuonPhong> yeuCauList = yeuCauMuonPhongRepository.findByPhongAndTrangThaiAndThoiGianMuonBetween(
                        phong, startOfDay, endOfDay);
                List<ThoiKhoaBieu> tkbList = thoiKhoaBieuRepository.findByPhongAndNgayHoc(phong, thoiGianMuon);
                List<Map<String, Date>> busyIntervals = new ArrayList<>();
                
                // Add all room booking requests to busy intervals
                for (YeuCauMuonPhong yeuCau : yeuCauList) {
                    Map<String, Date> interval = new HashMap<>();
                    interval.put("start", yeuCau.getThoiGianMuon());
                    interval.put("end", yeuCau.getThoiGianTra());
                    busyIntervals.add(interval);
                }
                
                // Get user information to check for exceptions
                SinhVien sinhVien = null;
                GiangVien giangVien = null;
                
                if (idNguoiDung != null && !idNguoiDung.isEmpty()) {
                    // Check if user is a student
                    sinhVien = sinhVienRepository.findByNguoiDungIdNguoiDung(idNguoiDung);
                    
                    // Check if user is a lecturer
                    Optional<GiangVien> giangVienOpt = giangVienRepository.findByNguoiDungIdNguoiDung(idNguoiDung);
                    if (giangVienOpt.isPresent()) {
                        giangVien = giangVienOpt.get();
                    }
                }
                
                // Add class schedules to busy intervals, skipping the user's own classes
                for (ThoiKhoaBieu tkb : tkbList) {
                    // Check if this is the student's own class
                    if (sinhVien != null && tkb.getLopHoc() != null && sinhVien.getLopHoc() != null 
                        && tkb.getLopHoc().getMaLop().equals(sinhVien.getLopHoc().getMaLop())) {
                        // This is student's own class, skip adding to busy intervals
                        continue;
                    }
                    
                    // Check if this is the lecturer's own teaching schedule
                    if (giangVien != null && tkb.getGiangVien() != null 
                        && tkb.getGiangVien().getMaGV().equals(giangVien.getMaGV())) {
                        // This is lecturer's own teaching schedule, skip adding to busy intervals
                        continue;
                    }
                    
                    // If not the user's own schedule, add as busy interval
                    Date tkbStart = getThoiGianBatDauFromTiet(tkb.getTietBatDau(), tkb.getNgayHoc());
                    Date tkbEnd = getThoiGianKetThucFromTiet(tkb.getTietKetThuc(), tkb.getNgayHoc());
                    Map<String, Date> interval = new HashMap<>();
                    interval.put("start", tkbStart);
                    interval.put("end", tkbEnd);
                    busyIntervals.add(interval);
                }
                
                busyIntervals.sort(Comparator.comparing(interval -> interval.get("start")));
            
                // Tìm các khoảng thời gian trống
                List<Map<String, Date>> khoangThoiGianTrong = new ArrayList<>();
                Date lastEndTime = startOfDay;
            
                for (Map<String, Date> busy : busyIntervals) {
                    Date currentTime = new Date(); // Thêm lấy thời gian hiện tại
                    if (lastEndTime.before(busy.get("start"))) {
                        // Chỉ thêm vào khoảng thời gian trống nếu thời gian bắt đầu không nằm trong quá khứ
                        if (!lastEndTime.before(currentTime)) {
                            Map<String, Date> khoang = new HashMap<>();
                            khoang.put("start", lastEndTime);
                            khoang.put("end", busy.get("start"));
                            khoangThoiGianTrong.add(khoang);
                        }
                    }
                    lastEndTime = busy.get("end");
                }
            
                // Thêm khoảng thời gian trống từ cuối khoảng bận cuối cùng đến cuối ngày
                if (lastEndTime.before(endOfDay)) {
                    Date currentTime = new Date();
                    // Chỉ thêm vào nếu không trong quá khứ
                    if (!lastEndTime.before(currentTime)) {
                        Map<String, Date> khoang = new HashMap<>();
                        khoang.put("start", lastEndTime);
                        khoang.put("end", endOfDay);
                        khoangThoiGianTrong.add(khoang);
                    }
                }
            
                // Tìm khoảng thời gian trống khả thi và gần nhất
                Map<String, Object> nearestKhoang = null;
                long minDiff = Long.MAX_VALUE;
                for (Map<String, Date> khoang : khoangThoiGianTrong) {
                    Date start = khoang.get("start");
                    Date end = khoang.get("end");
                    // Kiểm tra nếu thời gian bắt đầu và kết thúc nằm trong giờ hành chính (7h - 22h)
                    Calendar startCal = Calendar.getInstance();
                    startCal.setTime(start);
                    int startHour = startCal.get(Calendar.HOUR_OF_DAY);
            
                    Calendar endCal = Calendar.getInstance();
                    endCal.setTime(end);
                    int endHour = endCal.get(Calendar.HOUR_OF_DAY);
            
                    // Bỏ qua nếu thời gian bắt đầu trước 7h hoặc sau 22h
                    if (startHour < 7 || startHour >= 22) {
                        continue;
                    }
            
                    // Giới hạn thời gian kết thúc không quá 22h
                    if (endHour >= 22) {
                        endCal.set(Calendar.HOUR_OF_DAY, 22);
                        endCal.set(Calendar.MINUTE, 0);
                        endCal.set(Calendar.SECOND, 0);
                        end = endCal.getTime();
                    }
            
                    if (end.getTime() - start.getTime() >= duration) {
                        // Kiểm tra xem khoảng thời gian gợi ý có trùng với lịch bận không
                        Date goiYStart = start;
                        Date goiYEnd = new Date(start.getTime() + duration);
                        boolean isConflict = false;
            
                        for (Map<String, Date> busy : busyIntervals) {
                            Date busyStart = busy.get("start");
                            Date busyEnd = busy.get("end");
                            if (goiYStart.before(busyEnd) && goiYEnd.after(busyStart)) {
                                isConflict = true;
                                break;
                            }
                        }
            
                        // Nếu không trùng, tính độ lệch và chọn khoảng gần nhất
                        if (!isConflict) {
                            long diff = Math.abs(start.getTime() - thoiGianMuon.getTime());
                            if (diff < minDiff) {
                                minDiff = diff;
                                Map<String, Object> goiY = new HashMap<>();
                                goiY.put("phong", phong);
                                goiY.put("thoiGianMuonGoiY", goiYStart);
                                goiY.put("thoiGianTraGoiY", goiYEnd);
                                nearestKhoang = goiY;
                            }
                        }
                    }
                }
            
                if (nearestKhoang != null) {
                    goiYPhongGanNhat.add(nearestKhoang);
                }
            }

            // Sắp xếp các gợi ý theo độ lệch
            goiYPhongGanNhat.sort(Comparator.comparingLong(goiY -> {
                Date start = (Date) goiY.get("thoiGianMuonGoiY");
                return Math.abs(start.getTime() - thoiGianMuon.getTime());
            }));
            return ResponseEntity.ok(
                    java.util.Map.of(
                            "phongTrongList", Collections.emptyList(),
                            "goiYPhongGanNhat", goiYPhongGanNhat
                    )
            );

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Lỗi khi xử lý yêu cầu: " + e.getMessage()));
        }
    }

    // Phương thức chuyển đổi tiết học thành thời gian bắt đầu
    private Date getThoiGianBatDauFromTiet(int tietBatDau, Date ngayHoc) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(ngayHoc);
        int minutesSince7AM = (tietBatDau - 1) * 45; // Mỗi tiết cách nhau 45 phút
        cal.set(Calendar.HOUR_OF_DAY, 7 + (minutesSince7AM / 60));
        cal.set(Calendar.MINUTE, minutesSince7AM % 60);
        cal.set(Calendar.SECOND, 0);
        return cal.getTime();
    }

    // Phương thức chuyển đổi tiết học thành thời gian kết thúc
    private Date getThoiGianKetThucFromTiet(int tietKetThuc, Date ngayHoc) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(ngayHoc);
        int minutesSince7AM = (tietKetThuc - 1) * 45 + 44; // Thời gian kết thúc = bắt đầu + 44 phút
        cal.set(Calendar.HOUR_OF_DAY, 7 + (minutesSince7AM / 60));
        cal.set(Calendar.MINUTE, minutesSince7AM % 60);
        cal.set(Calendar.SECOND, 0);
        return cal.getTime();
    }
} 