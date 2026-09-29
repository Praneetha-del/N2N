package com.studyhub.ai.repository;

import com.studyhub.ai.entity.MaterialInfo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialInfoRepository extends MongoRepository<MaterialInfo, String> {
}
