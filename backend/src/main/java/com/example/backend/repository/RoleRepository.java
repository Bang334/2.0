package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {
    Optional<Role> findByTenVaiTro(String tenVaiTro);
} 