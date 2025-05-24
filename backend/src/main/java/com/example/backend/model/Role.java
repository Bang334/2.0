package com.example.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "VaiTro")
public class Role {
    @Id
    @Column(name = "IDVaiTro")
    private String idVaiTro;
    
    @Column(name = "TenVaiTro", length = 50, nullable = false)
    private String tenVaiTro;
    
    // Constructor mặc định (không tham số)
    public Role() {
    }
    
    public Role(String idVaiTro, String tenVaiTro) {
        this.idVaiTro = idVaiTro;
        this.tenVaiTro = tenVaiTro;
    }
    
    public String getIdVaiTro() {
        return idVaiTro;
    }
    
    public void setIdVaiTro(String idVaiTro) {
        this.idVaiTro = idVaiTro;
    }
    
    public String getTenVaiTro() {
        return tenVaiTro;
    }
    
    public void setTenVaiTro(String tenVaiTro) {
        this.tenVaiTro = tenVaiTro;
    }
} 