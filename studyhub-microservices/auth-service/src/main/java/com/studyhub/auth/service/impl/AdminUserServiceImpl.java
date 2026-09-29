package com.studyhub.auth.service.impl;

import com.studyhub.auth.dto.response.AdminStatsResponse;
import com.studyhub.auth.dto.response.UserResponse;
import com.studyhub.auth.entity.User;
import com.studyhub.auth.mapper.UserMapper;
import com.studyhub.auth.repository.UserRepository;
import com.studyhub.auth.service.AdminUserService;
import com.studyhub.auth.service.EmailService;
import com.studyhub.common.exception.ForbiddenException;
import com.studyhub.common.exception.ResourceNotFoundException;
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
public class AdminUserServiceImpl implements AdminUserService {

    private static final String ROLE_STUDENT = "ROLE_STUDENT";
    private static final String ROLE_TEACHER = "ROLE_TEACHER";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_REJECTED = "REJECTED";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private EmailService emailService;

    @Override
    public AdminStatsResponse getStats(String department) {
        List<User> departmentUsers = (department != null && !department.isEmpty()) 
                ? userRepository.findByDepartment(department) 
                : userRepository.findAll();

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
                .filter(u -> ROLE_TEACHER.equals(u.getRole()) && STATUS_PENDING.equals(u.getStatus()))
                .count();

        AdminStatsResponse stats = new AdminStatsResponse();
        stats.setTotalUsers(totalUsers);
        stats.setTotalStudents(totalStudents);
        stats.setTotalTeachers(totalTeachers);
        stats.setTotalAdmins(totalAdmins);
        stats.setPendingTeachers(pendingTeachers);

        return stats;
    }

    @Override
    public Page<UserResponse> getAllUsers(String role, String search, Pageable pageable, String department) {
        List<User> departmentUsers = (department != null && !department.isEmpty())
                ? userRepository.findByDepartment(department)
                : userRepository.findAll();

        if (role != null && !role.isEmpty()) {
            final String normalizedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
            departmentUsers = departmentUsers.stream()
                    .filter(u -> normalizedRole.equalsIgnoreCase(u.getRole()))
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
        List<UserResponse> pageContent = (start <= end)
                ? departmentUsers.subList(start, end).stream().map(userMapper::toResponse).collect(Collectors.toList())
                : Collections.emptyList();

        return new PageImpl<>(pageContent, pageable, departmentUsers.size());
    }

    @Override
    public UserResponse getUserById(String userId, String department) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (department != null && !department.isEmpty() && !department.equals(user.getDepartment())) {
            throw new ForbiddenException("You can only access users from your department");
        }

        return userMapper.toResponse(user);
    }

    private boolean isSameDepartment(String d1, String d2) {
        if (d1 == null || d2 == null) return false;
        String s1 = d1.trim().toLowerCase();
        String s2 = d2.trim().toLowerCase();
        if (s1.equals(s2)) return true;

        if ((s1.equals("it") || s1.contains("information technology")) && (s2.equals("it") || s2.contains("information technology"))) return true;
        if ((s1.equals("cse") || s1.contains("computer science")) && (s2.equals("cse") || s2.contains("computer science"))) return true;
        if ((s1.equals("ece") || s1.contains("electronics")) && (s2.equals("ece") || s2.contains("electronics"))) return true;
        if ((s1.equals("eee") || s1.contains("electrical")) && (s2.equals("eee") || s2.contains("electrical"))) return true;
        if ((s1.equals("me") || s1.contains("mechanical")) && (s2.equals("me") || s2.contains("mechanical"))) return true;
        if ((s1.equals("ce") || s1.contains("civil")) && (s2.equals("ce") || s2.contains("civil"))) return true;

        return false;
    }

    @Override
    public UserResponse updateUser(String userId, Map<String, Object> updates, String department) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (department != null && !department.isEmpty() && !isSameDepartment(department, user.getDepartment())) {
            throw new ForbiddenException("You can only update users from your department");
        }

        if (updates.containsKey("firstName")) user.setFirstName((String) updates.get("firstName"));
        if (updates.containsKey("lastName")) user.setLastName((String) updates.get("lastName"));
        if (updates.containsKey("department")) user.setDepartment((String) updates.get("department"));
        if (updates.containsKey("branch")) user.setBranch((String) updates.get("branch"));
        if (updates.containsKey("year") && updates.get("year") != null) user.setYear(Integer.valueOf(updates.get("year").toString()));
        if (updates.containsKey("semester") && updates.get("semester") != null) user.setSemester(Integer.valueOf(updates.get("semester").toString()));

        user.setUpdatedAt(LocalDateTime.now());
        User updated = userRepository.save(user);
        return userMapper.toResponse(updated);
    }

    @Override
    public void deleteUser(String userId, String department) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (department != null && !department.isEmpty() && !isSameDepartment(department, user.getDepartment())) {
            throw new ForbiddenException("You can only delete users from your department");
        }

        userRepository.delete(user);
    }

    @Override
    public UserResponse approveUser(String userId, String adminId, String department) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (department != null && !department.isEmpty() && !isSameDepartment(department, user.getDepartment())) {
            throw new ForbiddenException("You can only approve users from your department");
        }

        user.setIsActive(true);
        user.setIsApproved(true);
        user.setStatus(STATUS_ACTIVE);
        user.setApprovedBy(adminId);
        user.setApprovedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);

        try {
            emailService.sendAccountApprovalEmail(saved.getEmail(), saved.getFullName(), saved.getRole());
        } catch (Exception e) {
            System.err.println("Email send failed: " + e.getMessage());
        }

        return userMapper.toResponse(saved);
    }

    @Override
    public UserResponse rejectUser(String userId, String reason, String department) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (department != null && !department.isEmpty() && !department.equals(user.getDepartment())) {
            throw new ForbiddenException("You can only reject users from your department");
        }

        user.setIsActive(false);
        user.setIsApproved(false);
        user.setStatus(STATUS_REJECTED);
        user.setRejectionReason(reason);
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);

        try {
            emailService.sendAccountRejectionEmail(saved.getEmail(), saved.getFullName(), reason);
        } catch (Exception e) {
            System.err.println("Email send failed: " + e.getMessage());
        }

        return userMapper.toResponse(saved);
    }

    @Override
    public List<UserResponse> getPendingTeachers(String department) {
        List<User> users = (department != null && !department.isEmpty())
                ? userRepository.findByDepartmentAndRoleAndStatus(department, ROLE_TEACHER, STATUS_PENDING)
                : userRepository.findByRoleAndStatus(ROLE_TEACHER, STATUS_PENDING);

        return users.stream().map(userMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public UserResponse approveTeacher(String userId, String adminId, String department) {
        return approveUser(userId, adminId, department);
    }

    @Override
    public UserResponse rejectTeacher(String userId, String reason, String department) {
        return rejectUser(userId, reason, department);
    }

    @Override
    public Map<String, Object> getPlatformActivity(String department) {
        Map<String, Object> activity = new HashMap<>();
        List<User> recentUsers = (department != null && !department.isEmpty())
                ? userRepository.findByDepartment(department)
                : userRepository.findAll();

        activity.put("recentUsersCount", recentUsers.size());
        activity.put("activeUsersCount", recentUsers.stream().filter(u -> Boolean.TRUE.equals(u.getIsActive())).count());
        return activity;
    }
}
