package com.example.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "SinhVien")
public class SinhVien {
    @Id
    @Column(name = "MaSV")
    private String maSV;

    @ManyToOne
    @JoinColumn(name = "MaLop", referencedColumnName = "MaLop")
    private LopHoc lopHoc;

    @OneToOne
    @JoinColumn(name = "IDNguoiDung", referencedColumnName = "IDNguoiDung")
    private NguoiDung nguoiDung;

    // Constructor mặc định
    public SinhVien() {
    }

    public SinhVien(String maSV, LopHoc lopHoc, NguoiDung nguoiDung) {
        this.maSV = maSV;
        this.lopHoc = lopHoc;
        this.nguoiDung = nguoiDung;
    }

    // Getters and Setters
    public String getMaSV() {
        return maSV;
    }

    public void setMaSV(String maSV) {
        this.maSV = maSV;
    }

    public LopHoc getLopHoc() {
        return lopHoc;
    }

    public void setLopHoc(LopHoc lopHoc) {
        this.lopHoc = lopHoc;
    }

    public NguoiDung getNguoiDung() {
        return nguoiDung;
    }

    public void setNguoiDung(NguoiDung nguoiDung) {
        this.nguoiDung = nguoiDung;
    }
} 