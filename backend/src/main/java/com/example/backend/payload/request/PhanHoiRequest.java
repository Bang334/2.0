package com.example.backend.payload.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PhanHoiRequest {
    @NotNull
    private Integer maYeuCau;
    
    private Integer maLichSu;
    
    @NotNull
    @Min(1)
    @Max(5)
    private Integer danhGia;
    
    @Size(max = 500)
    private String nhanXet;
    
    // Getters and Setters
    public Integer getMaYeuCau() {
        return maYeuCau;
    }
    
    public void setMaYeuCau(Integer maYeuCau) {
        this.maYeuCau = maYeuCau;
    }
    
    public Integer getMaLichSu() {
        return maLichSu;
    }
    
    public void setMaLichSu(Integer maLichSu) {
        this.maLichSu = maLichSu;
    }
    
    public Integer getDanhGia() {
        return danhGia;
    }
    
    public void setDanhGia(Integer danhGia) {
        this.danhGia = danhGia;
    }
    
    public String getNhanXet() {
        return nhanXet;
    }
    
    public void setNhanXet(String nhanXet) {
        this.nhanXet = nhanXet;
    }
} 