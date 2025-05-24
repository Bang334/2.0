package com.example.backend.dto;

public class PhongThietBiDTO {
    private Long id;
    private String maPhong;
    private Long maThietBi;
    private String tenThietBi;
    private Integer soLuong;
    private String ghiChu;
    private Boolean trangThaiThietBi;
    
    public PhongThietBiDTO() {
    }
    
    public PhongThietBiDTO(Long id, String maPhong, Long maThietBi, String tenThietBi, Integer soLuong, String ghiChu, Boolean trangThaiThietBi) {
        this.id = id;
        this.maPhong = maPhong;
        this.maThietBi = maThietBi;
        this.tenThietBi = tenThietBi;
        this.soLuong = soLuong;
        this.ghiChu = ghiChu;
        this.trangThaiThietBi = trangThaiThietBi;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMaPhong() {
        return maPhong;
    }

    public void setMaPhong(String maPhong) {
        this.maPhong = maPhong;
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

    public Boolean getTrangThaiThietBi() {
        return trangThaiThietBi;
    }

    public void setTrangThaiThietBi(Boolean trangThaiThietBi) {
        this.trangThaiThietBi = trangThaiThietBi;
    }
} 