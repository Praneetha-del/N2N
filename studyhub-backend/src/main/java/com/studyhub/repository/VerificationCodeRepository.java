package com.studyhub.repository;

import com.studyhub.entity.VerificationCode;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends MongoRepository<VerificationCode, String> {
    
    Optional<VerificationCode> findByEmailAndCodeAndUsedFalse(String email, String code);
    
    void deleteByEmail(String email);
}