package com.example.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Date;

@Entity
@Table(name = "PhanHoi")
public class PhanHoi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "MaPhong", referencedColumnName = "MaPhong")
    private Phong phong;

    @ManyToOne
    @JoinColumn(name = "IDNguoiDung", referencedColumnName = "IDNguoiDung")
    private NguoiDung nguoiDung;

    @NotNull
    @Min(1)
    @Max(5)
    @Column(name = "DiemDanhGia", nullable = false)
    private Integer diemDanhGia;

    @NotBlank
    @Size(max = 500)
    @Column(name = "NoiDung", nullable = false)
    private String noiDung;

    @NotNull
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "ThoiGian", nullable = false)
    private Date thoiGian;

    @Size(max = 500)
    @Column(name = "PhanHoiCuaQuanLy")
    private String phanHoiCuaQuanLy;

    @ManyToOne
    @JoinColumn(name = "IDQuanLyPhanHoi", referencedColumnName = "IDNguoiDung")
    private NguoiDung quanLyPhanHoi;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "ThoiGianPhanHoi")
    private Date thoiGianPhanHoi;

    @Column(name = "DanhDau")
    private Boolean danhDau = false;

    // Constructor mặc định
    public PhanHoi() {
    }

    // Constructor với các trường bắt buộc
    public PhanHoi(Phong phong, NguoiDung nguoiDung, Integer diemDanhGia, String noiDung, Date thoiGian) {
        this.phong = phong;
        this.nguoiDung = nguoiDung;
        this.diemDanhGia = diemDanhGia;
        this.noiDung = noiDung;
        this.thoiGian = thoiGian;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Phong getPhong() {
        return phong;
    }

    public void setPhong(Phong phong) {
        this.phong = phong;
    }

    public NguoiDung getNguoiDung() {
        return nguoiDung;
    }

    public void setNguoiDung(NguoiDung nguoiDung) {
        this.nguoiDung = nguoiDung;
    }

    public Integer getDiemDanhGia() {
        return diemDanhGia;
    }

    public void setDiemDanhGia(Integer diemDanhGia) {
        this.diemDanhGia = diemDanhGia;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }

    public Date getThoiGian() {
        return thoiGian;
    }

    public void setThoiGian(Date thoiGian) {
        this.thoiGian = thoiGian;
    }

    public String getPhanHoiCuaQuanLy() {
        return phanHoiCuaQuanLy;
    }

    public void setPhanHoiCuaQuanLy(String phanHoiCuaQuanLy) {
        this.phanHoiCuaQuanLy = phanHoiCuaQuanLy;
    }

    public NguoiDung getQuanLyPhanHoi() {
        return quanLyPhanHoi;
    }

    public void setQuanLyPhanHoi(NguoiDung quanLyPhanHoi) {
        this.quanLyPhanHoi = quanLyPhanHoi;
    }

    public Date getThoiGianPhanHoi() {
        return thoiGianPhanHoi;
    }

    public void setThoiGianPhanHoi(Date thoiGianPhanHoi) {
        this.thoiGianPhanHoi = thoiGianPhanHoi;
    }

    public Boolean getDanhDau() {
        return danhDau;
    }

    public void setDanhDau(Boolean danhDau) {
        this.danhDau = danhDau;
    }
} 