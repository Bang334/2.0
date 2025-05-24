package com.example.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Date;

@Entity
@Table(name = "ThongBaoGui")
public class ThongBaoGui {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDTB")
    private Integer idTB;

    @ManyToOne
    @JoinColumn(name = "IDNguoiGui", referencedColumnName = "IDNguoiDung")
    private NguoiDung nguoiGui;

    @NotBlank
    @Size(max = 250)
    @Column(name = "TieuDe", nullable = false)
    private String tieuDe;

    @NotBlank
    @Size(max = 500)
    @Column(name = "NoiDung", nullable = false)
    private String noiDung;

    @NotNull
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "ThoiGian", nullable = false)
    private Date thoiGian;

    // Constructor mặc định
    public ThongBaoGui() {
    }

    public ThongBaoGui(NguoiDung nguoiGui, String tieuDe, String noiDung, Date thoiGian) {
        this.nguoiGui = nguoiGui;
        this.tieuDe = tieuDe;
        this.noiDung = noiDung;
        this.thoiGian = thoiGian;
    }

    // Getters and Setters
    public Integer getIdTB() {
        return idTB;
    }

    public void setIdTB(Integer idTB) {
        this.idTB = idTB;
    }

    public NguoiDung getNguoiGui() {
        return nguoiGui;
    }

    public void setNguoiGui(NguoiDung nguoiGui) {
        this.nguoiGui = nguoiGui;
    }

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

    public Date getThoiGian() {
        return thoiGian;
    }

    public void setThoiGian(Date thoiGian) {
        this.thoiGian = thoiGian;
    }
} 