package com.example.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "GiangVien")
public class GiangVien {
    @Id
    @Column(name = "MaGV")
    private String maGV;

    @OneToOne
    @JoinColumn(name = "IDNguoiDung", referencedColumnName = "IDNguoiDung")
    private NguoiDung nguoiDung;

    @NotBlank
    @Size(max = 50)
    @Column(name = "Khoa", nullable = false)
    private String khoa;

    // Constructor mặc định
    public GiangVien() {
    }

    public GiangVien(String maGV, NguoiDung nguoiDung, String khoa) {
        this.maGV = maGV;
        this.nguoiDung = nguoiDung;
        this.khoa = khoa;
    }

    // Getters and Setters
    public String getMaGV() {
        return maGV;
    }

    public void setMaGV(String maGV) {
        this.maGV = maGV;
    }

    public NguoiDung getNguoiDung() {
        return nguoiDung;
    }

    public void setNguoiDung(NguoiDung nguoiDung) {
        this.nguoiDung = nguoiDung;
    }

    public String getKhoa() {
        return khoa;
    }

    public void setKhoa(String khoa) {
        this.khoa = khoa;
    }
} 