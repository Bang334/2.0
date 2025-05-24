package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Phong;
import com.example.backend.model.PhongThietBi;
import com.example.backend.model.ThietBi;

@Repository
public interface PhongThietBiRepository extends JpaRepository<PhongThietBi, Long> {
    List<PhongThietBi> findByPhong(Phong phong);
    
    List<PhongThietBi> findByThietBi(ThietBi thietBi);
    
    PhongThietBi findByPhongAndThietBi(Phong phong, ThietBi thietBi);
    
    void deleteByPhongAndThietBi(Phong phong, ThietBi thietBi);
    
    // Find rooms containing specific equipment
    List<PhongThietBi> findByThietBiMaThietBi(Long maThietBi);
} 