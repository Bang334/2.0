package com.example.backend.payload.response;

public class MessageResponse {
    private String message;

    // Constructor không tham số
    public MessageResponse() {
    }

    // Constructor với tham số String
    public MessageResponse(String message) {
        this.message = message;
    }

    // Getter và Setter
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
} 