package com.example.backend.repository;

import com.example.backend.model.SuCo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SuCoRepository extends JpaRepository<SuCo, Long> {
    List<SuCo> findByTrangThai(SuCo.TrangThai trangThai);
    
    @Query("SELECT s.phong, COUNT(s) as soLuong " +
           "FROM SuCo s " +
           "GROUP BY s.phong " +
           "ORDER BY soLuong DESC")
    List<Object[]> thongKeSuCoTheoPhong();
    
    @Query("SELECT s.trangThai, COUNT(s) " +
           "FROM SuCo s " +
           "GROUP BY s.trangThai")
    List<Object[]> thongKeSuCoTheoTrangThai();
} 