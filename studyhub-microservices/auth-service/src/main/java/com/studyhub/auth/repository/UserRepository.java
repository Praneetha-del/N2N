package com.studyhub.auth.repository;

import com.studyhub.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    @Query("{'email': { $regex: '^?0$', $options: 'i' }}")
    Optional<User> findByEmail(String email);

    @Query("{'rollNumber': { $regex: '^?0$', $options: 'i' }}")
    Optional<User> findByRollNumber(String rollNumber);

    @Query("{'employeeId': { $regex: '^?0$', $options: 'i' }}")
    Optional<User> findByEmployeeId(String employeeId);

    @Query("{'email': { $regex: '^?0$', $options: 'i' }}")
    Optional<User> findByEmailIgnoreCase(String email);

    @Query("{'rollNumber': { $regex: '^?0$', $options: 'i' }}")
    Optional<User> findByRollNumberIgnoreCase(String rollNumber);

    @Query("{'employeeId': { $regex: '^?0$', $options: 'i' }}")
    Optional<User> findByEmployeeIdIgnoreCase(String employeeId);

    @Query(value = "{'email': { $regex: '^?0$', $options: 'i' }}", exists = true)
    boolean existsByEmail(String email);

    @Query(value = "{'rollNumber': { $regex: '^?0$', $options: 'i' }}", exists = true)
    boolean existsByRollNumber(String rollNumber);

    @Query(value = "{'employeeId': { $regex: '^?0$', $options: 'i' }}", exists = true)
    boolean existsByEmployeeId(String employeeId);

    List<User> findByRole(String role);
    Page<User> findByRole(String role, Pageable pageable);

    List<User> findByStatus(String status);
    Page<User> findByStatus(String status, Pageable pageable);

    List<User> findByDepartment(String department);
    Page<User> findByDepartment(String department, Pageable pageable);

    List<User> findByRoleAndStatus(String role, String status);
    Page<User> findByRoleAndStatus(String role, String status, Pageable pageable);

    List<User> findByDepartmentAndRoleAndStatus(String department, String role, String status);
    Page<User> findByDepartmentAndRoleAndStatus(String department, String role, String status, Pageable pageable);

    long countByRole(String role);
    long countByStatus(String status);
    long countByRoleAndStatus(String role, String status);
    long countByDepartment(String department);
    long countByDepartmentAndRole(String department, String role);
}
