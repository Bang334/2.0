package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.backend.model.PhanHoi;

@Repository
public interface PhanHoiRepository extends JpaRepository<PhanHoi, Integer> {
    // Tìm phản hồi theo lịch sử mượn phòng
    List<PhanHoi> findByLichSuMuonPhongMaLichSu(Integer maLichSu);
    
    // Tìm phản hồi theo mã yêu cầu mượn phòng (qua lịch sử mượn phòng)
    @Query("SELECT p FROM PhanHoi p WHERE p.lichSuMuonPhong.yeuCauMuonPhong.maYeuCau = ?1")
    List<PhanHoi> findByYeuCauMuonPhongMaYeuCau(Integer maYeuCau);
    
    // Tìm phản hồi theo danh sách mã yêu cầu mượn phòng
    @Query("SELECT p FROM PhanHoi p WHERE p.lichSuMuonPhong.yeuCauMuonPhong.maYeuCau IN ?1")
    List<PhanHoi> findByYeuCauMuonPhongMaYeuCauIn(List<Integer> maYeuCauList);
    
    // Tìm phản hồi theo đánh giá
    List<PhanHoi> findByDanhGiaOrderByThoiGianDesc(Integer danhGia);
    
    // Tính điểm đánh giá trung bình của một phòng
    @Query("SELECT AVG(p.danhGia) FROM PhanHoi p WHERE p.lichSuMuonPhong.yeuCauMuonPhong.phong.maPhong = ?1")
    Double tinhDiemTrungBinhTheoPhong(String maPhong);
    
    // Query để lấy top phòng có điểm đánh giá cao nhất
    @Query("SELECT p.lichSuMuonPhong.yeuCauMuonPhong.phong, AVG(p.danhGia) as avgRating, COUNT(p) as count " +
           "FROM PhanHoi p GROUP BY p.lichSuMuonPhong.yeuCauMuonPhong.phong ORDER BY avgRating DESC")
    List<Object[]> findTopRatedRooms();
    
    // Query để lấy top phòng có điểm đánh giá thấp nhất
    @Query("SELECT p.lichSuMuonPhong.yeuCauMuonPhong.phong, AVG(p.danhGia) as avgRating, COUNT(p) as count " +
           "FROM PhanHoi p GROUP BY p.lichSuMuonPhong.yeuCauMuonPhong.phong ORDER BY avgRating ASC")
    List<Object[]> findLowRatedRooms();
} 