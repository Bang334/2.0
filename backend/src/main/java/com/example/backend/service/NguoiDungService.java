package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.model.NguoiDung;
import com.example.backend.repository.NguoiDungRepository;
import com.example.backend.exception.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class NguoiDungService {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    public List<NguoiDung> getAllNguoiDung() {
        return nguoiDungRepository.findAll();
    }

    public NguoiDung getNguoiDungById(String id) {
        return nguoiDungRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));
    }
    
    public Optional<NguoiDung> findByTaiKhoanId(String taiKhoanId) {
        return nguoiDungRepository.findByTaiKhoanId(taiKhoanId);
    }
} 