package com.studyhub.material.repository;

import com.studyhub.material.entity.Curriculum;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CurriculumRepository extends MongoRepository<Curriculum, String> {

    @Query("{ '$or': [ { 'department': { '$regex': '^?0$', '$options': 'i' } }, { 'departmentName': { '$regex': '^?0$', '$options': 'i' } }, { 'departmentId': { '$regex': '^?0$', '$options': 'i' } } ], 'joiningYear': ?1, 'academicYear': ?2, 'semester': ?3 }")
    Optional<Curriculum> findByDepartmentAndJoiningYearAndAcademicYearAndSemester(
        String department, Integer joiningYear, String academicYear, Integer semester);

    @Query("{ '$or': [ { 'department': { '$regex': '^?0$', '$options': 'i' } }, { 'departmentName': { '$regex': '^?0$', '$options': 'i' } }, { 'departmentId': { '$regex': '^?0$', '$options': 'i' } } ], 'joiningYear': ?1, 'academicYear': ?2, 'semester': ?3, 'active': true }")
    Optional<Curriculum> findActiveCurriculum(
        String department, Integer joiningYear, String academicYear, Integer semester);

    @Query("{ '$or': [ { 'department': { '$regex': '^?0$', '$options': 'i' } }, { 'departmentName': { '$regex': '^?0$', '$options': 'i' } }, { 'departmentId': { '$regex': '^?0$', '$options': 'i' } } ] }")
    List<Curriculum> findByDepartment(String department);

    @Query("{ '$or': [ { 'department': { '$regex': '^?0$', '$options': 'i' } }, { 'departmentName': { '$regex': '^?0$', '$options': 'i' } }, { 'departmentId': { '$regex': '^?0$', '$options': 'i' } } ], 'active': true }")
    List<Curriculum> findActiveByDepartment(String department);

    List<Curriculum> findByDepartmentId(String departmentId);
    List<Curriculum> findByDepartmentName(String departmentName);

    List<Curriculum> findByActiveTrue();
}
