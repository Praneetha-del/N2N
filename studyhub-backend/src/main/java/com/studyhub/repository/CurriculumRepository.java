package com.studyhub.repository;

import com.studyhub.entity.Curriculum;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CurriculumRepository extends MongoRepository<Curriculum, String> {
    
    // Find curriculum by department, joining year, academic year, and semester
    @Query("{ '$or': [ { 'department': ?0 }, { 'departmentName': ?0 }, { 'departmentId': ?0 } ], 'joiningYear': ?1, 'academicYear': ?2, 'semester': ?3 }")
    Optional<Curriculum> findByDepartmentAndJoiningYearAndAcademicYearAndSemester(
        String department, Integer joiningYear, String academicYear, Integer semester);
    
    @Query("{ '$or': [ { 'department': ?0 }, { 'departmentName': ?0 }, { 'departmentId': ?0 } ], 'joiningYear': ?1, 'academicYear': ?2, 'semester': ?3, 'active': true }")
    Optional<Curriculum> findActiveCurriculum(
        String department, Integer joiningYear, String academicYear, Integer semester);
    
    // Department-based lookups
    @Query("{ '$or': [ { 'department': ?0 }, { 'departmentName': ?0 }, { 'departmentId': ?0 } ] }")
    List<Curriculum> findByDepartment(String department);
    
    @Query("{ '$or': [ { 'department': ?0 }, { 'departmentName': ?0 }, { 'departmentId': ?0 } ], 'active': true }")
    List<Curriculum> findActiveByDepartment(String department);
    
    List<Curriculum> findByDepartmentId(String departmentId);
    List<Curriculum> findByDepartmentName(String departmentName);
    
    List<Curriculum> findByActiveTrue();
}