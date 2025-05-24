package com.example.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "ThietBi")
public class ThietBi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaThietBi")
    private Long maThietBi;

    @NotBlank
    @Size(max = 100)
    @Column(name = "TenThietBi", nullable = false)
    private String tenThietBi;

    @Size(max = 255)
    @Column(name = "MoTa")
    private String moTa;

    @Column(name = "TrangThai", nullable = false)
    private Boolean trangThai = true; // true: hoạt động, false: hỏng

    // Constructor mặc định
    public ThietBi() {
    }

    public ThietBi(String tenThietBi, String moTa, Boolean trangThai) {
        this.tenThietBi = tenThietBi;
        this.moTa = moTa;
        this.trangThai = trangThai;
    }

    // Getters and Setters
    public Long getMaThietBi() {
        return maThietBi;
    }

    public void setMaThietBi(Long maThietBi) {
        this.maThietBi = maThietBi;
    }

    public String getTenThietBi() {
        return tenThietBi;
    }

    public void setTenThietBi(String tenThietBi) {
        this.tenThietBi = tenThietBi;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public Boolean getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Boolean trangThai) {
        this.trangThai = trangThai;
    }
} 