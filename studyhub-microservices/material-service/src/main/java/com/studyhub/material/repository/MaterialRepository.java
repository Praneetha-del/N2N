package com.studyhub.material.repository;

import com.studyhub.material.entity.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends MongoRepository<Material, String> {

    List<Material> findByDepartment(String department);
    Page<Material> findByDepartment(String department, Pageable pageable);

    Page<Material> findByUploadedByOrderByCreatedAtDesc(String uploadedBy, Pageable pageable);
    Page<Material> findByUploadedByAndDepartment(String uploadedBy, String department, Pageable pageable);

    long countByStatus(String status);
    List<Material> findByStatus(String status);
    Page<Material> findByStatus(String status, Pageable pageable);

    @Query("{ 'department': ?0, 'subject': ?1, 'year': ?2, 'semester': ?3, 'type': ?4 }")
    Page<Material> findByDepartmentAndFilters(
        String department, String subject, Integer year, Integer semester, String type, Pageable pageable);

    @Query("{ 'status': ?0, 'department': ?1, 'year': ?2, 'semester': ?3, 'subject': ?4, 'type': ?5 }")
    Page<Material> findByStatusAndFilters(
        String status, String department, Integer year, Integer semester, String subject, String type, Pageable pageable);

    @Query("{ 'department': ?0, 'year': ?1, 'semester': ?2, 'subject': ?3, 'type': ?4, 'status': ?5 }")
    Page<Material> findByFilters(
        String department, Integer year, Integer semester, String subject, String type, String status, Pageable pageable);

    @Query("{ $text: { $search: ?0 }, 'status': ?1 }")
    Page<Material> searchMaterials(String keyword, String status, Pageable pageable);

    @Query("{ 'department': ?0, $or: [ { 'title': { $regex: ?1, $options: 'i' } }, { 'description': { $regex: ?1, $options: 'i' } }, { 'subject': { $regex: ?1, $options: 'i' } } ] }")
    Page<Material> searchByDepartmentAndKeyword(String department, String keyword, Pageable pageable);

    @Query("{ 'department': ?1, 'year': ?2, 'semester': ?3, $or: [ { 'title': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } }, { 'subject': { $regex: ?0, $options: 'i' } } ] }")
    Page<Material> searchByDepartmentAndFilters(String query, String department, Integer year, Integer semester, Pageable pageable);

    List<Material> findByDepartmentAndYearAndSemester(String department, Integer year, Integer semester);
    List<Material> findByDepartmentAndStatus(String department, String status);
}
