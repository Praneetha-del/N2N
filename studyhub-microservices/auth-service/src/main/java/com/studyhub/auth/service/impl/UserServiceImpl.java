package com.studyhub.auth.service.impl;

import com.studyhub.auth.dto.request.ProfileUpdateRequest;
import com.studyhub.auth.dto.response.UserResponse;
import com.studyhub.auth.entity.User;
import com.studyhub.auth.mapper.UserMapper;
import com.studyhub.auth.repository.UserRepository;
import com.studyhub.auth.service.UserService;
import com.studyhub.common.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse getProfile(String email) {
        return getCurrentUser(email);
    }

    @Override
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse updateProfile(String email, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getBranch() != null) user.setBranch(request.getBranch());
        if (request.getYear() != null) user.setYear(request.getYear());
        if (request.getSemester() != null) user.setSemester(request.getSemester());
        if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());

        user.setUpdatedAt(LocalDateTime.now());
        User updated = userRepository.save(user);
        return userMapper.toResponse(updated);
    }

    @Override
    public boolean changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return true;
    }

    @Override
    public boolean isUserActive(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null && Boolean.TRUE.equals(user.getIsActive());
    }
}
