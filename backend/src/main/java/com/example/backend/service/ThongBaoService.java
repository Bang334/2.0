package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.ThongBaoNhan;
import com.example.backend.model.ThongBaoNhan.TrangThai;
import com.example.backend.model.NguoiDung;
import com.example.backend.model.SinhVien;
import com.example.backend.model.ThongBaoGui;
import com.example.backend.repository.ThongBaoNhanRepository;

import jakarta.annotation.PostConstruct;

import com.example.backend.model.MonHoc;
import com.example.backend.model.ThoiKhoaBieu;
import com.example.backend.repository.NguoiDungRepository;
import com.example.backend.repository.SinhVienRepository;
import com.example.backend.repository.ThoiKhoaBieuRepository;
import com.example.backend.repository.GiangVienRepository;
import com.example.backend.repository.ThongBaoGuiRepository;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.Date;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Calendar;

@Service
public class ThongBaoService {

    @Autowired
    private ThongBaoNhanRepository thongBaoNhanRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private SinhVienRepository sinhVienRepository;

    @Autowired
    private GiangVienRepository giangVienRepository;

    @Autowired
    private ThongBaoGuiRepository thongBaoGuiRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private ThoiKhoaBieuRepository thoiKhoaBieuRepository;

    @Transactional
    public void danhDauDaDoc(Integer id) {
        ThongBaoNhan thongBao = thongBaoNhanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo với ID: " + id));
        
        thongBao.setTrangThai(TrangThai.DADOC);
        thongBaoNhanRepository.save(thongBao);
    }

