package com.example.backend.payload.response;

import java.util.List;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String username;
    private String email;
    private String hoTen;
    private String avatarURL;
    private List<String> roles;
    private boolean reload;

    public JwtResponse(String token, String type, String id, String username, String email, String hoTen, String avatarURL, List<String> roles, boolean reload) {
        this.token = token;
        this.type = type;
        this.id = id;
        this.username = username;
        this.email = email;
        this.hoTen = hoTen;
        this.avatarURL = avatarURL;
        this.roles = roles;
        this.reload = reload;
    }

    public String getAccessToken() {
        return token;
    }

    public void setAccessToken(String accessToken) {
        this.token = accessToken;
    }

    public String getTokenType() {
        return type;
    }

    public void setTokenType(String tokenType) {
        this.type = tokenType;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getHoTen() {
        return hoTen;
    }

    public String getAvatarURL() {
        return avatarURL;
    }

    public List<String> getRoles() {
        return roles;
    }

    public boolean isReload() {
        return reload;
    }

    public void setReload(boolean reload) {
        this.reload = reload;
    }
} 