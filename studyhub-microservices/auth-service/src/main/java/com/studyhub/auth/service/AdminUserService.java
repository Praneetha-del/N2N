package com.studyhub.auth.service;

import com.studyhub.auth.dto.response.AdminStatsResponse;
import com.studyhub.auth.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface AdminUserService {
    AdminStatsResponse getStats(String department);
    Page<UserResponse> getAllUsers(String role, String search, Pageable pageable, String department);
    UserResponse getUserById(String userId, String department);
    UserResponse updateUser(String userId, Map<String, Object> updates, String department);
    void deleteUser(String userId, String department);
    UserResponse approveUser(String userId, String adminId, String department);
    UserResponse rejectUser(String userId, String reason, String department);
    List<UserResponse> getPendingTeachers(String department);
    UserResponse approveTeacher(String userId, String adminId, String department);
    UserResponse rejectTeacher(String userId, String reason, String department);
    Map<String, Object> getPlatformActivity(String department);
}
