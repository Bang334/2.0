package com.example.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "TaiKhoan")
public class User {
    @Id
    @Column(name = "ID")
    private String id;

    @NotBlank
    @Size(max = 255)
    @Column(name = "MatKhau", nullable = false)
    private String matKhau;

    @Column(name = "ThoiGianDangNhapCuoi")
    private LocalDateTime thoiGianDangNhapCuoi;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai", nullable = false)
    private TrangThai trangThai;

    // Enum cho trạng thái tài khoản
    public enum TrangThai {
        HoatDong, Khoa
    }

    // Constructor không tham số
    public User() {
    }

    public User(String id, String matKhau, TrangThai trangThai) {
        this.id = id;
        this.matKhau = matKhau;
        this.trangThai = trangThai;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMatKhau() {
        return matKhau;
    }

    public void setMatKhau(String matKhau) {
        this.matKhau = matKhau;
    }

    public LocalDateTime getThoiGianDangNhapCuoi() {
        return thoiGianDangNhapCuoi;
    }

    public void setThoiGianDangNhapCuoi(LocalDateTime thoiGianDangNhapCuoi) {
        this.thoiGianDangNhapCuoi = thoiGianDangNhapCuoi;
    }

    public TrangThai getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(TrangThai trangThai) {
        this.trangThai = trangThai;
    }
}
