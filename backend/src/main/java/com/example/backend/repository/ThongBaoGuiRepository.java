package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.ThongBaoGui;

@Repository
public interface ThongBaoGuiRepository extends JpaRepository<ThongBaoGui, Integer> {
    List<ThongBaoGui> findByNguoiGuiIdNguoiDung(String idNguoiDung);
    List<ThongBaoGui> findByNguoiGuiIdNguoiDungOrderByThoiGianDesc(String idNguoiDung);
} 