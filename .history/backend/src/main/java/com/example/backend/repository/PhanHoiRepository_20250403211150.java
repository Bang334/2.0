package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.PhanHoi;

@Repository
public interface PhanHoiRepository extends JpaRepository<PhanHoi, Integer> {
    List<PhanHoi> findByLichSuMuonPhongMaLichSu(Integer maLichSu);
    
    // Untuk kompatibilitas dengan kode yang menggunakan yeuCauMuonPhong
    default List<PhanHoi> findByYeuCauMuonPhongMaYeuCau(Integer maYeuCau) {
        // Ini metode kompatibilitas sementara, idealnya perlu diubah seluruh codebase
        return findAll().stream()
            .filter(p -> p.getLichSuMuonPhong() != null && 
                    p.getLichSuMuonPhong().getYeuCauMuonPhong() != null && 
                    p.getLichSuMuonPhong().getYeuCauMuonPhong().getMaYeuCau().equals(maYeuCau))
            .toList();
    }
    
    // Untuk kompatibilitas dengan kode yang menggunakan yeuCauMuonPhong
    default List<PhanHoi> findByYeuCauMuonPhongMaYeuCauIn(List<Integer> maYeuCauList) {
        // Ini metode kompatibilitas sementara, idealnya perlu diubah seluruh codebase
        return findAll().stream()
            .filter(p -> p.getLichSuMuonPhong() != null && 
                    p.getLichSuMuonPhong().getYeuCauMuonPhong() != null && 
                    maYeuCauList.contains(p.getLichSuMuonPhong().getYeuCauMuonPhong().getMaYeuCau()))
            .toList();
    }
} 