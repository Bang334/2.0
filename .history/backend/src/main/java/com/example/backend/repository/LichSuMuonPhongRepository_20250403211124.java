package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.LichSuMuonPhong;

@Repository
public interface LichSuMuonPhongRepository extends JpaRepository<LichSuMuonPhong, Integer> {
    List<LichSuMuonPhong> findByYeuCauMuonPhongMaYeuCau(Integer maYeuCau);
} 