    public List<ThongBaoGui> getThongBaoGui(String userId) {
        Optional<NguoiDung> nguoiDung = nguoiDungRepository.findByTaiKhoanId(userId);
        if (!nguoiDung.isPresent()) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin người dùng");
        }
        return thongBaoGuiRepository.findByNguoiGuiIdNguoiDungOrderByThoiGianDesc(nguoiDung.get().getIdNguoiDung());
    }
    
    public List<Map<String, Object>> getThongBaoDaGui(String userId) {
        Optional<NguoiDung> nguoiDung = nguoiDungRepository.findByTaiKhoanId(userId);
        if (!nguoiDung.isPresent()) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin người dùng");
        }
        
        // Lấy danh sách thông báo mà người dùng đã gửi
        List<ThongBaoGui> thongBaoGuis = thongBaoGuiRepository.findByNguoiGuiIdNguoiDungOrderByThoiGianDesc(nguoiDung.get().getIdNguoiDung());
        
        // Chuyển đổi danh sách thông báo sang định dạng có thêm thông tin người nhận
        return thongBaoGuis.stream().map(tb -> {
            Map<String, Object> thongBaoInfo = new HashMap<>();
            thongBaoInfo.put("id", tb.getIdTB());
            thongBaoInfo.put("tieuDe", tb.getTieuDe());
            thongBaoInfo.put("noiDung", tb.getNoiDung());
            thongBaoInfo.put("thoiGian", tb.getThoiGian());
            
            // Lấy danh sách người nhận
            List<ThongBaoNhan> nguoiNhans = thongBaoNhanRepository.findByThongBaoGuiIdTB(tb.getIdTB());
            thongBaoInfo.put("soNguoiNhan", nguoiNhans.size());
            
            // Đếm số người đã đọc
            long soNguoiDaDoc = nguoiNhans.stream()
                .filter(tbn -> tbn.getTrangThai() == TrangThai.DADOC)
                .count();
            thongBaoInfo.put("soNguoiDaDoc", soNguoiDaDoc);
            
            return thongBaoInfo;
        }).collect(Collectors.toList());
    }
    
    public List<Map<String, Object>> getNguoiNhanThongBao(Integer idThongBao, String idNguoiGui) {
        // Kiểm tra thông báo có tồn tại và thuộc về người gửi không
        ThongBaoGui thongBaoGui = thongBaoGuiRepository.findById(idThongBao)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo với ID: " + idThongBao));
        
        if (!thongBaoGui.getNguoiGui().getIdNguoiDung().equals(idNguoiGui)) {
            throw new ResourceNotFoundException("Bạn không có quyền xem danh sách người nhận của thông báo này");
        }
        
        // Lấy danh sách người nhận
        List<ThongBaoNhan> thongBaoNhans = thongBaoNhanRepository.findByThongBaoGuiIdTB(idThongBao);
        return thongBaoNhans.stream().map(tbn -> {
            Map<String, Object> nguoiNhan = new HashMap<>();
            nguoiNhan.put("id", tbn.getId());
            nguoiNhan.put("hoTen", tbn.getNguoiNhan().getHoTen());
            nguoiNhan.put("trangThai", tbn.getTrangThai().toString());
            nguoiNhan.put("daDoc", tbn.getTrangThai() == TrangThai.DADOC);
            
            System.out.println("tbn.getNguoiNhan().getIdNguoiDung(): " + tbn.getNguoiNhan().getIdNguoiDung());
            SinhVien sinhVien = sinhVienRepository.findByNguoiDungIdNguoiDung(tbn.getNguoiNhan().getIdNguoiDung());
            if (sinhVien != null) {
                nguoiNhan.put("vaiTro", "Sinh viên");
                if (sinhVien.getLopHoc() != null) {
                    nguoiNhan.put("maLop", sinhVien.getLopHoc().getMaLop());
                    nguoiNhan.put("tenLop", sinhVien.getLopHoc().getTenLop());
                } else {
                    nguoiNhan.put("maLop", "Chưa có lớp");
                    nguoiNhan.put("tenLop", "Chưa có lớp");
                }
            } else {
                nguoiNhan.put("vaiTro", "Giảng viên");
                nguoiNhan.put("maLop", "");
                nguoiNhan.put("tenLop", "");
            }
            System.out.println("nguoiNhan: " + nguoiNhan);
            return nguoiNhan;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getDanhSachNguoiNhan() {
        Map<String, Object> result = new HashMap<>();
        
        // Lấy danh sách giảng viên
        List<Map<String, String>> giangViens = giangVienRepository.findAll().stream()
            .map(gv -> {
                Map<String, String> map = new HashMap<>();
                map.put("id", gv.getNguoiDung().getIdNguoiDung());
                map.put("ten", gv.getNguoiDung().getHoTen());
                map.put("vaiTro", "Giảng viên");
                return map;
            })
            .collect(Collectors.toList());
        
        // Lấy danh sách sinh viên
        List<Map<String, String>> sinhViens = sinhVienRepository.findAll().stream()
            .map(sv -> {
                Map<String, String> map = new HashMap<>();
                map.put("id", sv.getNguoiDung().getIdNguoiDung());
                map.put("ten", sv.getNguoiDung().getHoTen());
                map.put("vaiTro", "Sinh viên");
                map.put("maLop", sv.getLopHoc().getMaLop());
                return map;
            })
            .collect(Collectors.toList());

        result.put("giangViens", giangViens);
        result.put("sinhViens", sinhViens);
        
        // Tạo danh sách tất cả người dùng (chỉ SV và GV)
        List<Map<String, String>> allUsers = new ArrayList<>();
        allUsers.addAll(giangViens);
        allUsers.addAll(sinhViens);
        result.put("allUsers", allUsers);
        
        return result;
    }
    
    @Transactional
    public ThongBaoGui guiThongBao(NguoiDung nguoiGui, String tieuDe, String noiDung, String idNguoiNhan, String maLop) {
        // Tạo thông báo gửi
        ThongBaoGui thongBaoGui = new ThongBaoGui(nguoiGui, tieuDe, noiDung, new Date());
        thongBaoGuiRepository.save(thongBaoGui);
        
        // Nếu gửi cho cá nhân
        if (idNguoiNhan != null && !idNguoiNhan.isEmpty()) {
            Optional<NguoiDung> nguoiNhanOpt = nguoiDungRepository.findById(idNguoiNhan);
            if (nguoiNhanOpt.isPresent()) {
                ThongBaoNhan thongBaoNhan = new ThongBaoNhan(thongBaoGui, nguoiNhanOpt.get(), TrangThai.CHUADOC);
                thongBaoNhanRepository.save(thongBaoNhan);
            }
        }
        
        // Nếu gửi cho lớp
        if (maLop != null && !maLop.isEmpty()) {
            List<SinhVien> sinhViens = sinhVienRepository.findByLopHocMaLop(maLop);
            for (SinhVien sinhVien : sinhViens) {
                ThongBaoNhan thongBaoNhan = new ThongBaoNhan(thongBaoGui, sinhVien.getNguoiDung(), TrangThai.CHUADOC);
                thongBaoNhanRepository.save(thongBaoNhan);
            }
        }
        
        return thongBaoGui;
    }
    
    public void thongBaoThayDoiTKB(ThoiKhoaBieu tkbCu, ThoiKhoaBieu tkbMoi) {
    	SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yyyy");
    	
    	String tieuDe = "";
    	String noiDung = "";
    	String ngayCu = formatter.format(tkbCu.getNgayHoc());
    	String ngayMoi = formatter.format(tkbMoi.getNgayHoc());
    	MonHoc mon = tkbCu.getMonHoc();
    	int tietBatDauCu = tkbCu.getTietBatDau();
    	int tietBatDauMoi = tkbMoi.getTietBatDau();
    	int tietKetThucCu = tkbCu.getTietKetThuc();
    	int tietKetThucMoi = tkbMoi.getTietKetThuc();
    	
    	boolean ngayThayDoi = !ngayCu.equals(ngayMoi);
    	boolean tietThayDoi = tietBatDauCu != tietBatDauMoi || tietKetThucCu != tietKetThucMoi;
    	
    	if (ngayThayDoi) {
            tieuDe = "Thay đổi lịch học: " + mon.getTenMon() + " - " + mon.getMaMon();
            noiDung = String.format(
                "Lịch học cho môn %s (%s) vào ngày %s (tiết %d - %d) sẽ được dời sang ngày %s (tiết %d - %d)",
                mon.getTenMon(), mon.getMaMon(),
                ngayCu, tietBatDauCu, tietKetThucCu,
                ngayMoi, tietBatDauMoi, tietKetThucMoi
            );
        } else if (tietThayDoi) {
        	tieuDe = "Thay đổi tiết học: " + mon.getTenMon() + " - " + mon.getMaMon();
            noiDung = String.format(
                "Tiết học cho môn %s (%s) vào ngày %s sẽ được đổi sang tiết %s - %s",
                mon.getTenMon(), mon.getMaMon(), ngayCu, tietBatDauMoi, tietKetThucMoi
            );
        }
        
        if (!tieuDe.isEmpty() && !noiDung.isEmpty()) {
        	ThongBaoGui tbGui = new ThongBaoGui();
        	tbGui.setNguoiGui(tkbCu.getGiangVien().getNguoiDung());
        	tbGui.setTieuDe(tieuDe);
        	tbGui.setNoiDung(noiDung);
        	tbGui.setThoiGian(new Date());
        	thongBaoGuiRepository.save(tbGui);
        	
        	List<SinhVien> dssv = sinhVienRepository.findByLopHocMaLop(tkbCu.getLopHoc().getMaLop());
        	for (SinhVien sv : dssv) {
        		ThongBaoNhan tbNhan = new ThongBaoNhan();
        		tbNhan.setNguoiNhan(sv.getNguoiDung());
        		tbNhan.setThongBaoGui(tbGui);
        		tbNhan.setTrangThai(TrangThai.CHUADOC);
        		
        		thongBaoNhanRepository.save(tbNhan);
        		emailService.sendSimpleEmail(tbNhan.getNguoiNhan().getEmail(), tieuDe, noiDung);
        	}
        }    	
    }
    
    private Set<Integer> danhSachDaDatNhacNho = new HashSet<>();

    @Scheduled(cron = "0 0 0 * * ?") // Mỗi ngày lúc 00:00
//    @Scheduled(fixedRate = 1 * 60 * 1000) // For testing
    public void loadVaDatLichNhacNho() {
        System.out.println("📅 Đang tải lịch và đặt nhắc nhở...");

        Date ngayHienTai = new Date();
        List<ThoiKhoaBieu> danhSach = thoiKhoaBieuRepository.findByNgayHoc(ngayHienTai);

        for (ThoiKhoaBieu tkb : danhSach) {
            Integer id = tkb.getMaTKB(); // giả sử đây là id duy nhất của lịch

            if (danhSachDaDatNhacNho.contains(id)) {
                continue; // đã đặt rồi, bỏ qua
            }

            Date gioBatDau = getTimeFromTiet(tkb.getTietBatDau(), tkb.getNgayHoc());
            long delay = gioBatDau.getTime() - System.currentTimeMillis() - (30 * 60 * 1000);

            if (delay > 0) {
                ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
                scheduler.schedule(() -> {
                    guiEmailNhacNho(tkb);
                }, delay, TimeUnit.MILLISECONDS);

                danhSachDaDatNhacNho.add(id);
            }
        }
    }

    private void guiEmailNhacNho(ThoiKhoaBieu tkb) {
        String tenMon = tkb.getMonHoc().getTenMon();
        String maPhong = tkb.getPhong().getMaPhong();
        String emailGV = tkb.getGiangVien().getNguoiDung().getEmail();
        String tenGV = tkb.getGiangVien().getNguoiDung().getHoTen();

        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm dd-MM-yyyy");
        String gioFormatted = sdf.format(getTimeFromTiet(tkb.getTietBatDau(), tkb.getNgayHoc()));

        String tieuDe = "⏰ Nhắc nhở: Sắp đến giờ dạy";
        String noiDung = String.format("""
            Xin chào %s,

            Đây là nhắc nhở lịch dạy sắp tới:
            • Môn: %s
            • Phòng: %s
            • Thời gian bắt đầu: %s

            Vui lòng chuẩn bị trước giờ dạy.
            """, tenGV, tenMon, maPhong, gioFormatted);

        emailService.sendSimpleEmail(emailGV, tieuDe, noiDung);

        System.out.println("📧 Đã gửi email nhắc nhở cho " + tenGV + " (" + emailGV + ")");
    }

    public void capNhatLichNhacNho(Integer maTKB) {
        // Kiểm tra nếu đã có lịch nhắc nhở cho maTKB, nếu có thì hủy
        if (danhSachDaDatNhacNho.contains(maTKB)) {
            System.out.println("🔄 Hủy nhắc nhở cũ cho TKB " + maTKB);

            // Hủy lịch nhắc nhở cũ
            danhSachDaDatNhacNho.remove(maTKB);
        }

        // Lấy thông tin lịch học mới từ cơ sở dữ liệu
        ThoiKhoaBieu tkb = thoiKhoaBieuRepository.findById(maTKB).orElse(null);

        if (tkb == null) {
            System.out.println("⚠️ Không tìm thấy TKB với maTKB " + maTKB);
            return;
        }

        // Tính toán lại thời gian nhắc nhở mới
        Date gioBatDau = getTimeFromTiet(tkb.getTietBatDau(), tkb.getNgayHoc());
        long delay = gioBatDau.getTime() - System.currentTimeMillis() - (30 * 60 * 1000);  // 30 phút trước giờ học

        if (delay > 0) {
            ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
            scheduler.schedule(() -> {
                guiEmailNhacNho(tkb);  // Gửi email nhắc nhở
            }, delay, TimeUnit.MILLISECONDS);

            // Thêm maTKB vào danh sách nhắc nhở đã đặt
            danhSachDaDatNhacNho.add(maTKB);
            System.out.println("✅ Đã đặt lại nhắc nhở cho TKB " + maTKB);
        } else {
            System.out.println("⚠️ Không đặt nhắc nhở vì đã quá thời gian cho TKB " + maTKB);
        }
    }


    @PostConstruct
    public void runAfterStartup() {
    	loadVaDatLichNhacNho();
    }

    private Date getTimeFromTiet(int tiet, Date ngayHoc) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(ngayHoc);
        cal.set(Calendar.HOUR_OF_DAY, 7 + tiet - 1); // bắt đầu từ 7h, mỗi tiết +1h
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }

    /**
     * Xóa thông báo của người nhận
     * 
     * @param id ID của ThongBaoNhan cần xóa
     * @param idNguoiDung ID của người dùng muốn xóa thông báo, dùng để kiểm tra quyền
     * @return true nếu xóa thành công, false nếu không tìm thấy hoặc không có quyền
     */
    @Transactional
    public boolean xoaThongBaoNhan(Integer id, String idNguoiDung) {
        ThongBaoNhan thongBao = thongBaoNhanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo với ID: " + id));
        
        // Kiểm tra người xóa có phải là người nhận thông báo không
        if (!thongBao.getNguoiNhan().getIdNguoiDung().equals(idNguoiDung)) {
            return false;
        }
        
        // Xóa thông báo
        thongBaoNhanRepository.delete(thongBao);
        return true;
    }
} 