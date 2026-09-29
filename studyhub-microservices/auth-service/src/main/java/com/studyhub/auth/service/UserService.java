package com.studyhub.auth.service;

import com.studyhub.auth.dto.request.ProfileUpdateRequest;
import com.studyhub.auth.dto.response.UserResponse;

public interface UserService {
    UserResponse getCurrentUser(String email);
    UserResponse getProfile(String email);
    UserResponse getUserById(String id);
    UserResponse updateProfile(String email, ProfileUpdateRequest request);
    boolean changePassword(String email, String oldPassword, String newPassword);
    boolean isUserActive(String email);
}
