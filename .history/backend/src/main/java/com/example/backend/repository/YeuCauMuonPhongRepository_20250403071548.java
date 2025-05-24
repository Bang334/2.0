package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.YeuCauMuonPhong;

@Repository
public interface YeuCauMuonPhongRepository extends JpaRepository<YeuCauMuonPhong, Integer> {
    List<YeuCauMuonPhong> findByNguoiMuonIdNguoiDung(String idNguoiDung);
    List<YeuCauMuonPhong> findByPhongMaPhong(String maPhong);
    List<YeuCauMuonPhong> findByTrangThai(YeuCauMuonPhong.TrangThai trangThai);
} 