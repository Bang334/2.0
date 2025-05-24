package com.example.backend.model;

import jakarta.persistence.*;
// import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "ThongBaoNhan")
public class ThongBaoNhan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "IDTB", referencedColumnName = "IDTB")
    private ThongBaoGui thongBaoGui;

    @ManyToOne
    @JoinColumn(name = "IDNguoiNhan", referencedColumnName = "IDNguoiDung")
    private NguoiDung nguoiNhan;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai", nullable = false)
    private TrangThai trangThai;

    // Enum cho trạng thái đọc thông báo
    public enum TrangThai {
        DADOC, CHUADOC
    }

    // Constructor mặc định
    public ThongBaoNhan() {
    }

    public ThongBaoNhan(ThongBaoGui thongBaoGui, NguoiDung nguoiNhan, TrangThai trangThai) {
        this.thongBaoGui = thongBaoGui;
        this.nguoiNhan = nguoiNhan;
        this.trangThai = trangThai;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public ThongBaoGui getThongBaoGui() {
        return thongBaoGui;
    }

    public void setThongBaoGui(ThongBaoGui thongBaoGui) {
        this.thongBaoGui = thongBaoGui;
    }

    public NguoiDung getNguoiNhan() {
        return nguoiNhan;
    }

    public void setNguoiNhan(NguoiDung nguoiNhan) {
        this.nguoiNhan = nguoiNhan;
    }

    public TrangThai getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(TrangThai trangThai) {
        this.trangThai = trangThai;
    }
} 