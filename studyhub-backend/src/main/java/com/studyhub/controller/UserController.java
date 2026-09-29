package com.studyhub.controller;

import com.studyhub.dto.request.ProfileUpdateRequest;
import com.studyhub.dto.response.ApiResponse;
import com.studyhub.dto.response.UserResponse;
import com.studyhub.entity.User;
import com.studyhub.repository.UserRepository;
import com.studyhub.security.JwtTokenProvider;
import com.studyhub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("isAuthenticated()")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private UserRepository userRepository;  // ✅ ADD THIS
    
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getProfile(@RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        UserResponse user = userService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", user, "/users/profile"));
    }
    
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            @RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        UserResponse user = userService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", user, "/users/profile"));
    }
    
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(
            @RequestParam String oldPassword,
            @RequestParam String newPassword,
            @RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        userService.changePassword(userId, oldPassword, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null, "/users/change-password"));
    }
    
    @PostMapping("/profile-picture")
    public ResponseEntity<ApiResponse> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String token) throws IOException {
        String userId = getUserIdFromToken(token);
        UserResponse user = userService.uploadProfilePicture(userId, file.getBytes(), file.getOriginalFilename());
        return ResponseEntity.ok(ApiResponse.success("Profile picture updated", user, "/users/profile-picture"));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getStats(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", null, "/users/stats"));
    }
    
    /**
     * ✅ FIXED: Extract user ID from JWT token
     */
    private String getUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        String email = jwtTokenProvider.getEmailFromToken(token);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        return user.getId();  // ✅ Returns MongoDB _id
    }
}