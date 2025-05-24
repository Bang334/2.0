package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.ThongBaoNhan;
import com.example.backend.model.ThongBaoNhan.TrangThai;
import com.example.backend.model.NguoiDung;
import com.example.backend.model.SinhVien;
import com.example.backend.model.GiangVien;
import com.example.backend.model.ThongBaoGui;
import com.example.backend.model.LopHoc;
import com.example.backend.repository.ThongBaoNhanRepository;
import com.example.backend.repository.NguoiDungRepository;
import com.example.backend.repository.SinhVienRepository;
import com.example.backend.repository.GiangVienRepository;
import com.example.backend.repository.ThongBaoGuiRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Optional;
import java.util.Date;
import java.util.ArrayList;

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
                nguoiNhan.put("loai", "Sinh viên");
                // Kiểm tra null trước khi truy cập LopHoc
                if (sinhVien.getLopHoc() != null) {
                    nguoiNhan.put("maLop", sinhVien.getLopHoc().getMaLop());
                    nguoiNhan.put("tenLop", sinhVien.getLopHoc().getTenLop());
                } else {
                    nguoiNhan.put("maLop", "Chưa có lớp");
                    nguoiNhan.put("tenLop", "Chưa có lớp");
                }
            } else {
                nguoiNhan.put("loai", "Giảng viên");
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
} 