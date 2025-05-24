package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.backend.model.PhanHoi;
import com.example.backend.model.Phong;
import com.example.backend.model.NguoiDung;

@Repository
public interface PhanHoiRepository extends JpaRepository<PhanHoi, Long> {
    // Tìm phản hồi theo phòng
    List<PhanHoi> findByPhongOrderByThoiGianDesc(Phong phong);
    
    // Tìm phản hồi theo người dùng
    List<PhanHoi> findByNguoiDungOrderByThoiGianDesc(NguoiDung nguoiDung);
    
    // Tìm phản hồi theo điểm đánh giá
    List<PhanHoi> findByDiemDanhGiaOrderByThoiGianDesc(Integer diemDanhGia);
    
    // Tìm phản hồi theo phòng và người dùng
    PhanHoi findByPhongAndNguoiDung(Phong phong, NguoiDung nguoiDung);
    
    // Tìm phản hồi được đánh dấu
    List<PhanHoi> findByDanhDauOrderByThoiGianDesc(Boolean danhDau);
    
    // Tìm phản hồi đã được quản lý phản hồi lại
    List<PhanHoi> findByQuanLyPhanHoiIsNotNullOrderByThoiGianDesc();
    
    // Tìm phản hồi chưa được quản lý phản hồi lại
    List<PhanHoi> findByQuanLyPhanHoiIsNullOrderByThoiGianDesc();
    
    // Query để tính điểm đánh giá trung bình của một phòng
    @Query("SELECT AVG(p.diemDanhGia) FROM PhanHoi p WHERE p.phong = ?1")
    Double tinhDiemTrungBinh(Phong phong);
    
    // Query để lấy top phòng có điểm đánh giá cao nhất
    @Query("SELECT p.phong, AVG(p.diemDanhGia) as avgRating, COUNT(p) as count FROM PhanHoi p GROUP BY p.phong ORDER BY avgRating DESC")
    List<Object[]> findTopRatedRooms();
    
    // Query để lấy top phòng có điểm đánh giá thấp nhất
    @Query("SELECT p.phong, AVG(p.diemDanhGia) as avgRating, COUNT(p) as count FROM PhanHoi p GROUP BY p.phong ORDER BY avgRating ASC")
    List<Object[]> findLowRatedRooms();
} 