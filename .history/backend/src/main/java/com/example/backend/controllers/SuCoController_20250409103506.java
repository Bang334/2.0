package com.example.backend.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.repository.SuCoRepository;
import com.example.backend.repository.YeuCauMuonPhongRepository;
import com.example.backend.repository.LichSuMuonPhongRepository;
import com.example.backend.model.LichSuMuonPhong;
import com.example.backend.model.YeuCauMuonPhong;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/suco")
public class SuCoController {
    
    @Autowired
    private SuCoRepository suCoRepository;
    
    @Autowired
    private YeuCauMuonPhongRepository yeuCauMuonPhongRepository;
    
    @Autowired
    private LichSuMuonPhongRepository lichSuMuonPhongRepository;
    
    /**
     * Kiểm tra xem một yêu cầu mượn phòng đã được báo cáo sự cố hay chưa
     * @param maYeuCau Mã yêu cầu mượn phòng cần kiểm tra
     * @return true nếu đã có báo cáo sự cố, false nếu chưa
     */
    @GetMapping("/kiemtra/{maYeuCau}")
    @PreAuthorize("hasRole('SV') or hasRole('GV') or hasRole('ADMIN')")
    public ResponseEntity<?> kiemTraDaBaoCao(@PathVariable Integer maYeuCau) {
        // Kiểm tra trực tiếp từ repository với JPQL query
        boolean daBaoCao = suCoRepository.existsByMaYeuCau(maYeuCau);
        
        // Nếu chưa có báo cáo, kiểm tra thêm qua lịch sử mượn phòng
        if (!daBaoCao) {
            // Lấy danh sách lịch sử mượn phòng của yêu cầu này
            List<LichSuMuonPhong> lichSuList = lichSuMuonPhongRepository.findByYeuCauMuonPhongMaYeuCau(maYeuCau);
            
            // Kiểm tra từng bản ghi lịch sử xem có báo cáo sự cố liên quan không
            for (LichSuMuonPhong lichSu : lichSuList) {
                if (!suCoRepository.findByLichSuMuonPhong(lichSu).isEmpty()) {
                    daBaoCao = true;
                    break;
                }
            }
        }
        
        Map<String, Boolean> result = new HashMap<>();
        result.put("daBaoCao", daBaoCao);
        
        return ResponseEntity.ok(result);
    }
} 