package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.GiangVien;

@Repository
public interface GiangVienRepository extends JpaRepository<GiangVien, String> {
    Optional<GiangVien> findByNguoiDungIdNguoiDung(String idNguoiDung);
    List<GiangVien> findByKhoa(String khoa);
} 