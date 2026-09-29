package com.studyhub.service;

public interface EmailService {
    
    void sendPasswordResetEmail(String to, String resetToken);
    
    void sendVerificationEmail(String to, String code, String name);
    
    void sendWelcomeEmail(String to, String name);
    
    void sendMaterialUploadConfirmation(String to, String materialTitle);
    
    void sendTeacherApprovalEmail(String to, String name);
    
    void sendTeacherRejectionEmail(String to, String name, String reason);
    
    // ✅ NEW: Account Approval/Rejection for all roles
    void sendAccountApprovalEmail(String to, String name, String role);
    
    void sendAccountRejectionEmail(String to, String name, String reason);
    
    void sendEmail(String to, String subject, String body);
}