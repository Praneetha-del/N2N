package com.studyhub.controller;

import com.studyhub.dto.request.LoginRequest;
import com.studyhub.dto.request.RegisterRequest;
import com.studyhub.dto.response.ApiResponse;
import com.studyhub.dto.response.AuthResponse;
import com.studyhub.dto.response.UserResponse;
import com.studyhub.security.JwtTokenProvider;
import com.studyhub.service.AuthService;
import com.studyhub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @GetMapping("/admin-departments")
    public ResponseEntity<ApiResponse> getAdminDepartments() {
        try {
            List<String> depts = authService.getDepartmentsWithAdmin();
            return ResponseEntity.ok(ApiResponse.success("Admin departments retrieved", depts, "/api/auth/admin-departments"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/auth/admin-departments"));
        }
    }

    @GetMapping("/check-admin")
    public ResponseEntity<ApiResponse> checkAdminForDepartment(@RequestParam String department) {
        try {
            boolean exists = authService.isDepartmentAdminRegistered(department);
            Map<String, Object> result = new HashMap<>();
            result.put("exists", exists);
            result.put("department", department);
            result.put("message", exists ? "An Admin already exists for this department. Admin registration is not allowed." : "Admin registration is allowed for this department.");
            return ResponseEntity.ok(ApiResponse.success("Admin check completed", result, "/api/auth/check-admin"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/auth/check-admin"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(ApiResponse.success("Registration successful", response, "/api/auth/register"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/auth/register"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Login successful", response, "/api/auth/login"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/auth/login"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse> refreshToken(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            AuthResponse response = authService.refreshToken(token);
            return ResponseEntity.ok(ApiResponse.success("Token refreshed", response, "/api/auth/refresh"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/auth/refresh"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            authService.logout(token);
            return ResponseEntity.ok(ApiResponse.success("Logout successful", null, "/api/auth/logout"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/auth/logout"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            String email = jwtTokenProvider.getEmailFromToken(token);
            AuthResponse response = authService.getCurrentUserResponse(email);
            return ResponseEntity.ok(ApiResponse.success("User retrieved", response, "/api/auth/me"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error(e.getMessage(), "/api/auth/me"));
        }
    }
}