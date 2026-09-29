package com.studyhub.auth.controller;

import com.studyhub.auth.dto.response.AdminStatsResponse;
import com.studyhub.auth.dto.response.UserResponse;
import com.studyhub.auth.service.AdminUserService;
import com.studyhub.common.dto.ApiResponse;
import com.studyhub.common.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private AdminUserService adminUserService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String getAdminDepartment(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtTokenProvider.getDepartmentFromToken(token);
    }

    private String getAdminId(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getStats(@RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            AdminStatsResponse stats = adminUserService.getStats(department);
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
            Page<UserResponse> users = adminUserService.getAllUsers(role, search, pageable, department);
            return ResponseEntity.ok(ApiResponse.success("Users retrieved for " + department, users, "/api/admin/users"));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("No users found", Page.empty(), "/api/admin/users"));
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse> getUserById(
            @PathVariable String userId,
            @RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            UserResponse user = adminUserService.getUserById(userId, department);
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
            UserResponse user = adminUserService.updateUser(userId, updates, department);
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
            adminUserService.deleteUser(userId, department);
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
            UserResponse response = adminUserService.approveUser(userId, adminId, department);
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
            UserResponse response = adminUserService.rejectUser(userId, reason, department);
            return ResponseEntity.ok(ApiResponse.success("User rejected", response, "/api/admin/users/" + userId + "/reject"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage(), "/api/admin/users/" + userId + "/reject"));
        }
    }

    @GetMapping("/teachers/pending")
    public ResponseEntity<ApiResponse> getPendingTeachers(@RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            List<UserResponse> teachers = adminUserService.getPendingTeachers(department);
            return ResponseEntity.ok(ApiResponse.success("Pending teachers retrieved", teachers, "/api/admin/teachers/pending"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage(), "/api/admin/teachers/pending"));
        }
    }

    @PutMapping("/teachers/{teacherId}/approve")
    public ResponseEntity<ApiResponse> approveTeacher(
            @PathVariable String teacherId,
            @RequestHeader("Authorization") String token) {
        return approveUser(teacherId, token);
    }

    @PutMapping("/teachers/{teacherId}/reject")
    public ResponseEntity<ApiResponse> rejectTeacher(
            @PathVariable String teacherId,
            @RequestBody(required = false) Map<String, String> request,
            @RequestHeader("Authorization") String token) {
        return rejectUser(teacherId, request, token);
    }

    @GetMapping("/activity")
    public ResponseEntity<ApiResponse> getActivity(@RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            Map<String, Object> activity = adminUserService.getPlatformActivity(department);
            return ResponseEntity.ok(ApiResponse.success("Activity retrieved for " + department, activity, "/api/admin/activity"));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Activity retrieved", new HashMap<>(), "/api/admin/activity"));
        }
    }
}
