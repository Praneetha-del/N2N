package com.studyhub.repository;

import com.studyhub.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByRollNumber(String rollNumber);
    
    Optional<User> findByEmployeeId(String employeeId);
    
    boolean existsByEmail(String email);
    
    boolean existsByRollNumber(String rollNumber);
    
    boolean existsByEmployeeId(String employeeId);
    
    // Role-based queries
    List<User> findByRole(String role);
    Page<User> findByRole(String role, Pageable pageable);
    
    // Status-based queries
    List<User> findByStatus(String status);
    Page<User> findByStatus(String status, Pageable pageable);
    
    // Department-based queries
    List<User> findByDepartment(String department);
    Page<User> findByDepartment(String department, Pageable pageable);
    
    // Role + Status
    List<User> findByRoleAndStatus(String role, String status);
    Page<User> findByRoleAndStatus(String role, String status, Pageable pageable);
    
    // Department + Role + Status
    List<User> findByDepartmentAndRoleAndStatus(String department, String role, String status);
    Page<User> findByDepartmentAndRoleAndStatus(String department, String role, String status, Pageable pageable);
    
    // Counts
    long countByRole(String role);
    long countByStatus(String status);
    long countByRoleAndStatus(String role, String status);
    long countByDepartment(String department);
    long countByDepartmentAndRole(String department, String role);
}