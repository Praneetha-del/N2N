package com.studyhub.auth.service.impl;

import com.studyhub.auth.entity.User;
import com.studyhub.auth.entity.VerificationCode;
import com.studyhub.auth.repository.UserRepository;
import com.studyhub.auth.repository.VerificationCodeRepository;
import com.studyhub.auth.service.EmailService;
import com.studyhub.auth.service.VerificationService;
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

        emailService.sendVerificationEmail(email, code, user.getFullName());
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
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null && Boolean.TRUE.equals(user.getIsActive());
    }

    private String generateVerificationCode() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }
}
