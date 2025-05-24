package com.example.backend.payload.response;

import java.util.List;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type;
    private String id;
    private String userId;
    private String email;
    private String hoTen;
    private String avatarURL;
    private List<String> roles;

    public JwtResponse(String token, String type, String id, String userId, String email, String hoTen, String avatarURL, List<String> roles) {
        this.token = token;
        this.type = type;
        this.id = id;
        this.userId = userId;
        this.email = email;
        this.hoTen = hoTen;
        this.avatarURL = avatarURL;
        this.roles = roles;
    }

    public String getToken() { return token; }
    public String getType() { return type; }
    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getHoTen() { return hoTen; }
    public String getAvatarURL() { return avatarURL; }
    public List<String> getRoles() { return roles; }
} 