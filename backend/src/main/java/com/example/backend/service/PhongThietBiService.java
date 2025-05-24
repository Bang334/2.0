package com.example.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.PhongThietBiDTO;
import com.example.backend.model.Phong;
import com.example.backend.model.PhongThietBi;
import com.example.backend.model.ThietBi;
import com.example.backend.repository.PhongRepository;
import com.example.backend.repository.PhongThietBiRepository;
import com.example.backend.repository.ThietBiRepository;

@Service
public class PhongThietBiService {
    
    @Autowired
    private PhongThietBiRepository phongThietBiRepository;
    
    @Autowired
    private PhongRepository phongRepository;
    
    @Autowired
    private ThietBiRepository thietBiRepository;
    
    // Get all device-room mappings
    public List<PhongThietBiDTO> getAllPhongThietBi() {
        return phongThietBiRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get device-room mappings by room
    public List<PhongThietBiDTO> getThietBiByPhong(String maPhong) {
        Phong phong = phongRepository.findById(maPhong)
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại với mã: " + maPhong));
        
        return phongThietBiRepository.findByPhong(phong)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get rooms by device
    public List<PhongThietBiDTO> getPhongByThietBi(Long maThietBi) {
        return phongThietBiRepository.findByThietBiMaThietBi(maThietBi)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Add device to room
    @Transactional
    public PhongThietBiDTO addThietBiToPhong(PhongThietBiDTO phongThietBiDTO) {
        Phong phong = phongRepository.findById(phongThietBiDTO.getMaPhong())
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại với mã: " + phongThietBiDTO.getMaPhong()));
        
        ThietBi thietBi = thietBiRepository.findById(phongThietBiDTO.getMaThietBi())
                .orElseThrow(() -> new RuntimeException("Thiết bị không tồn tại với mã: " + phongThietBiDTO.getMaThietBi()));
        
        // Check if mapping already exists
        PhongThietBi existingMapping = phongThietBiRepository.findByPhongAndThietBi(phong, thietBi);
        if (existingMapping != null) {
            // Update existing mapping
            existingMapping.setSoLuong(phongThietBiDTO.getSoLuong());
            existingMapping.setGhiChu(phongThietBiDTO.getGhiChu());
            return convertToDTO(phongThietBiRepository.save(existingMapping));
        }
        
        // Create new mapping
        PhongThietBi phongThietBi = new PhongThietBi();
        phongThietBi.setPhong(phong);
        phongThietBi.setThietBi(thietBi);
        phongThietBi.setSoLuong(phongThietBiDTO.getSoLuong());
        phongThietBi.setGhiChu(phongThietBiDTO.getGhiChu());
        
        PhongThietBi savedMapping = phongThietBiRepository.save(phongThietBi);
        return convertToDTO(savedMapping);
    }
    
    // Update device-room mapping
    @Transactional
    public PhongThietBiDTO updatePhongThietBi(Long id, PhongThietBiDTO phongThietBiDTO) {
        PhongThietBi phongThietBi = phongThietBiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mapping không tồn tại với ID: " + id));
        
        phongThietBi.setSoLuong(phongThietBiDTO.getSoLuong());
        phongThietBi.setGhiChu(phongThietBiDTO.getGhiChu());
        
        PhongThietBi updatedMapping = phongThietBiRepository.save(phongThietBi);
        return convertToDTO(updatedMapping);
    }
    
    // Remove device from room
    @Transactional
    public void removeThietBiFromPhong(String maPhong, Long maThietBi) {
        Phong phong = phongRepository.findById(maPhong)
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại với mã: " + maPhong));
        
        ThietBi thietBi = thietBiRepository.findById(maThietBi)
                .orElseThrow(() -> new RuntimeException("Thiết bị không tồn tại với mã: " + maThietBi));
        
        PhongThietBi mapping = phongThietBiRepository.findByPhongAndThietBi(phong, thietBi);
        if (mapping == null) {
            throw new RuntimeException("Thiết bị không được tìm thấy trong phòng này");
        }
        
        phongThietBiRepository.delete(mapping);
    }
    
    // Delete mapping by ID
    public void deletePhongThietBi(Long id) {
        if (!phongThietBiRepository.existsById(id)) {
            throw new RuntimeException("Mapping không tồn tại với ID: " + id);
        }
        phongThietBiRepository.deleteById(id);
    }
    
    // Convert entity to DTO
    private PhongThietBiDTO convertToDTO(PhongThietBi phongThietBi) {
        return new PhongThietBiDTO(
            phongThietBi.getId(),
            phongThietBi.getPhong().getMaPhong(),
            phongThietBi.getThietBi().getMaThietBi(),
            phongThietBi.getThietBi().getTenThietBi(),
            phongThietBi.getSoLuong(),
            phongThietBi.getGhiChu(),
            phongThietBi.getThietBi().getTrangThai()
        );
    }
} 