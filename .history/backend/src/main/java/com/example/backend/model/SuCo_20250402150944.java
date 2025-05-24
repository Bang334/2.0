package com.example.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Date;

@Entity
@Table(name = "SuCo")
public class SuCo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDSuCo")
    private Integer idSuCo;

    @ManyToOne
    @JoinColumn(name = "MaPhong", referencedColumnName = "MaPhong")
    private Phong phong;

    @NotBlank
    @Size(max = 255)
    @Column(name = "MoTa", nullable = false)
    private String moTa;

    @NotNull
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "ThoiGianBaoCao", nullable = false)
    private Date thoiGianBaoCao;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai", nullable = false)
    private TrangThai trangThai;

    @ManyToOne
    @JoinColumn(name = "ID", referencedColumnName = "MaLichSu")
    private LichSuMuonPhong lichSuMuonPhong;

    // Enum cho trạng thái xử lý sự cố
    public enum TrangThai {
        ChuaXuLy, DangXuLy, DaXuLy
    }

    // Constructor mặc định
    public SuCo() {
    }

    public SuCo(Phong phong, String moTa, Date thoiGianBaoCao, TrangThai trangThai, LichSuMuonPhong lichSuMuonPhong) {
        this.phong = phong;
        this.moTa = moTa;
        this.thoiGianBaoCao = thoiGianBaoCao;
        this.trangThai = trangThai;
        this.lichSuMuonPhong = lichSuMuonPhong;
    }

    // Getters and Setters
    public Integer getIdSuCo() {
        return idSuCo;
    }

    public void setIdSuCo(Integer idSuCo) {
        this.idSuCo = idSuCo;
    }

    public Phong getPhong() {
        return phong;
    }

    public void setPhong(Phong phong) {
        this.phong = phong;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public Date getThoiGianBaoCao() {
        return thoiGianBaoCao;
    }

    public void setThoiGianBaoCao(Date thoiGianBaoCao) {
        this.thoiGianBaoCao = thoiGianBaoCao;
    }

    public TrangThai getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(TrangThai trangThai) {
        this.trangThai = trangThai;
    }

    public LichSuMuonPhong getLichSuMuonPhong() {
        return lichSuMuonPhong;
    }

    public void setLichSuMuonPhong(LichSuMuonPhong lichSuMuonPhong) {
        this.lichSuMuonPhong = lichSuMuonPhong;
    }
} 