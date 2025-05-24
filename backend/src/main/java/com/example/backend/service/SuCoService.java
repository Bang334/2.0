package com.example.backend.service;

import com.example.backend.model.SuCo;
import com.example.backend.model.Phong;
import com.example.backend.repository.SuCoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class SuCoService {
    @Autowired
    private SuCoRepository suCoRepository;

    public List<SuCo> getAllSuCo() {
        return suCoRepository.findAll();
    }

    public List<SuCo> getSuCoByTrangThai(SuCo.TrangThai trangThai) {
        return suCoRepository.findByTrangThai(trangThai);
    }

    public SuCo updateTrangThaiSuCo(Integer id, SuCo.TrangThai trangThai) {
        SuCo suCo = suCoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sự cố"));
        
        suCo.setTrangThai(trangThai);
        return suCoRepository.save(suCo);
    }

    public Map<String, Object> getThongKeSuCo() {
        List<Object[]> thongKePhong = suCoRepository.thongKeSuCoTheoPhong();
        List<Object[]> thongKeTrangThai = suCoRepository.thongKeSuCoTheoTrangThai();

        Map<String, Object> thongKePhongMap = new HashMap<>();
        for (Object[] obj : thongKePhong) {
            thongKePhongMap.put(((Phong) obj[0]).getMaPhong(), obj[1]);
        }

        Map<String, Object> thongKeTrangThaiMap = new HashMap<>();
        for (Object[] obj : thongKeTrangThai) {
            thongKeTrangThaiMap.put(((SuCo.TrangThai) obj[0]).name(), obj[1]);
        }

        return Map.of(
            "thongKePhong", thongKePhongMap,
            "thongKeTrangThai", thongKeTrangThaiMap
        );
    }
} 