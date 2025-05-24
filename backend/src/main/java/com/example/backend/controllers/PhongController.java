package com.example.backend.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.Phong;
import com.example.backend.repository.PhongRepository;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class PhongController {
    
    @Autowired
    private PhongRepository phongRepository;
    
    // Endpoint public để lấy tất cả phòng, không yêu cầu quyền
    @GetMapping("/phong")
    public ResponseEntity<List<Phong>> getAllPhong() {
        List<Phong> danhSachPhong = phongRepository.findAll();
        return ResponseEntity.ok(danhSachPhong);
    }
} 