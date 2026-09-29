package com.studyhub.repository;

import com.studyhub.entity.AISummary;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AISummaryRepository extends MongoRepository<AISummary, String> {
    Optional<AISummary> findByMaterialId(String materialId);
    Optional<AISummary> findByMaterialIdAndUserId(String materialId, String userId);
    void deleteByMaterialId(String materialId);
}