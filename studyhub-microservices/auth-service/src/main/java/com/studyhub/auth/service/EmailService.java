package com.studyhub.auth.service;

public interface EmailService {
    void sendVerificationEmail(String to, String code, String name);
    void sendPasswordResetEmail(String to, String resetToken);
    void sendWelcomeEmail(String to, String name);
    void sendTeacherApprovalEmail(String to, String name);
    void sendTeacherRejectionEmail(String to, String name, String reason);
    void sendAccountApprovalEmail(String to, String name, String role);
    void sendAccountRejectionEmail(String to, String name, String reason);
    void sendEmail(String to, String subject, String body);
}
