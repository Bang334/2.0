package com.example.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "LopHoc")
public class LopHoc {
    @Id
    @Column(name = "MaLop")
    private String maLop;

    @NotBlank
    @Size(max = 100)
    @Column(name = "TenLop", nullable = false)
    private String tenLop;

    @NotNull
    @Column(name = "SiSo", nullable = false)
    private Integer siSo;

    // Constructor mặc định
    public LopHoc() {
    }

    public LopHoc(String maLop, String tenLop, Integer siSo) {
        this.maLop = maLop;
        this.tenLop = tenLop;
        this.siSo = siSo;
    }

    // Getters and Setters
    public String getMaLop() {
        return maLop;
    }

    public void setMaLop(String maLop) {
        this.maLop = maLop;
    }

    public String getTenLop() {
        return tenLop;
    }

    public void setTenLop(String tenLop) {
        this.tenLop = tenLop;
    }

    public Integer getSiSo() {
        return siSo;
    }

    public void setSiSo(Integer siSo) {
        this.siSo = siSo;
    }
} 