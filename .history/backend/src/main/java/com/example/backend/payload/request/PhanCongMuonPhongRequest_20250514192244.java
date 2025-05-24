package com.example.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PhanCongMuonPhongRequest {
    
    @NotBlank
    @Size(max = 255)
    private String maSVNguoiDuocPhanCong;

    @NotNull
    private Integer maTKB;

    @Size(max = 500)
    private String ghiChu;

    // Getters and Setters
    public String getMaSVNguoiDuocPhanCong() {
        return maSVNguoiDuocPhanCong;
    }

    public void setMaSVNguoiDuocPhanCong(String maSVNguoiDuocPhanCong) {
        this.maSVNguoiDuocPhanCong = maSVNguoiDuocPhanCong;
    }

    public Integer getMaTKB() {
        return maTKB;
    }

    public void setMaTKB(Integer maTKB) {
        this.maTKB = maTKB;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }
} 