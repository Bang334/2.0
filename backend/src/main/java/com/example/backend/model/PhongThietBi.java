package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "PhongThietBi", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "MaPhong", "MaThietBi" })
})
public class PhongThietBi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MaPhong", referencedColumnName = "MaPhong", nullable = false)
    @JsonBackReference
    private Phong phong;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MaThietBi", referencedColumnName = "MaThietBi", nullable = false)
    private ThietBi thietBi;

    @Column(name = "SoLuong", nullable = false)
    private Integer soLuong = 1;

    @Column(name = "GhiChu")
    private String ghiChu;

    // Constructor mặc định
    public PhongThietBi() {
    }

    public PhongThietBi(Phong phong, ThietBi thietBi, Integer soLuong, String ghiChu) {
        this.phong = phong;
        this.thietBi = thietBi;
        this.soLuong = soLuong;
        this.ghiChu = ghiChu;
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

    public ThietBi getThietBi() {
        return thietBi;
    }

    public void setThietBi(ThietBi thietBi) {
        this.thietBi = thietBi;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }
} 