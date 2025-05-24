package com.example.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "MonHoc")
public class MonHoc {
    @Id
    @Column(name = "MaMon")
    private String maMon;

    @NotBlank
    @Size(max = 255)
    @Column(name = "TenMon", nullable = false)
    private String tenMon;

    // Constructor mặc định
    public MonHoc() {
    }

    public MonHoc(String maMon, String tenMon) {
        this.maMon = maMon;
        this.tenMon = tenMon;
    }

    // Getters and Setters
    public String getMaMon() {
        return maMon;
    }

    public void setMaMon(String maMon) {
        this.maMon = maMon;
    }

    public String getTenMon() {
        return tenMon;
    }

    public void setTenMon(String tenMon) {
        this.tenMon = tenMon;
    }
} 