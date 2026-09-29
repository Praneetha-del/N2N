package com.studyhub.material.repository;

import com.studyhub.material.entity.Department;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends MongoRepository<Department, String> {
    Optional<Department> findByCode(String code);
    Optional<Department> findByName(String name);
    List<Department> findByActiveTrue();
    boolean existsByCode(String code);
}
