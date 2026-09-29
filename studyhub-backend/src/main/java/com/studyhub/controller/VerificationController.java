package com.studyhub.controller;

import com.studyhub.dto.request.SendVerificationCodeRequest;
import com.studyhub.dto.request.VerifyCodeRequest;
import com.studyhub.dto.response.ApiResponse;
import com.studyhub.entity.User;
import com.studyhub.repository.UserRepository;
import com.studyhub.security.JwtTokenProvider;
import com.studyhub.service.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class VerificationController {

    @Autowired
    private VerificationService verificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/send-verification")
    public ResponseEntity<ApiResponse> sendVerificationCode(@RequestBody SendVerificationCodeRequest request) {
        try {
            verificationService.sendVerificationCode(request.getEmail());
            return ResponseEntity.ok(ApiResponse.success("Verification code sent to your email", null, "/api/auth/send-verification"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/auth/send-verification"));
        }
    }

    @PostMapping({"/verify", "/verify/otp"})
    public ResponseEntity<ApiResponse> verifyCode(@RequestBody VerifyCodeRequest request) {
        try {
            boolean verified = verificationService.verifyCode(request.getEmail(), request.getCode());
            if (verified) {
                User user = userRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new RuntimeException("User not found"));
                
                boolean isAdmin = "ROLE_ADMIN".equals(user.getRole()) || "ADMIN".equals(user.getRole());
                
                if (isAdmin) {
                    user.setIsActive(true);
                    user.setIsApproved(true);
                    user.setStatus("ACTIVE");
                } else {
                    // Students and Teachers require admin approval
                    user.setIsActive(false);
                    user.setIsApproved(false);
                    user.setStatus("PENDING");
                }
                
                user.setUpdatedAt(LocalDateTime.now());
                User savedUser = userRepository.save(user);
                
                Map<String, Object> data = new HashMap<>();
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", savedUser.getId());
                userMap.put("firstName", savedUser.getFirstName());
                userMap.put("lastName", savedUser.getLastName());
                userMap.put("email", savedUser.getEmail());
                userMap.put("role", savedUser.getRole());
                userMap.put("department", savedUser.getDepartment());
                userMap.put("status", savedUser.getStatus());
                userMap.put("isApproved", savedUser.getIsApproved());
                userMap.put("isActive", savedUser.getIsActive());
                data.put("user", userMap);
                
                if (isAdmin) {
                    String token = jwtTokenProvider.generateTokenFromEmail(savedUser.getEmail());
                    data.put("accessToken", token);
                    data.put("token", token);
                }
                
                return ResponseEntity.ok(ApiResponse.success("Email verified successfully", data, "/api/auth/verify/otp"));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid verification code", "/api/auth/verify/otp"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/auth/verify/otp"));
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse> resendVerificationCode(@RequestBody(required = false) SendVerificationCodeRequest request,
                                                              @RequestParam(required = false) String email) {
        try {
            String targetEmail = request != null && request.getEmail() != null ? request.getEmail() : email;
            if (targetEmail == null || targetEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Email is required", "/api/auth/resend-verification"));
            }
            verificationService.resendVerificationCode(targetEmail.trim());
            return ResponseEntity.ok(ApiResponse.success("Verification code resent", null, "/api/auth/resend-verification"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/auth/resend-verification"));
        }
    }

    @GetMapping("/verify-status")
    public ResponseEntity<ApiResponse> getVerificationStatus(@RequestParam String email) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Map<String, Object> status = new HashMap<>();
            status.put("email", email);
            status.put("verified", user.getIsActive() != null && user.getIsActive());
            status.put("isApproved", user.getIsApproved());
            status.put("status", user.getStatus());
            
            return ResponseEntity.ok(ApiResponse.success("Verification status retrieved", status, "/api/auth/verify-status"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/auth/verify-status"));
        }
    }
}