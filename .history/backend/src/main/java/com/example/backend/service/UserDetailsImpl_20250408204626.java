package com.example.backend.service;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.backend.model.NguoiDung;
import com.example.backend.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private String id;
    private String username;
    private String email;
    private String hoTen;

    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(String id, String username, String email, String hoTen, String password,
                          Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.hoTen = hoTen;
        this.password = password;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user, NguoiDung nguoiDung) {
        // Tạo danh sách vai trò từ nguoiDung.getVaiTro()
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + nguoiDung.getVaiTro().getTenVaiTro().toUpperCase().replace(" ", "_")));

        return new UserDetailsImpl(
                user.getId(),
                user.getId(), // Dùng ID của TaiKhoan làm username
                nguoiDung.getEmail(),
                nguoiDung.getHoTen(),
                user.getMatKhau(),
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getHoTen() {
        return hoTen;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}