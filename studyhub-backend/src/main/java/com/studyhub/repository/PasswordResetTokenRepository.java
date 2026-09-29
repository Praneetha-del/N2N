package com.studyhub.repository;

import com.studyhub.entity.PasswordResetToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    
    /**
     * Find a password reset token by its token string
     * @param token The token string
     * @return Optional containing the token if found
     */
    Optional<PasswordResetToken> findByToken(String token);
    
    /**
     * Find a valid (not used and not expired) token by email
     * @param email The user's email
     * @param now Current date time
     * @return Optional containing the token if found
     */
    @Query("{ 'email': ?0, 'used': false, 'expiryDate': { $gt: ?1 } }")
    Optional<PasswordResetToken> findValidTokenByEmail(String email, LocalDateTime now);
    
    /**
     * Delete all tokens for a specific email
     * @param email The user's email
     */
    void deleteByEmail(String email);
    
    /**
     * Delete all expired tokens
     * @param date The date before which tokens should be deleted
     * @return Number of tokens deleted
     */
    long deleteByExpiryDateBefore(LocalDateTime date);
    
    /**
     * Check if a valid token exists for an email
     * @param email The user's email
     * @param now Current date time
     * @return true if a valid token exists
     */
    @Query("{ 'email': ?0, 'used': false, 'expiryDate': { $gt: ?1 } }")
    boolean existsByEmailAndUsedFalseAndExpiryDateAfter(String email, LocalDateTime now);
    
    /**
     * Find token by email
     * @param email The user's email
     * @return Optional containing the token if found
     */
    Optional<PasswordResetToken> findByEmail(String email);
}