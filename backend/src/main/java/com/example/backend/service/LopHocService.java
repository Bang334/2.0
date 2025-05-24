package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.model.LopHoc;
import com.example.backend.model.SinhVien;
import com.example.backend.repository.LopHocRepository;
import com.example.backend.repository.SinhVienRepository;
import com.example.backend.exception.ResourceNotFoundException;

import java.util.ArrayList;
import java.util.List;

@Service
public class LopHocService {

    @Autowired
    private LopHocRepository lopHocRepository;
    
    @Autowired
    private SinhVienRepository sinhVienRepository;

    public List<LopHoc> getAllLopHoc() {
        return lopHocRepository.findAll();
    }

    public LopHoc getLopHocById(String maLop) {
        return lopHocRepository.findById(maLop)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học với mã: " + maLop));
    }
    
    public List<LopHoc> getLopHocOfSinhVien(String idNguoiDung) {
        List<LopHoc> result = new ArrayList<>();
        SinhVien sinhVien = sinhVienRepository.findByNguoiDungIdNguoiDung(idNguoiDung);
        if (sinhVien != null && sinhVien.getLopHoc() != null) {
            result.add(sinhVien.getLopHoc());
        }
        return result;
    }
} 