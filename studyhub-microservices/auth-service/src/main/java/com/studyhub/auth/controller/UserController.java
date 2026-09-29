package com.studyhub.auth.controller;

import com.studyhub.auth.dto.request.ProfileUpdateRequest;
import com.studyhub.auth.dto.response.UserResponse;
import com.studyhub.auth.service.UserService;
import com.studyhub.common.dto.ApiResponse;
import com.studyhub.common.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("isAuthenticated()")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile(@RequestHeader("Authorization") String token) {
        String email = extractEmail(token);
        UserResponse user = userService.getProfile(email);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", user, "/api/users/profile"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            @RequestHeader("Authorization") String token) {
        String email = extractEmail(token);
        UserResponse user = userService.updateProfile(email, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", user, "/api/users/profile"));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(
            @RequestParam String oldPassword,
            @RequestParam String newPassword,
            @RequestHeader("Authorization") String token) {
        String email = extractEmail(token);
        boolean changed = userService.changePassword(email, oldPassword, newPassword);
        if (changed) {
            return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null, "/api/users/change-password"));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to change password: old password incorrect", "/api/users/change-password"));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getStats(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", null, "/api/users/stats"));
    }

    private String extractEmail(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtTokenProvider.getEmailFromToken(token);
    }
}
