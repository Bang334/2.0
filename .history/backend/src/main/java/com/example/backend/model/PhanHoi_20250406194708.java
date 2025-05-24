package com.example.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Date;

@Entity
@Table(name = "PhanHoi")
public class PhanHoi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDPhanHoi")
    private Integer idPhanHoi;

    @ManyToOne
    @JoinColumn(name = "MaYeuCau", referencedColumnName = "MaLichSu")
    private LichSuMuonPhong lichSuMuonPhong;

    @NotNull
    @Min(1)
    @Max(5)
    @Column(name = "DanhGia", nullable = false)
    private Integer danhGia;

    @Size(max = 500)
    @Column(name = "NhanXet")
    private String nhanXet;

    @NotNull
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "ThoiGian", nullable = false)
    private Date thoiGian;

    // Constructor mặc định
    public PhanHoi() {
    }

    public PhanHoi(LichSuMuonPhong lichSuMuonPhong, Integer danhGia, String nhanXet, Date thoiGian) {
        this.lichSuMuonPhong = lichSuMuonPhong;
        this.danhGia = danhGia;
        this.nhanXet = nhanXet;
        this.thoiGian = thoiGian;
    }

    // Getters and Setters
    public Integer getIdPhanHoi() {
        return idPhanHoi;
    }

    public void setIdPhanHoi(Integer idPhanHoi) {
        this.idPhanHoi = idPhanHoi;
    }

    public LichSuMuonPhong getLichSuMuonPhong() {
        return lichSuMuonPhong;
    }

    public void setLichSuMuonPhong(LichSuMuonPhong lichSuMuonPhong) {
        this.lichSuMuonPhong = lichSuMuonPhong;
    }

    public Integer getDanhGia() {
        return danhGia;
    }

    public void setDanhGia(Integer danhGia) {
        this.danhGia = danhGia;
    }

    public String getNhanXet() {
        return nhanXet;
    }

    public void setNhanXet(String nhanXet) {
        this.nhanXet = nhanXet;
    }

    public Date getThoiGian() {
        return thoiGian;
    }

    public void setThoiGian(Date thoiGian) {
        this.thoiGian = thoiGian;
    }
} 