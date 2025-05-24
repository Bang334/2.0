package com.example.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Date;

public class YeuCauMuonPhongRequest {
    @NotBlank
    private String maPhong;
    
    @NotNull
    private Date thoiGianMuon;
    
    private Date thoiGianTra;
    
    @NotBlank
    @Size(max = 255)
    private String mucDich;
    
    private String idNguoiDuyet;
    
    private String lyDo;
    
    // Getters and Setters
    public String getMaPhong() {
        return maPhong;
    }
    
    public void setMaPhong(String maPhong) {
        this.maPhong = maPhong;
    }
    
    public Date getThoiGianMuon() {
        return thoiGianMuon;
    }
    
    public void setThoiGianMuon(Date thoiGianMuon) {
        this.thoiGianMuon = thoiGianMuon;
    }
    
    public Date getThoiGianTra() {
        return thoiGianTra;
    }
    
    public void setThoiGianTra(Date thoiGianTra) {
        this.thoiGianTra = thoiGianTra;
    }
    
    public String getMucDich() {
        return mucDich;
    }
    
    public void setMucDich(String mucDich) {
        this.mucDich = mucDich;
    }
    
    public String getIdNguoiDuyet() {
        return idNguoiDuyet;
    }
    
    public void setIdNguoiDuyet(String idNguoiDuyet) {
        this.idNguoiDuyet = idNguoiDuyet;
    }
    
    public String getLyDo() {
        return lyDo;
    }
    
    public void setLyDo(String lyDo) {
        this.lyDo = lyDo;
    }
} 