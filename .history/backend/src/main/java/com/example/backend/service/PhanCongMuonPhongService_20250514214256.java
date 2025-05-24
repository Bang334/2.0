package com.example.backend.service;

import com.example.backend.model.PhanCongMuonPhong;
import com.example.backend.model.SinhVien;
import com.example.backend.model.ThoiKhoaBieu;
import com.example.backend.repository.PhanCongMuonPhongRepository;
import com.example.backend.repository.SinhVienRepository;
import com.example.backend.repository.ThoiKhoaBieuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class PhanCongMuonPhongService {

    @Autowired
    private PhanCongMuonPhongRepository phanCongMuonPhongRepository;

    @Autowired
    private SinhVienRepository sinhVienRepository;

    @Autowired
    private ThoiKhoaBieuRepository thoiKhoaBieuRepository;

    /**
     * Tạo một phân công mượn phòng mới
     */
    @Transactional
    public PhanCongMuonPhong taoPhanCong(String maSVNguoiPhanCong, String maSVNguoiDuocPhanCong, 
                                         Integer maTKB, String ghiChu) throws Exception {
        // Kiểm tra người phân công là cán bộ lớp
        Optional<SinhVien> nguoiPhanCongOpt = sinhVienRepository.findById(maSVNguoiPhanCong);
        if (!nguoiPhanCongOpt.isPresent()) {
            throw new Exception("Không tìm thấy sinh viên phân công");
        }
        
        SinhVien nguoiPhanCong = nguoiPhanCongOpt.get();
        if (nguoiPhanCong.getVaiTro() != SinhVien.VaiTroSinhVien.CANBO) {
            throw new Exception("Sinh viên không có quyền phân công mượn phòng");
        }
        
        // Kiểm tra người được phân công
        Optional<SinhVien> nguoiDuocPhanCongOpt = sinhVienRepository.findById(maSVNguoiDuocPhanCong);
        if (!nguoiDuocPhanCongOpt.isPresent()) {
            throw new Exception("Không tìm thấy sinh viên được phân công");
        }
        
        SinhVien nguoiDuocPhanCong = nguoiDuocPhanCongOpt.get();
        
        // Kiểm tra thời khóa biểu
        Optional<ThoiKhoaBieu> thoiKhoaBieuOpt = thoiKhoaBieuRepository.findById(maTKB);
        if (!thoiKhoaBieuOpt.isPresent()) {
            throw new Exception("Không tìm thấy thời khóa biểu");
        }
        
        ThoiKhoaBieu thoiKhoaBieu = thoiKhoaBieuOpt.get();
        
        // Kiểm tra xem sinh viên đã được phân công cho thời khóa biểu này chưa
        boolean daCoNguoiDuocPhanCong = phanCongMuonPhongRepository
            .existsByNguoiDuocPhanCongAndThoiKhoaBieuAndTrangThaiNot(
                nguoiDuocPhanCong, thoiKhoaBieu, PhanCongMuonPhong.TrangThai.HUY);
        
        if (daCoNguoiDuocPhanCong) {
            throw new Exception("Sinh viên này đã được phân công cho thời khóa biểu này");
        }
        
        // Tạo phân công mới
        PhanCongMuonPhong phanCong = new PhanCongMuonPhong();
        phanCong.setNguoiPhanCong(nguoiPhanCong);
        phanCong.setNguoiDuocPhanCong(nguoiDuocPhanCong);
        phanCong.setThoiKhoaBieu(thoiKhoaBieu);
        phanCong.setThoiGianPhanCong(new Date());
        phanCong.setTrangThai(PhanCongMuonPhong.TrangThai.CHOMUON);
        phanCong.setGhiChu(ghiChu);
        
        return phanCongMuonPhongRepository.save(phanCong);
    }
    
    /**
     * Cập nhật trạng thái phân công
     */
    @Transactional
    public PhanCongMuonPhong capNhatTrangThai(Integer maPhanCong, PhanCongMuonPhong.TrangThai trangThai) throws Exception {
        Optional<PhanCongMuonPhong> phanCongOpt = phanCongMuonPhongRepository.findById(maPhanCong);
        if (!phanCongOpt.isPresent()) {
            throw new Exception("Không tìm thấy phân công");
        }
        
        PhanCongMuonPhong phanCong = phanCongOpt.get();
        phanCong.setTrangThai(trangThai);
        
        return phanCongMuonPhongRepository.save(phanCong);
    }
    
    /**
     * Lấy danh sách phân công của cán bộ lớp
     */
    public List<PhanCongMuonPhong> layDanhSachPhanCongCuaCanBo(String maSV) {
        Optional<SinhVien> nguoiPhanCongOpt = sinhVienRepository.findById(maSV);
        if (nguoiPhanCongOpt.isPresent()) {
            return phanCongMuonPhongRepository.findByNguoiPhanCong(nguoiPhanCongOpt.get());
        }
        return List.of();
    }
    
    /**
     * Lấy danh sách phân công cho sinh viên
     */
    public List<PhanCongMuonPhong> layDanhSachPhanCongChoSinhVien(String maSV) {
        Optional<SinhVien> sinhVienOpt = sinhVienRepository.findById(maSV);
        if (sinhVienOpt.isPresent()) {
            return phanCongMuonPhongRepository.findByNguoiDuocPhanCong(sinhVienOpt.get());
        }
        return List.of();
    }
    
    /**
     * Lấy danh sách phân công đang chờ xử lý của sinh viên
     */
    public List<PhanCongMuonPhong> layDanhSachPhanCongChoXuLy(String maSV) {
        return phanCongMuonPhongRepository.findPendingAssignmentsByStudent(maSV);
    }
    
    /**
     * Lấy tất cả danh sách phân công trong lớp
     */
    public List<PhanCongMuonPhong> layTatCaDanhSachPhanCongTrongLop(String maLop) {
        // Lấy tất cả phân công liên quan đến sinh viên trong lớp
        return phanCongMuonPhongRepository.findAllAssignmentsInClass(maLop);
    }
    
    /**
     * Hủy phân công
     */
    @Transactional
    public void huyPhanCong(Integer maPhanCong, String maSVCanBo) throws Exception {
        Optional<PhanCongMuonPhong> phanCongOpt = phanCongMuonPhongRepository.findById(maPhanCong);
        if (!phanCongOpt.isPresent()) {
            throw new Exception("Không tìm thấy phân công");
        }
        
        PhanCongMuonPhong phanCong = phanCongOpt.get();
        
        // Kiểm tra người hủy phải là người đã phân công
        if (!phanCong.getNguoiPhanCong().getMaSV().equals(maSVCanBo)) {
            throw new Exception("Bạn không có quyền hủy phân công này");
        }
        
        phanCong.setTrangThai(PhanCongMuonPhong.TrangThai.HUY);
        phanCongMuonPhongRepository.save(phanCong);
    }
} 