package com.studyhub.auth.service.impl;

import com.studyhub.auth.dto.request.LoginRequest;
import com.studyhub.auth.dto.request.RegisterRequest;
import com.studyhub.auth.dto.response.AuthResponse;
import com.studyhub.auth.entity.User;
import com.studyhub.auth.repository.UserRepository;
import com.studyhub.auth.service.AuthService;
import com.studyhub.auth.service.VerificationService;
import com.studyhub.common.exception.DuplicateResourceException;
import com.studyhub.common.exception.ResourceNotFoundException;
import com.studyhub.common.exception.UnauthorizedException;
import com.studyhub.common.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_REJECTED = "REJECTED";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private VerificationService verificationService;

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
    public AuthResponse register(RegisterRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        User existingUser = userRepository.findByEmail(cleanEmail).orElse(null);
        if (existingUser != null) {
            if ("DELETED".equalsIgnoreCase(existingUser.getStatus())) {
                userRepository.delete(existingUser);
            } else {
                throw new DuplicateResourceException("Email already registered");
            }
        }

        String rawRole = request.getRole() != null ? request.getRole().trim().toUpperCase() : "STUDENT";
        String normalizedRole = rawRole.startsWith("ROLE_") ? rawRole : "ROLE_" + rawRole;

        if ("ROLE_STUDENT".equals(normalizedRole)) {
            if (request.getRollNumber() == null || request.getRollNumber().trim().isEmpty()) {
                throw new IllegalArgumentException("Roll number is required for students");
            }
            if (userRepository.existsByRollNumber(request.getRollNumber().trim())) {
                throw new DuplicateResourceException("Roll number already registered");
            }
        }

        if ("ROLE_TEACHER".equals(normalizedRole)) {
            if (request.getEmployeeId() == null || request.getEmployeeId().trim().isEmpty()) {
                throw new IllegalArgumentException("Employee ID is required for teachers");
            }
            if (userRepository.existsByEmployeeId(request.getEmployeeId().trim())) {
                throw new DuplicateResourceException("Employee ID already registered");
            }
        }

        if ("ROLE_ADMIN".equals(normalizedRole)) {
            String dept = request.getDepartment();
            if (dept == null || dept.trim().isEmpty()) {
                throw new IllegalArgumentException("Department is required for admin registration");
            }
            if (isDepartmentAdminRegistered(dept.trim())) {
                throw new DuplicateResourceException("An Admin already exists for this department. Admin registration is not allowed.");
            }
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(cleanEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(normalizedRole);
        user.setDepartment(request.getDepartment() != null ? request.getDepartment().trim().toUpperCase() : null);
        user.setRollNumber(request.getRollNumber() != null ? request.getRollNumber().trim() : null);
        user.setEmployeeId(request.getEmployeeId() != null ? request.getEmployeeId().trim() : null);
        user.setBranch(request.getBranch());
        user.setJoiningYear(request.getJoiningYear());
        user.setYear(request.getYear());
        user.setSemester(request.getSemester());

        if ("ROLE_ADMIN".equals(normalizedRole)) {
            user.setStatus(STATUS_ACTIVE);
            user.setIsActive(true);
            user.setIsApproved(true);
        } else {
            user.setStatus(STATUS_PENDING);
            user.setIsActive(false);
            user.setIsApproved(false);
        }

        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User saved;
        try {
            saved = userRepository.save(user);
        } catch (org.springframework.dao.DuplicateKeyException e) {
            if ("ROLE_ADMIN".equals(normalizedRole)) {
                throw new DuplicateResourceException("An Admin already exists for this department. Admin registration is not allowed.");
            }
            throw new DuplicateResourceException("User with these details already exists");
        }

        try {
            verificationService.sendVerificationCode(saved.getEmail());
        } catch (Exception e) {
            System.out.println("Failed to send verification email: " + e.getMessage());
        }

        String token = jwtTokenProvider.generateToken(
                saved.getId(),
                saved.getEmail(),
                saved.getRole(),
                saved.getDepartment(),
                saved.getFullName()
        );

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUser(convertToMap(saved));
        response.setMessage("Registration successful. Please check your email for verification code.");
        response.setSuccess(true);

        return response;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getEmail();
        if (identifier == null || identifier.trim().isEmpty()) {
            identifier = request.getUsername();
        }
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new UnauthorizedException("Username, Roll Number, Employee ID, or Email is required");
        }
        final String searchId = identifier.trim();

        User user = userRepository.findByEmail(searchId)
                .or(() -> userRepository.findByRollNumber(searchId))
                .or(() -> userRepository.findByEmployeeId(searchId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with credentials: " + searchId));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            if (STATUS_PENDING.equals(user.getStatus())) {
                throw new UnauthorizedException("Your account is pending admin approval. Please wait for activation.");
            } else if (STATUS_REJECTED.equals(user.getStatus())) {
                throw new UnauthorizedException("Your account has been rejected. Reason: " +
                        (user.getRejectionReason() != null ? user.getRejectionReason() : "No reason provided"));
            } else {
                throw new UnauthorizedException("Your account is not active. Please contact admin.");
            }
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String token = jwtTokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getDepartment(),
                user.getFullName()
        );

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUser(convertToMap(user));
        response.setMessage("Login successful");
        response.setSuccess(true);

        return response;
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken != null && jwtTokenProvider.validateToken(refreshToken)) {
            String email = jwtTokenProvider.getEmailFromToken(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            String newToken = jwtTokenProvider.generateToken(
                    user.getId(),
                    user.getEmail(),
                    user.getRole(),
                    user.getDepartment(),
                    user.getFullName()
            );

            AuthResponse response = new AuthResponse();
            response.setToken(newToken);
            response.setUser(convertToMap(user));
            response.setMessage("Token refreshed");
            response.setSuccess(true);
            return response;
        }
        throw new UnauthorizedException("Invalid refresh token");
    }

    @Override
    public void logout(String token) {
        // Stateless JWT logout - frontend discards token
    }

    @Override
    public AuthResponse getCurrentUserResponse(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        AuthResponse response = new AuthResponse();
        response.setUser(convertToMap(user));
        response.setMessage("User retrieved successfully");
        response.setSuccess(true);

        return response;
    }

    @Override
    public List<String> getDepartmentsWithAdmin() {
        List<User> admins = userRepository.findByRole("ROLE_ADMIN");
        return admins.stream()
                .filter(u -> !"DELETED".equalsIgnoreCase(u.getStatus()))
                .map(User::getDepartment)
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(String::toUpperCase)
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    public boolean isDepartmentAdminRegistered(String department) {
        if (department == null || department.trim().isEmpty()) {
            return false;
        }
        List<User> admins = userRepository.findByRole("ROLE_ADMIN");
        return admins.stream()
                .filter(u -> !"DELETED".equalsIgnoreCase(u.getStatus()))
                .anyMatch(u -> isSameDepartment(u.getDepartment(), department));
    }

    private Map<String, Object> convertToMap(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("firstName", user.getFirstName());
        userMap.put("lastName", user.getLastName());
        userMap.put("fullName", user.getFullName());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole());
        userMap.put("department", user.getDepartment());
        userMap.put("rollNumber", user.getRollNumber());
        userMap.put("employeeId", user.getEmployeeId());
        userMap.put("branch", user.getBranch());
        userMap.put("joiningYear", user.getJoiningYear());
        userMap.put("year", user.getYear());
        userMap.put("semester", user.getSemester());
        userMap.put("isActive", user.getIsActive());
        userMap.put("isApproved", user.getIsApproved());
        userMap.put("status", user.getStatus());
        userMap.put("profilePicture", user.getProfilePicture());
        return userMap;
    }
}
