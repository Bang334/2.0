package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.NguoiDung;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, String> {
    Optional<NguoiDung> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<NguoiDung> findByTaiKhoanId(String taiKhoanId);
    
    // Thêm phương thức để tìm người dùng theo số điện thoại
    Optional<NguoiDung> findByLienHe(String lienHe);
    
    // Thêm phương thức để kiểm tra số điện thoại đã tồn tại chưa
    boolean existsByLienHe(String lienHe);
} 