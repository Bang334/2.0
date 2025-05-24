package com.example.backend.repository;

import com.example.backend.model.PhanCongMuonPhong;
import com.example.backend.model.SinhVien;
import com.example.backend.model.ThoiKhoaBieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhanCongMuonPhongRepository extends JpaRepository<PhanCongMuonPhong, Integer> {
    
    // Tìm phân công theo người phân công (cán bộ lớp)
    List<PhanCongMuonPhong> findByNguoiPhanCong(SinhVien nguoiPhanCong);
    
    // Tìm phân công theo người được phân công
    List<PhanCongMuonPhong> findByNguoiDuocPhanCong(SinhVien nguoiDuocPhanCong);
    
    // Tìm phân công theo thời khóa biểu
    List<PhanCongMuonPhong> findByThoiKhoaBieu(ThoiKhoaBieu thoiKhoaBieu);
    
    // Tìm phân công theo trạng thái
    List<PhanCongMuonPhong> findByTrangThai(PhanCongMuonPhong.TrangThai trangThai);
    
    // Tìm phân công đang chờ của sinh viên
    @Query("SELECT pc FROM PhanCongMuonPhong pc WHERE pc.nguoiDuocPhanCong.maSV = :maSV AND pc.trangThai = 'CHOMUON'")
    List<PhanCongMuonPhong> findPendingAssignmentsByStudent(@Param("maSV") String maSV);
    
    // Tìm phân công theo người phân công và trạng thái
    List<PhanCongMuonPhong> findByNguoiPhanCongAndTrangThai(SinhVien nguoiPhanCong, PhanCongMuonPhong.TrangThai trangThai);
    
    // Kiểm tra sinh viên đã được phân công trong thời khóa biểu này chưa
    boolean existsByNguoiDuocPhanCongAndThoiKhoaBieuAndTrangThaiNot(
        SinhVien nguoiDuocPhanCong, 
        ThoiKhoaBieu thoiKhoaBieu, 
        PhanCongMuonPhong.TrangThai trangThai
    );
    
    // Đếm số lượng phân công cho một thời khóa biểu
    @Query("SELECT COUNT(pc) FROM PhanCongMuonPhong pc WHERE pc.thoiKhoaBieu.maTKB = :maTKB AND pc.trangThai <> 'HUY'")
    long countActiveAssignmentsByThoiKhoaBieu(@Param("maTKB") Integer maTKB);
} 