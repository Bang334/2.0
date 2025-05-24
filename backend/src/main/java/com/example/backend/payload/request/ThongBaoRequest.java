package com.example.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class ThongBaoRequest {
    @NotBlank
    @Size(max = 250)
    private String tieuDe;
    
    @NotBlank
    @Size(max = 500)
    private String noiDung;
    
    private Boolean guiChoLop;
    
    private String maLop;
    
    private List<String> danhSachNguoiNhan;
    
    // Getters and Setters
    public String getTieuDe() {
        return tieuDe;
    }
    
    public void setTieuDe(String tieuDe) {
        this.tieuDe = tieuDe;
    }
    
    public String getNoiDung() {
        return noiDung;
    }
    
    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }
    
    public Boolean getGuiChoLop() {
        return guiChoLop;
    }
    
    public void setGuiChoLop(Boolean guiChoLop) {
        this.guiChoLop = guiChoLop;
    }
    
    public String getMaLop() {
        return maLop;
    }
    
    public void setMaLop(String maLop) {
        this.maLop = maLop;
    }
    
    public List<String> getDanhSachNguoiNhan() {
        return danhSachNguoiNhan;
    }
    
    public void setDanhSachNguoiNhan(List<String> danhSachNguoiNhan) {
        this.danhSachNguoiNhan = danhSachNguoiNhan;
    }
} 