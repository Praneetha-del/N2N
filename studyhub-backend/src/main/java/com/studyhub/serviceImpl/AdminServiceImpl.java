package com.studyhub.serviceImpl;

import com.studyhub.dto.response.AdminStatsResponse;
import com.studyhub.dto.response.UserResponse;
import com.studyhub.entity.Material;
import com.studyhub.entity.User;
import com.studyhub.exception.ResourceNotFoundException;
import com.studyhub.mapper.UserMapper;
import com.studyhub.repository.MaterialRepository;
import com.studyhub.repository.UserRepository;
import com.studyhub.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private static final String ROLE_STUDENT = "ROLE_STUDENT";
    private static final String ROLE_TEACHER = "ROLE_TEACHER";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final String STATUS_BLOCKED = "BLOCKED";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private UserMapper userMapper;

    @Override
    public AdminStatsResponse getStats(String department) {
        List<User> departmentUsers = userRepository.findByDepartment(department);
        List<Material> departmentMaterials = materialRepository.findByDepartment(department);
        
        long totalUsers = departmentUsers.size();
        long totalStudents = departmentUsers.stream()
                .filter(u -> ROLE_STUDENT.equals(u.getRole()))
                .count();
        long totalTeachers = departmentUsers.stream()
                .filter(u -> ROLE_TEACHER.equals(u.getRole()))
                .count();
        long totalAdmins = departmentUsers.stream()
                .filter(u -> ROLE_ADMIN.equals(u.getRole()))
                .count();
        long pendingTeachers = departmentUsers.stream()
                .filter(u -> ROLE_TEACHER.equals(u.getRole()) && 
                            STATUS_PENDING.equals(u.getStatus()))
                .count();
        long totalMaterials = departmentMaterials.size();
        long activeMaterials = departmentMaterials.stream()
                .filter(m -> STATUS_ACTIVE.equals(m.getStatus()))
                .count();
        long blockedMaterials = departmentMaterials.stream()
                .filter(m -> STATUS_BLOCKED.equals(m.getStatus()))
                .count();
        
        AdminStatsResponse stats = new AdminStatsResponse();
        stats.setTotalUsers(totalUsers);
        stats.setTotalStudents(totalStudents);
        stats.setTotalTeachers(totalTeachers);
        stats.setTotalAdmins(totalAdmins);
        stats.setPendingTeachers(pendingTeachers);
        stats.setTotalMaterials(totalMaterials);
        stats.setActiveMaterials(activeMaterials);
        stats.setBlockedMaterials(blockedMaterials);
        
        return stats;
    }

    @Override
    public Page<UserResponse> getAllUsers(String role, String search, Pageable pageable, String department) {
        List<User> departmentUsers = userRepository.findByDepartment(department);
        
        if (role != null && !role.isEmpty()) {
            departmentUsers = departmentUsers.stream()
                    .filter(u -> role.equals(u.getRole()))
                    .collect(Collectors.toList());
        }
        
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            departmentUsers = departmentUsers.stream()
                    .filter(u -> (u.getFirstName() != null && u.getFirstName().toLowerCase().contains(searchLower)) ||
                                (u.getLastName() != null && u.getLastName().toLowerCase().contains(searchLower)) ||
                                (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower)) ||
                                (u.getRollNumber() != null && u.getRollNumber().toLowerCase().contains(searchLower)) ||
                                (u.getEmployeeId() != null && u.getEmployeeId().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }
        
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), departmentUsers.size());
        
        if (start >= departmentUsers.size()) {
            return new PageImpl<>(new ArrayList<>(), pageable, departmentUsers.size());
        }
        
        List<User> pagedUsers = departmentUsers.subList(start, end);
        
        List<UserResponse> userResponses = pagedUsers.stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
        
        return new PageImpl<>(userResponses, pageable, departmentUsers.size());
    }

    @Override
    public UserResponse getUserById(String id, String department) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        if (!user.getDepartment().equals(department)) {
            throw new ResourceNotFoundException("User not found in your department");
        }
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse updateUser(String id, Map<String, Object> updates, String department) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        if (!user.getDepartment().equals(department)) {
            throw new ResourceNotFoundException("User not found in your department");
        }
        
        if (updates.containsKey("firstName") && updates.get("firstName") != null) {
            user.setFirstName((String) updates.get("firstName"));
        }
        if (updates.containsKey("lastName") && updates.get("lastName") != null) {
            user.setLastName((String) updates.get("lastName"));
        }
        if (updates.containsKey("email") && updates.get("email") != null) {
            user.setEmail((String) updates.get("email"));
        }
        if (updates.containsKey("role") && updates.get("role") != null) {
            user.setRole((String) updates.get("role"));
        }
        if (updates.containsKey("status") && updates.get("status") != null) {
            user.setStatus((String) updates.get("status"));
        }
        if (updates.containsKey("year") && updates.get("year") != null) {
            user.setYear((Integer) updates.get("year"));
        }
        if (updates.containsKey("semester") && updates.get("semester") != null) {
            user.setSemester((Integer) updates.get("semester"));
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        
        User updated = userRepository.save(user);
        return userMapper.toResponse(updated);
    }

    @Override
    public void deleteUser(String id, String department) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        if (!user.getDepartment().equals(department)) {
            throw new ResourceNotFoundException("User not found in your department");
        }
        userRepository.delete(user);
    }

    @Override
    public UserResponse approveUser(String id, String department) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        if (!user.getDepartment().equals(department)) {
            throw new ResourceNotFoundException("User not found in your department");
        }
        user.setStatus(STATUS_ACTIVE);
        user.setIsActive(true);
        user.setIsApproved(true);
        user.setUpdatedAt(LocalDateTime.now());
        User updated = userRepository.save(user);
        return userMapper.toResponse(updated);
    }

    @Override
    public UserResponse rejectUser(String id, String reason, String department) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        if (!user.getDepartment().equals(department)) {
            throw new ResourceNotFoundException("User not found in your department");
        }
        user.setStatus(STATUS_REJECTED);
        user.setIsActive(false);
        user.setIsApproved(false);
        user.setRejectionReason(reason);
        user.setUpdatedAt(LocalDateTime.now());
        User updated = userRepository.save(user);
        return userMapper.toResponse(updated);
    }

    @Override
    public List<UserResponse> getPendingTeachers(String department) {
        List<User> pendingTeachers = userRepository.findByDepartmentAndRoleAndStatus(
                department, ROLE_TEACHER, STATUS_PENDING);
        return pendingTeachers.stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse approveTeacher(String id, String department) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        if (!user.getDepartment().equals(department)) {
            throw new ResourceNotFoundException("User not found in your department");
        }
        if (!user.getRole().equals(ROLE_TEACHER)) {
            throw new IllegalArgumentException("User is not a teacher");
        }
        user.setStatus(STATUS_ACTIVE);
        user.setIsActive(true);
        user.setIsApproved(true);
        user.setUpdatedAt(LocalDateTime.now());
        User updated = userRepository.save(user);
        return userMapper.toResponse(updated);
    }

    @Override
    public UserResponse rejectTeacher(String id, String reason, String department) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        if (!user.getDepartment().equals(department)) {
            throw new ResourceNotFoundException("User not found in your department");
        }
        if (!user.getRole().equals(ROLE_TEACHER)) {
            throw new IllegalArgumentException("User is not a teacher");
        }
        user.setStatus(STATUS_REJECTED);
        user.setIsActive(false);
        user.setIsApproved(false);
        user.setRejectionReason(reason);
        user.setUpdatedAt(LocalDateTime.now());
        User updated = userRepository.save(user);
        return userMapper.toResponse(updated);
    }

    @Override
    public Page<Map<String, Object>> getAllMaterialsForAdmin(String status, String search, Pageable pageable, String department) {
        List<Material> departmentMaterials = materialRepository.findByDepartment(department);
        
        if (status != null && !status.isEmpty()) {
            departmentMaterials = departmentMaterials.stream()
                    .filter(m -> status.equals(m.getStatus()))
                    .collect(Collectors.toList());
        }
        
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            departmentMaterials = departmentMaterials.stream()
                    .filter(m -> (m.getTitle() != null && m.getTitle().toLowerCase().contains(searchLower)) ||
                                (m.getDescription() != null && m.getDescription().toLowerCase().contains(searchLower)) ||
                                (m.getSubject() != null && m.getSubject().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }
        
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), departmentMaterials.size());
        
        if (start >= departmentMaterials.size()) {
            return new PageImpl<>(new ArrayList<>(), pageable, departmentMaterials.size());
        }
        
        List<Material> pagedMaterials = departmentMaterials.subList(start, end);
        
        List<Map<String, Object>> materialMaps = pagedMaterials.stream()
                .map(m -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", m.getId());
                    map.put("title", m.getTitle());
                    map.put("description", m.getDescription());
                    map.put("subject", m.getSubject());
                    map.put("subjectId", m.getSubjectId());
                    map.put("department", m.getDepartment());
                    map.put("year", m.getYear());
                    map.put("semester", m.getSemester());
                    map.put("type", m.getType());
                    map.put("status", m.getStatus());
                    map.put("fileUrl", m.getFileUrl());
                    map.put("fileName", m.getFileName());
                    map.put("uploadedBy", m.getUploadedBy());
                    map.put("uploadedByName", m.getUploadedByName());
                    map.put("createdAt", m.getCreatedAt());
                    map.put("updatedAt", m.getUpdatedAt());
                    if (m.getBlockedAt() != null) {
                        map.put("blockedAt", m.getBlockedAt());
                    }
                    if (m.getAdminNotes() != null) {
                        map.put("adminNotes", m.getAdminNotes());
                    }
                    return map;
                })
                .collect(Collectors.toList());
        
        return new PageImpl<>(materialMaps, pageable, departmentMaterials.size());
    }

    @Override
    public void blockMaterial(String materialId, String adminId, String reason, String department) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));
        
        if (!material.getDepartment().equals(department)) {
            throw new ResourceNotFoundException("Material not found in your department");
        }
        
        material.setStatus(STATUS_BLOCKED);
        material.setAdminNotes(reason);
        material.setBlockedBy(adminId);
        material.setBlockedAt(LocalDateTime.now());
        material.setUpdatedAt(LocalDateTime.now());
        materialRepository.save(material);
    }

    @Override
    public void unblockMaterial(String materialId, String adminId, String department) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));
        
        if (!material.getDepartment().equals(department)) {
            throw new ResourceNotFoundException("Material not found in your department");
        }
        
        material.setStatus(STATUS_ACTIVE);
        material.setAdminNotes(null);
        material.setBlockedBy(null);
        material.setBlockedAt(null);
        material.setUpdatedAt(LocalDateTime.now());
        materialRepository.save(material);
    }

    @Override
    public Map<String, Object> getPlatformActivity(String department) {
        List<Material> departmentMaterials = materialRepository.findByDepartment(department);
        List<User> departmentUsers = userRepository.findByDepartment(department);
        
        Map<String, Object> activity = new HashMap<>();
        activity.put("totalMaterials", departmentMaterials.size());
        activity.put("totalUsers", departmentUsers.size());
        activity.put("activeMaterials", departmentMaterials.stream()
                .filter(m -> STATUS_ACTIVE.equals(m.getStatus()))
                .count());
        activity.put("blockedMaterials", departmentMaterials.stream()
                .filter(m -> STATUS_BLOCKED.equals(m.getStatus()))
                .count());
        activity.put("students", departmentUsers.stream()
                .filter(u -> ROLE_STUDENT.equals(u.getRole()))
                .count());
        activity.put("teachers", departmentUsers.stream()
                .filter(u -> ROLE_TEACHER.equals(u.getRole()))
                .count());
        activity.put("admins", departmentUsers.stream()
                .filter(u -> ROLE_ADMIN.equals(u.getRole()))
                .count());
        activity.put("pendingTeachers", departmentUsers.stream()
                .filter(u -> ROLE_TEACHER.equals(u.getRole()) && 
                            STATUS_PENDING.equals(u.getStatus()))
                .count());
        
        return activity;
    }

    @Override
    public Page<UserResponse> getUsersByDepartment(String department, Pageable pageable) {
        Page<User> users = userRepository.findByDepartment(department, pageable);
        return users.map(userMapper::toResponse);
    }

    @Override
    public Page<Map<String, Object>> getMaterialsByDepartment(String department, Pageable pageable) {
        Page<Material> materials = materialRepository.findByDepartment(department, pageable);
        return materials.map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("title", m.getTitle());
            map.put("description", m.getDescription());
            map.put("subject", m.getSubject());
            map.put("department", m.getDepartment());
            map.put("year", m.getYear());
            map.put("semester", m.getSemester());
            map.put("type", m.getType());
            map.put("status", m.getStatus());
            map.put("uploadedByName", m.getUploadedByName());
            map.put("createdAt", m.getCreatedAt());
            return map;
        });
    }

    @Override
    public Page<Map<String, Object>> searchMaterialsByDepartment(String department, String keyword, Pageable pageable) {
        List<Material> departmentMaterials = materialRepository.findByDepartment(department);
        
        if (keyword != null && !keyword.isEmpty()) {
            String searchLower = keyword.toLowerCase();
            departmentMaterials = departmentMaterials.stream()
                    .filter(m -> (m.getTitle() != null && m.getTitle().toLowerCase().contains(searchLower)) ||
                                (m.getDescription() != null && m.getDescription().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }
        
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), departmentMaterials.size());
        
        if (start >= departmentMaterials.size()) {
            return new PageImpl<>(new ArrayList<>(), pageable, departmentMaterials.size());
        }
        
        List<Material> pagedMaterials = departmentMaterials.subList(start, end);
        
        List<Map<String, Object>> materialMaps = pagedMaterials.stream()
                .map(m -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", m.getId());
                    map.put("title", m.getTitle());
                    map.put("description", m.getDescription());
                    map.put("subject", m.getSubject());
                    map.put("department", m.getDepartment());
                    map.put("year", m.getYear());
                    map.put("semester", m.getSemester());
                    map.put("type", m.getType());
                    map.put("status", m.getStatus());
                    map.put("uploadedByName", m.getUploadedByName());
                    map.put("createdAt", m.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
        
        return new PageImpl<>(materialMaps, pageable, departmentMaterials.size());
    }

    @Override
    public List<Map<String, Object>> getRecentMaterials(String department, int limit) {
        List<Material> departmentMaterials = materialRepository.findByDepartment(department);
        
        List<Material> recentMaterials = departmentMaterials.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(limit)
                .collect(Collectors.toList());
        
        return recentMaterials.stream()
                .map(m -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", m.getId());
                    map.put("title", m.getTitle());
                    map.put("description", m.getDescription());
                    map.put("subject", m.getSubject());
                    map.put("department", m.getDepartment());
                    map.put("year", m.getYear());
                    map.put("semester", m.getSemester());
                    map.put("type", m.getType());
                    map.put("status", m.getStatus());
                    map.put("uploadedByName", m.getUploadedByName());
                    map.put("createdAt", m.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
    }
}