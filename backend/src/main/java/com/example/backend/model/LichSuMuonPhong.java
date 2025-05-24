package com.example.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.Date;

@Entity
@Table(name = "LichSuMuonPhong")
public class LichSuMuonPhong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaLichSu")
    private Integer maLichSu;

    @NotNull
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "ThoiGianMuon", nullable = false)
    private Date thoiGianMuon;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "ThoiGianTraThucTe")
    private Date thoiGianTraThucTe;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThaiTra", nullable = false)
    private TrangThaiTra trangThaiTra;

    @ManyToOne
    @JoinColumn(name = "MaYeuCau", referencedColumnName = "MaYeuCau")
    private YeuCauMuonPhong yeuCauMuonPhong;

    // Enum cho trạng thái trả phòng
    public enum TrangThaiTra {
        DungHan, TreHan
    }

    // Constructor mặc định
    public LichSuMuonPhong() {
    }

    public LichSuMuonPhong(Date thoiGianMuon, 
                         Date thoiGianTraThucTe, TrangThaiTra trangThaiTra, YeuCauMuonPhong yeuCauMuonPhong) {
        this.thoiGianMuon = thoiGianMuon;
        this.thoiGianTraThucTe = thoiGianTraThucTe;
        this.trangThaiTra = trangThaiTra;
        this.yeuCauMuonPhong = yeuCauMuonPhong;
    }

    // Getters and Setters
    public Integer getMaLichSu() {
        return maLichSu;
    }

    public void setMaLichSu(Integer maLichSu) {
        this.maLichSu = maLichSu;
    }

    public Date getThoiGianMuon() {
        return thoiGianMuon;
    }

    public void setThoiGianMuon(Date thoiGianMuon) {
        this.thoiGianMuon = thoiGianMuon;
    }

    public Date getThoiGianTraThucTe() {
        return thoiGianTraThucTe;
    }

    public void setThoiGianTraThucTe(Date thoiGianTraThucTe) {
        this.thoiGianTraThucTe = thoiGianTraThucTe;
    }

    public TrangThaiTra getTrangThaiTra() {
        return trangThaiTra;
    }

    public void setTrangThaiTra(TrangThaiTra trangThaiTra) {
        this.trangThaiTra = trangThaiTra;
    }

    public YeuCauMuonPhong getYeuCauMuonPhong() {
        return yeuCauMuonPhong;
    }

    public void setYeuCauMuonPhong(YeuCauMuonPhong yeuCauMuonPhong) {
        this.yeuCauMuonPhong = yeuCauMuonPhong;
    }
} 