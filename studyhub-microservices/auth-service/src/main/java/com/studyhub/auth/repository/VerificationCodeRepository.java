package com.studyhub.auth.repository;

import com.studyhub.auth.entity.VerificationCode;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends MongoRepository<VerificationCode, String> {
    Optional<VerificationCode> findByEmailAndCodeAndUsedFalse(String email, String code);
    Optional<VerificationCode> findTopByEmailOrderByCreatedAtDesc(String email);
    void deleteByEmail(String email);
}
