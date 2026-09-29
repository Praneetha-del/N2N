package com.studyhub.serviceImpl;

import com.studyhub.entity.User;
import com.studyhub.entity.VerificationCode;
import com.studyhub.repository.UserRepository;
import com.studyhub.repository.VerificationCodeRepository;
import com.studyhub.service.EmailService;
import com.studyhub.service.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@Transactional
public class VerificationServiceImpl implements VerificationService {

    @Autowired
    private VerificationCodeRepository verificationCodeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private static final int CODE_EXPIRY_MINUTES = 10;

    @Override
    public void sendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        String code = generateVerificationCode();

        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setEmail(email);
        verificationCode.setCode(code);
        verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(CODE_EXPIRY_MINUTES));
        verificationCode.setUsed(false);
        verificationCode.setCreatedAt(LocalDateTime.now());
        
        verificationCodeRepository.save(verificationCode);

        String subject = "StudyHub - Email Verification";
        String body = String.format(
            "Hello %s,\n\n" +
            "Thank you for registering with StudyHub!\n\n" +
            "Your verification code is: %s\n\n" +
            "This code will expire in %d minutes.\n\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "Regards,\nStudyHub Team",
            user.getFullName(),
            code,
            CODE_EXPIRY_MINUTES
        );

        emailService.sendEmail(email, subject, body);
    }

    @Override
    public boolean verifyCode(String email, String code) {
        VerificationCode verificationCode = verificationCodeRepository
                .findByEmailAndCodeAndUsedFalse(email, code)
                .orElse(null);

        if (verificationCode == null) {
            return false;
        }

        if (verificationCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }

        verificationCode.setUsed(true);
        verificationCode.setVerifiedAt(LocalDateTime.now());
        verificationCodeRepository.save(verificationCode);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(true);
        user.setIsApproved(true);
        user.setStatus("ACTIVE");
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return true;
    }

    @Override
    public void resendVerificationCode(String email) {
        verificationCodeRepository.deleteByEmail(email);
        sendVerificationCode(email);
    }

    @Override
    public boolean isEmailVerified(String email) {
        User user = userRepository.findByEmail(email)
                .orElse(null);
        return user != null && user.getIsActive() != null && user.getIsActive();
    }

    private String generateVerificationCode() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }
}