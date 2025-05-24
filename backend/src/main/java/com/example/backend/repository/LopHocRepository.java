package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.LopHoc;

@Repository
public interface LopHocRepository extends JpaRepository<LopHoc, String> {
} 