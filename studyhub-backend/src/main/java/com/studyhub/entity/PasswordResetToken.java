package com.studyhub.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "password_reset_tokens")
public class PasswordResetToken {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String token;
    
    private String userId;
    
    @Indexed
    private String email;
    
    @Indexed(expireAfterSeconds = 3600)
    private LocalDateTime expiryDate;
    
    private boolean used = false;
    
    private LocalDateTime createdAt;

    public PasswordResetToken() {}

    public PasswordResetToken(String token, String userId, String email, LocalDateTime expiryDate) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.expiryDate = expiryDate;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    // FIX: Add isExpired() method
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
    
    // FIX: Add isValid() method
    public boolean isValid() {
        return !used && !isExpired();
    }
}