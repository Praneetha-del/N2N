package com.studyhub.service;

import com.studyhub.dto.request.LoginRequest;
import com.studyhub.dto.request.RegisterRequest;
import com.studyhub.dto.response.AuthResponse;

import java.util.List;

public interface AuthService {
    
    AuthResponse register(RegisterRequest request);
    
    AuthResponse login(LoginRequest request);
    
    AuthResponse refreshToken(String refreshToken);
    
    void logout(String token);
    
    AuthResponse getCurrentUserResponse(String email);

    List<String> getDepartmentsWithAdmin();

    boolean isDepartmentAdminRegistered(String department);
}