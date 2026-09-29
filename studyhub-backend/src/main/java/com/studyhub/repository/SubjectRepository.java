package com.studyhub.repository;

import com.studyhub.entity.Subject;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends MongoRepository<Subject, String> {
    
    List<Subject> findByDepartment(String department);
    
    List<Subject> findByDepartmentAndActiveTrue(String department);
    
    List<Subject> findByIdInAndDepartment(List<String> ids, String department);
    
    List<Subject> findByIdIn(List<String> ids);
    
    List<Subject> findByActiveTrue();
    
    boolean existsBySubjectName(String subjectName);
}