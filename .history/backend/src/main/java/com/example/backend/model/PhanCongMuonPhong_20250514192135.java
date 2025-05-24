package com.example.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Date;

@Entity
@Table(name = "PhanCongMuonPhong")
public class PhanCongMuonPhong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaPhanCong")
    private Integer maPhanCong;

    @ManyToOne
    @JoinColumn(name = "MaSV_NguoiPhanCong", referencedColumnName = "MaSV")
    private SinhVien nguoiPhanCong;

    @ManyToOne
    @JoinColumn(name = "MaSV_NguoiDuocPhanCong", referencedColumnName = "MaSV")
    private SinhVien nguoiDuocPhanCong;

    @ManyToOne
    @JoinColumn(name = "MaTKB", referencedColumnName = "MaTKB")
    private ThoiKhoaBieu thoiKhoaBieu;

    @NotNull
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "ThoiGianPhanCong", nullable = false)
    private Date thoiGianPhanCong;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai", nullable = false)
    private TrangThai trangThai;

    @Size(max = 500)
    @Column(name = "GhiChu")
    private String ghiChu;

    // Enum cho trạng thái phân công
    public enum TrangThai {
        CHOMUON, DAMUON, HUY
    }

    // Constructor mặc định
    public PhanCongMuonPhong() {
        this.thoiGianPhanCong = new Date();
        this.trangThai = TrangThai.CHOMUON;
    }

    // Constructor đầy đủ
    public PhanCongMuonPhong(SinhVien nguoiPhanCong, SinhVien nguoiDuocPhanCong, 
                             ThoiKhoaBieu thoiKhoaBieu, Date thoiGianPhanCong, 
                             TrangThai trangThai, String ghiChu) {
        this.nguoiPhanCong = nguoiPhanCong;
        this.nguoiDuocPhanCong = nguoiDuocPhanCong;
        this.thoiKhoaBieu = thoiKhoaBieu;
        this.thoiGianPhanCong = thoiGianPhanCong;
        this.trangThai = trangThai;
        this.ghiChu = ghiChu;
    }

    // Getters and Setters
    public Integer getMaPhanCong() {
        return maPhanCong;
    }

    public void setMaPhanCong(Integer maPhanCong) {
        this.maPhanCong = maPhanCong;
    }

    public SinhVien getNguoiPhanCong() {
        return nguoiPhanCong;
    }

    public void setNguoiPhanCong(SinhVien nguoiPhanCong) {
        this.nguoiPhanCong = nguoiPhanCong;
    }

    public SinhVien getNguoiDuocPhanCong() {
        return nguoiDuocPhanCong;
    }

    public void setNguoiDuocPhanCong(SinhVien nguoiDuocPhanCong) {
        this.nguoiDuocPhanCong = nguoiDuocPhanCong;
    }

    public ThoiKhoaBieu getThoiKhoaBieu() {
        return thoiKhoaBieu;
    }

    public void setThoiKhoaBieu(ThoiKhoaBieu thoiKhoaBieu) {
        this.thoiKhoaBieu = thoiKhoaBieu;
    }

    public Date getThoiGianPhanCong() {
        return thoiGianPhanCong;
    }

    public void setThoiGianPhanCong(Date thoiGianPhanCong) {
        this.thoiGianPhanCong = thoiGianPhanCong;
    }

    public TrangThai getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(TrangThai trangThai) {
        this.trangThai = trangThai;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }
} 