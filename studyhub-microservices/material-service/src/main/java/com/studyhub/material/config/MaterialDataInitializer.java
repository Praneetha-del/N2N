package com.studyhub.material.config;

import com.studyhub.material.entity.Department;
import com.studyhub.material.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class MaterialDataInitializer implements CommandLineRunner {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    public void run(String... args) {
        if (departmentRepository.count() == 0) {
            System.out.println("📚 Creating default departments in material-service...");

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
            });

            System.out.println("✅ All default departments created!");
        }
    }
}
