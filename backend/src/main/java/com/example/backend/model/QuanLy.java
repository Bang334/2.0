package com.example.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "QuanLy")
public class QuanLy {
    @Id
    @Column(name = "MaQL")
    private String maQL;

    @OneToOne
    @JoinColumn(name = "IDNguoiDung", referencedColumnName = "IDNguoiDung")
    private NguoiDung nguoiDung;

    // Constructor mặc định
    public QuanLy() {
    }

    public QuanLy(String maQL, NguoiDung nguoiDung) {
        this.maQL = maQL;
        this.nguoiDung = nguoiDung;
    }

    // Getters and Setters
    public String getMaQL() {
        return maQL;
    }

    public void setMaQL(String maQL) {
        this.maQL = maQL;
    }

    public NguoiDung getNguoiDung() {
        return nguoiDung;
    }

    public void setNguoiDung(NguoiDung nguoiDung) {
        this.nguoiDung = nguoiDung;
    }
} 