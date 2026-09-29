package com.studyhub.auth.service;

import com.studyhub.auth.dto.request.LoginRequest;
import com.studyhub.auth.dto.request.RegisterRequest;
import com.studyhub.auth.dto.response.AuthResponse;

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

