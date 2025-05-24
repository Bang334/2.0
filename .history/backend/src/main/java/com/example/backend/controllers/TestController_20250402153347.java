package com.example.backend.controllers;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/test")
public class TestController {
    @GetMapping("/all")
    public String allAccess() {
        return "Public Content.";
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER') or hasRole('NHÂN_VIÊN') or hasRole('QUẢN_LÝ') or hasRole('SV') or hasRole('GV')")
    public String userAccess() {
        return "User Content.";
    }

    @GetMapping("/employee")
    @PreAuthorize("hasRole('NHÂN_VIÊN') or hasRole('QUẢN_LÝ')")
    public String employeeAccess() {
        return "Employee Board.";
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('QUẢN_LÝ')")
    public String adminAccess() {
        return "Admin Board.";
    }

    @GetMapping("/gv")
    @PreAuthorize("hasRole('GV')")
    public String giangVienAccess() {
        return "Chào mừng đến với trang Giảng viên. Đây là nội dung được bảo vệ và chỉ giảng viên mới có thể truy cập.";
    }

    @GetMapping("/sv")
    @PreAuthorize("hasRole('SV')")
    public String sinhVienAccess() {
        return "Chào mừng đến với trang Sinh viên. Đây là nội dung được bảo vệ và chỉ sinh viên mới có thể truy cập.";
    }
}