package com.studyhub.service;

public interface VerificationService {
    
    void sendVerificationCode(String email);
    
    boolean verifyCode(String email, String code);
    
    void resendVerificationCode(String email);
    
    boolean isEmailVerified(String email);
}