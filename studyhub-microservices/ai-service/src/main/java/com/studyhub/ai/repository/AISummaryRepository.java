package com.studyhub.ai.repository;

import com.studyhub.ai.entity.AISummary;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AISummaryRepository extends MongoRepository<AISummary, String> {
    Optional<AISummary> findByMaterialId(String materialId);
    Optional<AISummary> findByMaterialIdAndUserId(String materialId, String userId);
    void deleteByMaterialId(String materialId);
}
