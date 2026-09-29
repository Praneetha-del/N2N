package com.studyhub.dto.request;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    
    private String email;
    private String username;
    private String role;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    public LoginRequest() {
    }
    
    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }
    
    public String getEmail() {
        return email != null && !email.trim().isEmpty() ? email.trim() : (username != null ? username.trim() : null);
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getUsername() {
        return username != null && !username.trim().isEmpty() ? username.trim() : (email != null ? email.trim() : null);
    }
    
    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}