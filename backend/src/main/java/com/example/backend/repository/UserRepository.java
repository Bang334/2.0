package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.lang.NonNull;

import com.example.backend.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    @NonNull
    Optional<User> findById(@NonNull String id);
} 