package com.example.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String userId;

    @NotBlank
    private String password;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
} 
// Annotation @Data trong Lombok được sử dụng để tự động tạo ra các phương thức getter, 
// setter, toString(), equals(), và hashCode() cho lớp mà nó được áp dụng. Điều này giúp 
// giảm thiểu mã lặp lại và làm cho mã nguồn trở nên sạch sẽ và dễ đọc hơn. Dưới đây là 
// một số điểm chính về @Data: