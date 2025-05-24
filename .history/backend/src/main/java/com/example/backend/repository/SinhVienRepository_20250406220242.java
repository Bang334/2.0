package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.SinhVien;

@Repository
public interface SinhVienRepository extends JpaRepository<SinhVien, String> {
    SinhVien findByNguoiDungIdNguoiDung(String idNguoiDung);
    List<SinhVien> findByLopHocMaLop(String maLop);
}