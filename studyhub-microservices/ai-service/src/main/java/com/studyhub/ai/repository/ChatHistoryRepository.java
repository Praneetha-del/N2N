package com.studyhub.ai.repository;

import com.studyhub.ai.entity.ChatHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatHistoryRepository extends MongoRepository<ChatHistory, String> {

    List<ChatHistory> findByUserIdOrderByUpdatedAtDesc(String userId);

    Page<ChatHistory> findByUserId(String userId, Pageable pageable);

    Optional<ChatHistory> findFirstByUserIdOrderByUpdatedAtDesc(String userId);

    Optional<ChatHistory> findByIdAndUserId(String id, String userId);

    void deleteByIdAndUserId(String id, String userId);

    void deleteByUserId(String userId);

    @Query(value = "{ 'userId': ?0 }", delete = true)
    void deleteAllByUserId(String userId);

    long countByUserId(String userId);
}
