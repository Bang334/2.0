package com.example.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ThietBiDTO;
import com.example.backend.service.ThietBiService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/quanly/thietbi")
public class ThietBiController {
    
    @Autowired
    private ThietBiService thietBiService;
    
    // Get all devices
    @GetMapping
    public ResponseEntity<List<ThietBiDTO>> getAllThietBi() {
        List<ThietBiDTO> thietBis = thietBiService.getAllThietBi();
        return new ResponseEntity<>(thietBis, HttpStatus.OK);
    }
    
    // Get device by ID
    @GetMapping("/{maThietBi}")
    public ResponseEntity<ThietBiDTO> getThietBiById(@PathVariable Long maThietBi) {
        ThietBiDTO thietBi = thietBiService.getThietBiById(maThietBi);
        return new ResponseEntity<>(thietBi, HttpStatus.OK);
    }
    
    // Create new device
    @PostMapping
    public ResponseEntity<ThietBiDTO> createThietBi(@RequestBody ThietBiDTO thietBiDTO) {
        ThietBiDTO newThietBi = thietBiService.createThietBi(thietBiDTO);
        return new ResponseEntity<>(newThietBi, HttpStatus.CREATED);
    }
    
    // Update device
    @PutMapping("/{maThietBi}")
    public ResponseEntity<ThietBiDTO> updateThietBi(@PathVariable Long maThietBi, @RequestBody ThietBiDTO thietBiDTO) {
        ThietBiDTO updatedThietBi = thietBiService.updateThietBi(maThietBi, thietBiDTO);
        return new ResponseEntity<>(updatedThietBi, HttpStatus.OK);
    }
    
    // Delete device
    @DeleteMapping("/{maThietBi}")
    public ResponseEntity<Void> deleteThietBi(@PathVariable Long maThietBi) {
        thietBiService.deleteThietBi(maThietBi);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    // Public endpoint to get all active equipment (for non-admin users)
    @GetMapping("/public")
    public ResponseEntity<List<ThietBiDTO>> getAllActiveThietBi() {
        List<ThietBiDTO> thietBis = thietBiService.getAllThietBi()
                .stream()
                .filter(thietBi -> thietBi.getTrangThai()) // Only return active equipment
                .collect(Collectors.toList());
        return new ResponseEntity<>(thietBis, HttpStatus.OK);
    }
} 