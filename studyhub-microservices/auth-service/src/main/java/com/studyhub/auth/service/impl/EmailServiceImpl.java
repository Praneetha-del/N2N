package com.studyhub.auth.service.impl;

import com.studyhub.auth.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String frontendUrl;

    public EmailServiceImpl(
            JavaMailSender mailSender,
            @Value("${spring.mail.username:pranithamavuri379@gmail.com}") String fromEmail,
            @Value("${frontend.url:http://localhost:5173}") String frontendUrl) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void sendVerificationEmail(String to, String code, String name) {
        System.out.println("=========================================");
        System.out.println("📧 VERIFICATION CODE FOR: " + to);
        System.out.println("🔐 YOUR OTP: " + code);
        System.out.println("⏰ Expires in: 5 minutes");
        System.out.println("=========================================");

        try {
            String subject = "StudyHub - Email Verification Code";
            String body = "Hello " + name + ",\n\n" +
                    "Thank you for registering with StudyHub!\n\n" +
                    "Your verification code is: " + code + "\n\n" +
                    "This code will expire in 5 minutes.\n\n" +
                    "Best regards,\nStudyHub Team";
            sendEmail(to, subject, body);
        } catch (Exception e) {
            System.err.println("❌ Email send failed: " + e.getMessage());
            System.out.println("📱 Fallback OTP from console: " + code);
        }
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetToken) {
        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;
            String subject = "StudyHub - Password Reset";
            String body = "Hello,\n\n" +
                    "Click the link to reset your password:\n" +
                    resetUrl + "\n\n" +
                    "This link will expire in 1 hour.\n\n" +
                    "Best regards,\nStudyHub Team";
            sendEmail(to, subject, body);
        } catch (Exception e) {
            System.err.println("❌ Password reset email failed: " + e.getMessage());
        }
    }

    @Override
    public void sendWelcomeEmail(String to, String name) {
        try {
            String subject = "Welcome to StudyHub!";
            String body = "Hello " + name + ",\n\n" +
                    "Welcome to StudyHub!\n\n" +
                    "Best regards,\nStudyHub Team";
            sendEmail(to, subject, body);
        } catch (Exception e) {
            System.err.println("❌ Welcome email failed: " + e.getMessage());
        }
    }

    @Override
    public void sendTeacherApprovalEmail(String to, String name) {
        sendAccountApprovalEmail(to, name, "TEACHER");
    }

    @Override
    public void sendTeacherRejectionEmail(String to, String name, String reason) {
        sendAccountRejectionEmail(to, name, reason);
    }

    @Override
    public void sendAccountApprovalEmail(String to, String name, String role) {
        try {
            String subject = "StudyHub - Account Approved";
            String roleDisplay = role.replace("ROLE_", "");
            String body = "Dear " + name + ",\n\n" +
                    "Your " + roleDisplay + " account has been approved by the admin.\n\n" +
                    "You can now login at: " + frontendUrl + "\n\n" +
                    "Best regards,\nStudyHub Team";
            sendEmail(to, subject, body);
        } catch (Exception e) {
            System.err.println("❌ Account approval email failed: " + e.getMessage());
        }
    }

    @Override
    public void sendAccountRejectionEmail(String to, String name, String reason) {
        try {
            String subject = "StudyHub - Account Rejected";
            String body = "Dear " + name + ",\n\n" +
                    "Your account request has been rejected.\n\n" +
                    "Reason: " + reason + "\n\n" +
                    "If you have any questions, please contact the admin.\n\n" +
                    "Best regards,\nStudyHub Team";
            sendEmail(to, subject, body);
        } catch (Exception e) {
            System.err.println("❌ Account rejection email failed: " + e.getMessage());
        }
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }
}
