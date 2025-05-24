package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.ThietBi;

@Repository
public interface ThietBiRepository extends JpaRepository<ThietBi, Long> {
    // Custom queries can be added here
} 