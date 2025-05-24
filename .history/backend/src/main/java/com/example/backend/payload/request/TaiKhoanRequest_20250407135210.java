package com.example.backend.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TaiKhoanRequest {
    @NotBlank
    @Size(max = 50)
    private String userId;

    @NotBlank
    @Size(min = 6, max = 255)
    private String password;

    @NotBlank
    @Size(max = 100)
    private String hoTen;

    @NotBlank
    @Size(max = 255)
    @Email
    private String email;

    @Size(max = 50)
    private String lienHe;

    @NotBlank
    private String gioiTinh;

    @NotBlank
    private String vaiTro;

    private String trangThai;

    private String maUser;
    
    // Thông tin bổ sung cho giảng viên
    private String chuyenNganh;

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getHoTen() {
        return hoTen;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLienHe() {
        return lienHe;
    }

    public void setLienHe(String lienHe) {
        this.lienHe = lienHe;
    }

    public String getGioiTinh() {
        return gioiTinh;
    }

    public void setGioiTinh(String gioiTinh) {
        this.gioiTinh = gioiTinh;
    }

    public String getVaiTro() {
        return vaiTro;
    }

    public void setVaiTro(String vaiTro) {
        this.vaiTro = vaiTro;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public String getMaUser() {
        return maUser;
    }

    public void setMaUser(String maUser) {
        this.maUser = maUser;
    }

    public String getChuyenNganh() {
        return chuyenNganh;
    }

    public void setChuyenNganh(String chuyenNganh) {
        this.chuyenNganh = chuyenNganh;
    }
} 