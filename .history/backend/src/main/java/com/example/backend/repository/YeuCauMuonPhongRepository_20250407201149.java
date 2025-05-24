package com.example.backend.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.model.YeuCauMuonPhong;
import com.example.backend.model.NguoiDung;

@Repository
public interface YeuCauMuonPhongRepository extends JpaRepository<YeuCauMuonPhong, Integer> {
    List<YeuCauMuonPhong> findByNguoiMuonIdNguoiDung(String idNguoiDung);
    List<YeuCauMuonPhong> findByPhongMaPhong(String maPhong);
    List<YeuCauMuonPhong> findByTrangThai(YeuCauMuonPhong.TrangThai trangThai);
    
    // Kiểm tra xung đột thời gian với người mượn
    @Query("SELECT y FROM YeuCauMuonPhong y WHERE y.nguoiMuon.idNguoiDung = :idNguoiMuon "
            + "AND y.trangThai IN ('DADUYET', 'DANGXULY') "
            + "AND ((y.thoiGianMuon <= :thoiGianTra AND y.thoiGianTra >= :thoiGianMuon) "
            + "OR (:thoiGianMuon <= y.thoiGianTra AND :thoiGianTra >= y.thoiGianMuon))")
    List<YeuCauMuonPhong> kiemTraTrungLichNguoiMuon(
            @Param("idNguoiMuon") String idNguoiMuon,
            @Param("thoiGianMuon") Date thoiGianMuon,
            @Param("thoiGianTra") Date thoiGianTra);
    
    // Kiểm tra xung đột thời gian với phòng
    @Query("SELECT y FROM YeuCauMuonPhong y WHERE y.phong.maPhong = :maPhong "
            + "AND y.trangThai IN ('DADUYET', 'DANGXULY') "
            + "AND ((y.thoiGianMuon <= :thoiGianTra AND y.thoiGianTra >= :thoiGianMuon) "
            + "OR (:thoiGianMuon <= y.thoiGianTra AND :thoiGianTra >= y.thoiGianMuon))")
    List<YeuCauMuonPhong> kiemTraTrungLichPhong(
            @Param("maPhong") String maPhong,
            @Param("thoiGianMuon") Date thoiGianMuon,
            @Param("thoiGianTra") Date thoiGianTra);
    
    // Kiểm tra xung đột thời gian với phòng, loại trừ yêu cầu đang được cập nhật
    @Query("SELECT y FROM YeuCauMuonPhong y WHERE y.phong.maPhong = :maPhong "
            + "AND y.maYeuCau != :maYeuCau "
            + "AND y.trangThai IN ('DADUYET', 'DANGXULY') "
            + "AND ((y.thoiGianMuon <= :thoiGianTra AND y.thoiGianTra >= :thoiGianMuon) "
            + "OR (:thoiGianMuon <= y.thoiGianTra AND :thoiGianTra >= y.thoiGianMuon))")
    List<YeuCauMuonPhong> kiemTraTrungLichPhongKhiCapNhat(
            @Param("maPhong") String maPhong,
            @Param("thoiGianMuon") Date thoiGianMuon,
            @Param("thoiGianTra") Date thoiGianTra,
            @Param("maYeuCau") Integer maYeuCau);
    
    // Kiểm tra xung đột thời gian với người mượn, loại trừ yêu cầu đang được cập nhật
    @Query("SELECT y FROM YeuCauMuonPhong y WHERE y.nguoiMuon.idNguoiDung = :idNguoiMuon "
            + "AND y.maYeuCau != :maYeuCau "
            + "AND y.trangThai IN ('DADUYET', 'DANGXULY') "
            + "AND ((y.thoiGianMuon <= :thoiGianTra AND y.thoiGianTra >= :thoiGianMuon) "
            + "OR (:thoiGianMuon <= y.thoiGianTra AND :thoiGianTra >= y.thoiGianMuon))")
    List<YeuCauMuonPhong> kiemTraTrungLichNguoiMuonKhiCapNhat(
            @Param("idNguoiMuon") String idNguoiMuon,
            @Param("thoiGianMuon") Date thoiGianMuon,
            @Param("thoiGianTra") Date thoiGianTra,
            @Param("maYeuCau") Integer maYeuCau);

    List<YeuCauMuonPhong> findByNguoiMuonAndTrangThaiIn(NguoiDung nguoiMuon, List<YeuCauMuonPhong.TrangThai> trangThai);
    
    List<YeuCauMuonPhong> findByNguoiMuonAndTrangThaiInOrderByThoiGianMuonDesc(NguoiDung nguoiMuon, List<YeuCauMuonPhong.TrangThai> trangThai);
    LList<YeuCauMuonPhong> findByNguoiMuonIdNguoiDungOrderByThoiGianMuonDesc(String idNguoiDung);
} 