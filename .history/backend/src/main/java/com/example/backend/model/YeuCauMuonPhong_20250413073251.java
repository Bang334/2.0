package com.example.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Date;

@Entity
@Table(name = "YeuCauMuonPhong")
public class YeuCauMuonPhong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaYeuCau")
    private Integer maYeuCau;

    @ManyToOne
    @JoinColumn(name = "IDNguoiMuon", referencedColumnName = "IDNguoiDung")
    private NguoiDung nguoiMuon;

    @ManyToOne
    @JoinColumn(name = "MaPhong", referencedColumnName = "MaPhong")
    private Phong phong;

    @NotNull
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "ThoiGianMuon", nullable = false)
    private Date thoiGianMuon;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "ThoiGianTra")
    private Date thoiGianTra;

    @NotBlank
    @Size(max = 255)
    @Column(name = "MucDich", nullable = false)
    private String mucDich;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai", nullable = false)
    private TrangThai trangThai;

    @Size(max = 500)
    @Column(name = "LyDo")
    private String lyDo;
    
    @ManyToOne
    @JoinColumn(name = "IDNguoiDuyet", referencedColumnName = "IDNguoiDung")
    private NguoiDung nguoiDuyet;
    
    @Transient
    private Boolean coLichSuMuonPhong;

    // Enum cho trạng thái yêu cầu
    public enum TrangThai {
        DANGXULY, DADUYET, KHONGDUOCDUYET
    }

    // Constructor mặc định
    public YeuCauMuonPhong() {
    }

    public YeuCauMuonPhong(NguoiDung nguoiMuon, Phong phong, Date thoiGianMuon, Date thoiGianTra, 
                          String mucDich, TrangThai trangThai) {
        this.nguoiMuon = nguoiMuon;
        this.phong = phong;
        this.thoiGianMuon = thoiGianMuon;
        this.thoiGianTra = thoiGianTra;
        this.mucDich = mucDich;
        this.trangThai = trangThai;
    }

    // Constructor với nguoiDuyet
    public YeuCauMuonPhong(NguoiDung nguoiMuon, Phong phong, Date thoiGianMuon, Date thoiGianTra, 
                          String mucDich, TrangThai trangThai, NguoiDung nguoiDuyet) {
        this.nguoiMuon = nguoiMuon;
        this.phong = phong;
        this.thoiGianMuon = thoiGianMuon;
        this.thoiGianTra = thoiGianTra;
        this.mucDich = mucDich;
        this.trangThai = trangThai;
        this.nguoiDuyet = nguoiDuyet;
    }

    // Getters and Setters
    public Integer getMaYeuCau() {
        return maYeuCau;
    }

    public void setMaYeuCau(Integer maYeuCau) {
        this.maYeuCau = maYeuCau;
    }

    public NguoiDung getNguoiMuon() {
        return nguoiMuon;
    }

    public void setNguoiMuon(NguoiDung nguoiMuon) {
        this.nguoiMuon = nguoiMuon;
    }

    public Phong getPhong() {
        return phong;
    }

    public void setPhong(Phong phong) {
        this.phong = phong;
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

    public TrangThai getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(TrangThai trangThai) {
        this.trangThai = trangThai;
    }

    public String getLyDo() {
        return lyDo;
    }

    public void setLyDo(String lyDo) {
        this.lyDo = lyDo;
    }

    public NguoiDung getNguoiDuyet() {
        return nguoiDuyet;
    }

    public void setNguoiDuyet(NguoiDung nguoiDuyet) {
        this.nguoiDuyet = nguoiDuyet;
    }
    
    public Boolean getCoLichSuMuonPhong() {
        return coLichSuMuonPhong;
    }
    
    public void setCoLichSuMuonPhong(Boolean coLichSuMuonPhong) {
        this.coLichSuMuonPhong = coLichSuMuonPhong;
    }
} 