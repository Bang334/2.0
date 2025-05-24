package com.example.backend.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "su_co")
public class SuCo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "phong_id")
    private Phong phong;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "thoi_gian_bao_cao")
    private Date thoiGianBaoCao;

    @Column(name = "thoi_gian_khac_phuc")
    private Date thoiGianKhacPhuc;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai")
    private TrangThai trangThai;

    @ManyToOne
    @JoinColumn(name = "nguoi_bao_cao_id")
    private NguoiDung nguoiBaoCao;

    public enum TrangThai {
        CHUAXULY,
        DANGXULY,
        DAKHACPHUC
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Date getThoiGianKhacPhuc() {
        return thoiGianKhacPhuc;
    }

    public void setThoiGianKhacPhuc(Date thoiGianKhacPhuc) {
        this.thoiGianKhacPhuc = thoiGianKhacPhuc;
    }

    public TrangThai getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(TrangThai trangThai) {
        this.trangThai = trangThai;
    }

    public NguoiDung getNguoiBaoCao() {
        return nguoiBaoCao;
    }

    public void setNguoiBaoCao(NguoiDung nguoiBaoCao) {
        this.nguoiBaoCao = nguoiBaoCao;
    }
} 