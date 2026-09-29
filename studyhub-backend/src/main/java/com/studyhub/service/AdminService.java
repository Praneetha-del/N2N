package com.studyhub.service;

import com.studyhub.dto.response.AdminStatsResponse;
import com.studyhub.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface AdminService {
    
    AdminStatsResponse getStats(String department);
    
    Page<UserResponse> getAllUsers(String role, String search, Pageable pageable, String department);
    
    UserResponse getUserById(String id, String department);
    
    UserResponse updateUser(String id, Map<String, Object> updates, String department);
    
    void deleteUser(String id, String department);
    
    UserResponse approveUser(String id, String department);
    
    UserResponse rejectUser(String id, String reason, String department);
    
    List<UserResponse> getPendingTeachers(String department);
    
    UserResponse approveTeacher(String id, String department);
    
    UserResponse rejectTeacher(String id, String reason, String department);
    
    Page<Map<String, Object>> getAllMaterialsForAdmin(String status, String search, Pageable pageable, String department);
    
    void blockMaterial(String materialId, String adminId, String reason, String department);
    
    void unblockMaterial(String materialId, String adminId, String department);
    
    Map<String, Object> getPlatformActivity(String department);
    
    Page<UserResponse> getUsersByDepartment(String department, Pageable pageable);
    
    Page<Map<String, Object>> getMaterialsByDepartment(String department, Pageable pageable);
    
    Page<Map<String, Object>> searchMaterialsByDepartment(String department, String keyword, Pageable pageable);
    
    List<Map<String, Object>> getRecentMaterials(String department, int limit);
}