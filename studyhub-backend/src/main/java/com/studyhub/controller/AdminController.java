package com.studyhub.controller;

import com.studyhub.dto.response.AdminStatsResponse;
import com.studyhub.dto.response.ApiResponse;
import com.studyhub.dto.response.UserResponse;
import com.studyhub.entity.User;
import com.studyhub.exception.ResourceNotFoundException;
import com.studyhub.mapper.UserMapper;
import com.studyhub.repository.UserRepository;
import com.studyhub.security.JwtTokenProvider;
import com.studyhub.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private UserMapper userMapper;
    
    private String getAdminDepartment(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        return admin.getDepartment();
    }
    
    private String getAdminId(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        return admin.getId();
    }
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getStats(@RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            AdminStatsResponse stats = adminService.getStats(department);
            return ResponseEntity.ok(ApiResponse.success("Stats retrieved", stats, "/api/admin/stats"));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Stats retrieved", new HashMap<>(), "/api/admin/stats"));
        }
    }
    
    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            Pageable pageable = PageRequest.of(page, size);
            Page<UserResponse> users = adminService.getAllUsers(role, search, pageable, department);
            return ResponseEntity.ok(ApiResponse.success("Users retrieved for " + department, users, "/api/admin/users"));
        } catch (Exception e) {
            Page<UserResponse> emptyPage = Page.empty();
            return ResponseEntity.ok(ApiResponse.success("No users found", emptyPage, "/api/admin/users"));
        }
    }
    
    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse> getUserById(
            @PathVariable String userId,
            @RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            UserResponse user = adminService.getUserById(userId, department);
            return ResponseEntity.ok(ApiResponse.success("User retrieved", user, "/api/admin/users/" + userId));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error("User not found", "/api/admin/users/" + userId));
        }
    }
    
    @PutMapping("/users/{userId}")
    public ResponseEntity<ApiResponse> updateUser(
            @PathVariable String userId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            UserResponse user = adminService.updateUser(userId, updates, department);
            return ResponseEntity.ok(ApiResponse.success("User updated", user, "/api/admin/users/" + userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage(), "/api/admin/users/" + userId));
        }
    }
    
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse> deleteUser(
            @PathVariable String userId,
            @RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            adminService.deleteUser(userId, department);
            return ResponseEntity.ok(ApiResponse.success("User deleted", null, "/api/admin/users/" + userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage(), "/api/admin/users/" + userId));
        }
    }
    
    @PutMapping("/users/{userId}/approve")
    public ResponseEntity<ApiResponse> approveUser(
            @PathVariable String userId,
            @RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            String adminId = getAdminId(token);
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            if (!user.getDepartment().equals(department)) {
                return ResponseEntity.status(403).body(ApiResponse.error(
                    "You can only approve users from your department", 
                    "/api/admin/users/" + userId + "/approve"));
            }
            
            // ✅ Use setIsActive and setIsApproved
            user.setIsActive(true);
            user.setIsApproved(true);
            user.setStatus("ACTIVE");
            user.setApprovedBy(adminId);
            user.setApprovedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            
            User saved = userRepository.save(user);
            UserResponse response = userMapper.toResponse(saved);
            
            return ResponseEntity.ok(ApiResponse.success("User approved and activated successfully", response, "/api/admin/users/" + userId + "/approve"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage(), "/api/admin/users/" + userId + "/approve"));
        }
    }
    
    @PutMapping("/users/{userId}/reject")
    public ResponseEntity<ApiResponse> rejectUser(
            @PathVariable String userId,
            @RequestBody(required = false) Map<String, String> request,
            @RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            String reason = request != null ? request.get("reason") : "Rejected by admin";
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            if (!user.getDepartment().equals(department)) {
                return ResponseEntity.status(403).body(ApiResponse.error(
                    "You can only reject users from your department", 
                    "/api/admin/users/" + userId + "/reject"));
            }
            
            // ✅ Use setIsActive and setIsApproved
            user.setIsActive(false);
            user.setIsApproved(false);
            user.setStatus("REJECTED");
            user.setRejectionReason(reason);
            user.setUpdatedAt(LocalDateTime.now());
            
            User saved = userRepository.save(user);
            UserResponse response = userMapper.toResponse(saved);
            
            return ResponseEntity.ok(ApiResponse.success("User rejected", response, "/api/admin/users/" + userId + "/reject"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage(), "/api/admin/users/" + userId + "/reject"));
        }
    }
    
    @GetMapping("/materials")
    public ResponseEntity<ApiResponse> getAllMaterials(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            Pageable pageable = PageRequest.of(page, size);
            Page<Map<String, Object>> materials = adminService.getAllMaterialsForAdmin(status, search, pageable, department);
            return ResponseEntity.ok(ApiResponse.success("Materials retrieved for " + department, materials, "/api/admin/materials"));
        } catch (Exception e) {
            Page<Map<String, Object>> emptyPage = Page.empty();
            return ResponseEntity.ok(ApiResponse.success("No materials found", emptyPage, "/api/admin/materials"));
        }
    }
    
    @PutMapping("/materials/{materialId}/block")
    public ResponseEntity<ApiResponse> blockMaterial(
            @PathVariable String materialId,
            @RequestBody(required = false) Map<String, String> request,
            @RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            String adminId = getAdminId(token);
            String reason = request != null ? request.get("reason") : null;
            adminService.blockMaterial(materialId, adminId, reason, department);
            return ResponseEntity.ok(ApiResponse.success("Material blocked", null, "/api/admin/materials/" + materialId + "/block"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage(), "/api/admin/materials/" + materialId + "/block"));
        }
    }
    
    @PutMapping("/materials/{materialId}/unblock")
    public ResponseEntity<ApiResponse> unblockMaterial(
            @PathVariable String materialId,
            @RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            String adminId = getAdminId(token);
            adminService.unblockMaterial(materialId, adminId, department);
            return ResponseEntity.ok(ApiResponse.success("Material unblocked", null, "/api/admin/materials/" + materialId + "/unblock"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage(), "/api/admin/materials/" + materialId + "/unblock"));
        }
    }
    
    @GetMapping("/activity")
    public ResponseEntity<ApiResponse> getActivity(@RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            Map<String, Object> activity = adminService.getPlatformActivity(department);
            return ResponseEntity.ok(ApiResponse.success("Activity retrieved for " + department, activity, "/api/admin/activity"));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Activity retrieved", new HashMap<>(), "/api/admin/activity"));
        }
    }
}