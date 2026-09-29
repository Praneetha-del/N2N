package com.studyhub.dto.response;

import java.util.Map;

public class AuthResponse {
    
    private String token;
    private Map<String, Object> user;
    private String message;
    private boolean success;
    
    public AuthResponse() {
    }
    
    public AuthResponse(String token, Map<String, Object> user, String message) {
        this.token = token;
        this.user = user;
        this.message = message;
        this.success = true;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public Map<String, Object> getUser() {
        return user;
    }
    
    public void setUser(Map<String, Object> user) {
        this.user = user;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
}