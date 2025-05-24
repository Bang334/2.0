package com.example.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.Date;

@Entity
@Table(name = "ThoiKhoaBieu")
public class ThoiKhoaBieu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaTKB")
    private Integer maTKB;

    @ManyToOne
    @JoinColumn(name = "MaMon", referencedColumnName = "MaMon")
    private MonHoc monHoc;

    @ManyToOne
    @JoinColumn(name = "MaLop", referencedColumnName = "MaLop")
    private LopHoc lopHoc;

    @ManyToOne
    @JoinColumn(name = "MaPhong", referencedColumnName = "MaPhong")
    private Phong phong;

    @Enumerated(EnumType.STRING)
    @Column(name = "ThuTrongTuan", nullable = false)
    private ThuTrongTuan thuTrongTuan;

    @NotNull
    @Column(name = "TietBatDau", nullable = false)
    private Integer tietBatDau;

    @NotNull
    @Column(name = "TietKetThuc", nullable = false)
    private Integer tietKetThuc;

    @ManyToOne
    @JoinColumn(name = "MaGV", referencedColumnName = "MaGV")
    private GiangVien giangVien;

    @NotNull
    @Column(name = "Tuan", nullable = false)
    private Integer tuan;

    @NotNull
    @Temporal(TemporalType.DATE)
    @Column(name = "NgayHoc", nullable = false)
    private Date ngayHoc;

    // Enum cho ngày trong tuần
    public enum ThuTrongTuan {
        MON, TUE, WED, THU, FRI, SAT, SUN
    }

    // Constructor mặc định
    public ThoiKhoaBieu() {
    }

    public ThoiKhoaBieu(MonHoc monHoc, LopHoc lopHoc, Phong phong, ThuTrongTuan thuTrongTuan,
                        Integer tietBatDau, Integer tietKetThuc, GiangVien giangVien, Integer tuan, Date ngayHoc) {
        this.monHoc = monHoc;
        this.lopHoc = lopHoc;
        this.phong = phong;
        this.thuTrongTuan = thuTrongTuan;
        this.tietBatDau = tietBatDau;
        this.tietKetThuc = tietKetThuc;
        this.giangVien = giangVien;
        this.tuan = tuan;
        this.ngayHoc = ngayHoc;
    }

    // Getters and Setters
    public Integer getMaTKB() {
        return maTKB;
    }

    public void setMaTKB(Integer maTKB) {
        this.maTKB = maTKB;
    }

    public MonHoc getMonHoc() {
        return monHoc;
    }

    public void setMonHoc(MonHoc monHoc) {
        this.monHoc = monHoc;
    }

    public LopHoc getLopHoc() {
        return lopHoc;
    }

    public void setLopHoc(LopHoc lopHoc) {
        this.lopHoc = lopHoc;
    }

    public Phong getPhong() {
        return phong;
    }

    public void setPhong(Phong phong) {
        this.phong = phong;
    }

    public ThuTrongTuan getThuTrongTuan() {
        return thuTrongTuan;
    }

    public void setThuTrongTuan(ThuTrongTuan thuTrongTuan) {
        this.thuTrongTuan = thuTrongTuan;
    }

    public Integer getTietBatDau() {
        return tietBatDau;
    }

    public void setTietBatDau(Integer tietBatDau) {
        this.tietBatDau = tietBatDau;
    }

    public Integer getTietKetThuc() {
        return tietKetThuc;
    }

    public void setTietKetThuc(Integer tietKetThuc) {
        this.tietKetThuc = tietKetThuc;
    }

    public GiangVien getGiangVien() {
        return giangVien;
    }

    public void setGiangVien(GiangVien giangVien) {
        this.giangVien = giangVien;
    }

    public Integer getTuan() {
        return tuan;
    }

    public void setTuan(Integer tuan) {
        this.tuan = tuan;
    }

    public Date getNgayHoc() {
        return ngayHoc;
    }

    public void setNgayHoc(Date ngayHoc) {
        this.ngayHoc = ngayHoc;
    }
} 