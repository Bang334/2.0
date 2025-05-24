package com.example.backend.payload.response;

import java.util.Date;

public class PhanCongMuonPhongResponse {
    
    private Integer maPhanCong;
    private String maSVNguoiPhanCong;
    private String tenNguoiPhanCong;
    private String maSVNguoiDuocPhanCong;
    private String tenNguoiDuocPhanCong;
    private Integer maTKB;
    private Date thoiGianPhanCong;
    private String trangThai;
    private String ghiChu;

    // Constructors
    public PhanCongMuonPhongResponse() {
    }

    public PhanCongMuonPhongResponse(Integer maPhanCong, String maSVNguoiPhanCong, String tenNguoiPhanCong,
                                    String maSVNguoiDuocPhanCong, String tenNguoiDuocPhanCong, 
                                    Integer maTKB, Date thoiGianPhanCong, 
                                    String trangThai, String ghiChu) {
        this.maPhanCong = maPhanCong;
        this.maSVNguoiPhanCong = maSVNguoiPhanCong;
        this.tenNguoiPhanCong = tenNguoiPhanCong;
        this.maSVNguoiDuocPhanCong = maSVNguoiDuocPhanCong;
        this.tenNguoiDuocPhanCong = tenNguoiDuocPhanCong;
        this.maTKB = maTKB;
        this.thoiGianPhanCong = thoiGianPhanCong;
        this.trangThai = trangThai;
        this.ghiChu = ghiChu;
    }

    // Getters and Setters
    public Integer getMaPhanCong() {
        return maPhanCong;
    }

    public void setMaPhanCong(Integer maPhanCong) {
        this.maPhanCong = maPhanCong;
    }

    public String getMaSVNguoiPhanCong() {
        return maSVNguoiPhanCong;
    }

    public void setMaSVNguoiPhanCong(String maSVNguoiPhanCong) {
        this.maSVNguoiPhanCong = maSVNguoiPhanCong;
    }

    public String getTenNguoiPhanCong() {
        return tenNguoiPhanCong;
    }

    public void setTenNguoiPhanCong(String tenNguoiPhanCong) {
        this.tenNguoiPhanCong = tenNguoiPhanCong;
    }

    public String getMaSVNguoiDuocPhanCong() {
        return maSVNguoiDuocPhanCong;
    }

    public void setMaSVNguoiDuocPhanCong(String maSVNguoiDuocPhanCong) {
        this.maSVNguoiDuocPhanCong = maSVNguoiDuocPhanCong;
    }

    public String getTenNguoiDuocPhanCong() {
        return tenNguoiDuocPhanCong;
    }

    public void setTenNguoiDuocPhanCong(String tenNguoiDuocPhanCong) {
        this.tenNguoiDuocPhanCong = tenNguoiDuocPhanCong;
    }

    public Integer getMaTKB() {
        return maTKB;
    }

    public void setMaTKB(Integer maTKB) {
        this.maTKB = maTKB;
    }

    public Date getThoiGianPhanCong() {
        return thoiGianPhanCong;
    }

    public void setThoiGianPhanCong(Date thoiGianPhanCong) {
        this.thoiGianPhanCong = thoiGianPhanCong;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }
} 