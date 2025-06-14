package com.example.backend.repository;

import java.util.List;
import java.util.Date;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.ThongBaoNhan;

@Repository
public interface ThongBaoNhanRepository extends JpaRepository<ThongBaoNhan, Integer> {
    List<ThongBaoNhan> findByNguoiNhanIdNguoiDung(String idNguoiDung);
    List<ThongBaoNhan> findByThongBaoGuiIdTB(Integer idTB);
    List<ThongBaoNhan> findByNguoiNhanIdNguoiDungOrderByThongBaoGuiThoiGianDesc(String idNguoiDung);
    List<ThongBaoNhan> findByTrangThaiAndThongBaoGui_ThoiGianBefore(ThongBaoNhan.TrangThai trangThai, Date thoiGian);
} 