package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.QuanLy;

@Repository
public interface QuanLyRepository extends JpaRepository<QuanLy, String> {
    Optional<QuanLy> findByNguoiDungIdNguoiDung(String idNguoiDung);
} 