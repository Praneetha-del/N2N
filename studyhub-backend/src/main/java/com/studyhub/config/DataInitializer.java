package com.studyhub.config;

import com.studyhub.entity.Department;
import com.studyhub.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    public void run(String... args) throws Exception {
        createDepartmentsIfNotExist();
    }

    private void createDepartmentsIfNotExist() {
        if (departmentRepository.count() > 0) {
            System.out.println("✅ Departments already exist. Skipping creation.");
            return;
        }

        System.out.println("📚 Creating default departments...");

        String[][] departments = {
            {"IT", "Information Technology"},
            {"CSE", "Computer Science Engineering"},
            {"ECE", "Electronics and Communication Engineering"},
            {"EEE", "Electrical and Electronics Engineering"},
            {"ME", "Mechanical Engineering"},
            {"CE", "Civil Engineering"}
        };

        Arrays.stream(departments).forEach(dept -> {
            Department department = new Department();
            department.setCode(dept[0]);
            department.setName(dept[1]);
            department.setActive(true);
            department.setCreatedAt(LocalDateTime.now());
            department.setUpdatedAt(LocalDateTime.now());
            departmentRepository.save(department);
            System.out.println("✅ Department created: " + dept[0] + " - " + dept[1]);
        });

        System.out.println("✅ All departments created successfully!");
    }
}