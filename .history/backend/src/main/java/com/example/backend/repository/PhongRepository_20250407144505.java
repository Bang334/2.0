package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Phong;

@Repository
public interface PhongRepository extends JpaRepository<Phong, String> {
    List<Phong> findByTrangThai(Phong.TrangThai trangThai);
} 