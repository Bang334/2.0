package com.example.backend.controller;

import java.util.List;

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

import com.example.backend.dto.PhongThietBiDTO;
import com.example.backend.service.PhongThietBiService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/quanly/phong-thietbi")
public class PhongThietBiController {
    
    @Autowired
    private PhongThietBiService phongThietBiService;
    
    // Get all device-room mappings
    @GetMapping
    public ResponseEntity<List<PhongThietBiDTO>> getAllPhongThietBi() {
        List<PhongThietBiDTO> mappings = phongThietBiService.getAllPhongThietBi();
        return new ResponseEntity<>(mappings, HttpStatus.OK);
    }
    
    // Get devices by room
    @GetMapping("/phong/{maPhong}")
    public ResponseEntity<List<PhongThietBiDTO>> getThietBiByPhong(@PathVariable String maPhong) {
        List<PhongThietBiDTO> devices = phongThietBiService.getThietBiByPhong(maPhong);
        return new ResponseEntity<>(devices, HttpStatus.OK);
    }
    
    // Get rooms by device
    @GetMapping("/thietbi/{maThietBi}")
    public ResponseEntity<List<PhongThietBiDTO>> getPhongByThietBi(@PathVariable Long maThietBi) {
        List<PhongThietBiDTO> rooms = phongThietBiService.getPhongByThietBi(maThietBi);
        return new ResponseEntity<>(rooms, HttpStatus.OK);
    }
    
    // Add device to room
    @PostMapping
    public ResponseEntity<PhongThietBiDTO> addThietBiToPhong(@RequestBody PhongThietBiDTO phongThietBiDTO) {
        PhongThietBiDTO mapping = phongThietBiService.addThietBiToPhong(phongThietBiDTO);
        return new ResponseEntity<>(mapping, HttpStatus.CREATED);
    }
    
    // Update device-room mapping
    @PutMapping("/{id}")
    public ResponseEntity<PhongThietBiDTO> updatePhongThietBi(@PathVariable Long id, @RequestBody PhongThietBiDTO phongThietBiDTO) {
        PhongThietBiDTO updatedMapping = phongThietBiService.updatePhongThietBi(id, phongThietBiDTO);
        return new ResponseEntity<>(updatedMapping, HttpStatus.OK);
    }
    
    // Remove device from room
    @DeleteMapping("/phong/{maPhong}/thietbi/{maThietBi}")
    public ResponseEntity<Void> removeThietBiFromPhong(@PathVariable String maPhong, @PathVariable Long maThietBi) {
        phongThietBiService.removeThietBiFromPhong(maPhong, maThietBi);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    // Delete mapping by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePhongThietBi(@PathVariable Long id) {
        phongThietBiService.deletePhongThietBi(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}