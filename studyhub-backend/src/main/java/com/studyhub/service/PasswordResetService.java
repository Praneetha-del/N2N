package com.studyhub.service;

public interface PasswordResetService {
    void createPasswordResetToken(String email);
    void resetPassword(String token, String newPassword);
    boolean validateToken(String token);
}