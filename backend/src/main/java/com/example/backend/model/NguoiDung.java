package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "NguoiDung")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "idNguoiDung")
public class NguoiDung {
    @Id
    @Column(name = "IDNguoiDung")
    private String idNguoiDung;

    @NotBlank
    @Size(max = 100)
    @Column(name = "HoTen", nullable = false)
    private String hoTen;

    @NotBlank
    @Size(max = 255)
    @Email
    @Column(name = "Email", nullable = false, unique = true)
    private String email;

    @Size(max = 50)
    @Column(name = "LienHe")
    private String lienHe;

    @Enumerated(EnumType.STRING)
    @Column(name = "GioiTinh", nullable = false)
    private GioiTinh gioiTinh;

    @Column(name = "AvatarURL")
    private String avatarURL;

    @ManyToOne
    @JoinColumn(name = "IDTaiKhoan", referencedColumnName = "ID")
    private User taiKhoan;

    @ManyToOne
    @JoinColumn(name = "IDVaiTro", referencedColumnName = "IDVaiTro")
    private Role vaiTro;

    // Enum cho giới tính
    public enum GioiTinh {
        Nam, Nu, KhongXacDinh
    }

    // Constructor mặc định
    public NguoiDung() {
    }

    public NguoiDung(String idNguoiDung, String hoTen, String email, GioiTinh gioiTinh) {
        this.idNguoiDung = idNguoiDung;
        this.hoTen = hoTen;
        this.email = email;
        this.gioiTinh = gioiTinh;
    }

    // Getters and Setters
    public String getIdNguoiDung() {
        return idNguoiDung;
    }

    public void setIdNguoiDung(String idNguoiDung) {
        this.idNguoiDung = idNguoiDung;
    }

    public String getHoTen() {
        return hoTen;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLienHe() {
        return lienHe;
    }

    public void setLienHe(String lienHe) {
        this.lienHe = lienHe;
    }

    public GioiTinh getGioiTinh() {
        return gioiTinh;
    }

    public void setGioiTinh(GioiTinh gioiTinh) {
        this.gioiTinh = gioiTinh;
    }

    public String getAvatarURL() {
        return avatarURL;
    }

    public void setAvatarURL(String avatarURL) {
        this.avatarURL = avatarURL;
    }

    public User getTaiKhoan() {
        return taiKhoan;
    }

    public void setTaiKhoan(User taiKhoan) {
        this.taiKhoan = taiKhoan;
    }

    public Role getVaiTro() {
        return vaiTro;
    }

    public void setVaiTro(Role vaiTro) {
        this.vaiTro = vaiTro;
    }
} 