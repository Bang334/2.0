package com.example.backend.dto;

public class ThietBiDTO {
    private Long maThietBi;
    private String tenThietBi;
    private String moTa;
    private Boolean trangThai;
    
    public ThietBiDTO() {
    }
    
    public ThietBiDTO(Long maThietBi, String tenThietBi, String moTa, Boolean trangThai) {
        this.maThietBi = maThietBi;
        this.tenThietBi = tenThietBi;
        this.moTa = moTa;
        this.trangThai = trangThai;
    }

    public Long getMaThietBi() {
        return maThietBi;
    }

    public void setMaThietBi(Long maThietBi) {
        this.maThietBi = maThietBi;
    }

    public String getTenThietBi() {
        return tenThietBi;
    }

    public void setTenThietBi(String tenThietBi) {
        this.tenThietBi = tenThietBi;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public Boolean getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Boolean trangThai) {
        this.trangThai = trangThai;
    }
} 