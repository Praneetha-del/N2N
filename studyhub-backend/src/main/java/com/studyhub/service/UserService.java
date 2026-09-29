package com.studyhub.service;

import com.studyhub.dto.request.ProfileUpdateRequest;
import com.studyhub.dto.response.UserResponse;

public interface UserService {
    
    UserResponse getCurrentUser(String email);
    
    UserResponse getProfile(String email);
    
    UserResponse getUserById(String id);
    
    UserResponse updateProfile(String email, ProfileUpdateRequest request);
    
    boolean changePassword(String email, String oldPassword, String newPassword);
    
    boolean isUserActive(String email);
    
    UserResponse uploadProfilePicture(String email, byte[] imageBytes, String fileName);
}