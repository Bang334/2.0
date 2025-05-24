package com.example.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dto.ThietBiDTO;
import com.example.backend.model.ThietBi;
import com.example.backend.repository.ThietBiRepository;

@Service
public class ThietBiService {
    
    @Autowired
    private ThietBiRepository thietBiRepository;
    
    // Get all devices
    public List<ThietBiDTO> getAllThietBi() {
        return thietBiRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get device by ID
    public ThietBiDTO getThietBiById(Long maThietBi) {
        ThietBi thietBi = thietBiRepository.findById(maThietBi)
                .orElseThrow(() -> new RuntimeException("Thiết bị không tồn tại với mã: " + maThietBi));
        return convertToDTO(thietBi);
    }
    
    // Create new device
    public ThietBiDTO createThietBi(ThietBiDTO thietBiDTO) {
        ThietBi thietBi = new ThietBi();
        thietBi.setTenThietBi(thietBiDTO.getTenThietBi());
        thietBi.setMoTa(thietBiDTO.getMoTa());
        thietBi.setTrangThai(thietBiDTO.getTrangThai() != null ? thietBiDTO.getTrangThai() : true);
        
        ThietBi savedThietBi = thietBiRepository.save(thietBi);
        return convertToDTO(savedThietBi);
    }
    
    // Update device
    public ThietBiDTO updateThietBi(Long maThietBi, ThietBiDTO thietBiDTO) {
        ThietBi thietBi = thietBiRepository.findById(maThietBi)
                .orElseThrow(() -> new RuntimeException("Thiết bị không tồn tại với mã: " + maThietBi));
        
        thietBi.setTenThietBi(thietBiDTO.getTenThietBi());
        thietBi.setMoTa(thietBiDTO.getMoTa());
        if (thietBiDTO.getTrangThai() != null) {
            thietBi.setTrangThai(thietBiDTO.getTrangThai());
        }
        
        ThietBi updatedThietBi = thietBiRepository.save(thietBi);
        return convertToDTO(updatedThietBi);
    }
    
    // Delete device by ID
    public void deleteThietBi(Long maThietBi) {
        if (!thietBiRepository.existsById(maThietBi)) {
            throw new RuntimeException("Thiết bị không tồn tại với mã: " + maThietBi);
        }
        thietBiRepository.deleteById(maThietBi);
    }
    
    // Convert entity to DTO
    private ThietBiDTO convertToDTO(ThietBi thietBi) {
        return new ThietBiDTO(
            thietBi.getMaThietBi(),
            thietBi.getTenThietBi(),
            thietBi.getMoTa(),
            thietBi.getTrangThai()
        );
    }
    
    // Convert DTO to entity
    public ThietBi convertToEntity(ThietBiDTO thietBiDTO) {
        ThietBi thietBi = new ThietBi();
        thietBi.setMaThietBi(thietBiDTO.getMaThietBi());
        thietBi.setTenThietBi(thietBiDTO.getTenThietBi());
        thietBi.setMoTa(thietBiDTO.getMoTa());
        thietBi.setTrangThai(thietBiDTO.getTrangThai());
        return thietBi;
    }
} 