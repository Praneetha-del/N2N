package com.studyhub.controller;

import com.studyhub.dto.request.CurriculumRequest;
import com.studyhub.dto.request.SubjectRequest;
import com.studyhub.dto.response.ApiResponse;
import com.studyhub.entity.*;
import com.studyhub.repository.*;
import com.studyhub.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class CurriculumController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private CurriculumRepository curriculumRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // Helper to get user department from token
    private String getUserDepartment(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token == null || token.isEmpty()) {
            return null;
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null ? user.getDepartment() : null;
    }

    // Helper to get admin user ID from token
    private String getAdminId(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return admin.getId();
    }

    private String formatAcademicYear(Object val) {
        if (val == null) return "";
        String str = val.toString().trim();
        if (str.equals("1")) return "1st Year";
        if (str.equals("2")) return "2nd Year";
        if (str.equals("3")) return "3rd Year";
        if (str.equals("4")) return "4th Year";
        return str;
    }

    // ==================== DEPARTMENTS ====================

    @PostMapping("/admin/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createDepartment(@Valid @RequestBody Department department) {
        if (departmentRepository.existsByCode(department.getCode())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Department code already exists", "/admin/departments"));
        }
        department.setCreatedAt(LocalDateTime.now());
        department.setUpdatedAt(LocalDateTime.now());
        Department saved = departmentRepository.save(department);
        return ResponseEntity.ok(ApiResponse.success("Department created", saved, "/admin/departments"));
    }

    @GetMapping("/admin/departments")
    public ResponseEntity<ApiResponse> getDepartments(@RequestParam(required = false) Boolean active) {
        List<Department> departments = active != null && active ? departmentRepository.findByActiveTrue() : departmentRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Departments retrieved", departments, "/admin/departments"));
    }

    @GetMapping("/departments/public")
    public ResponseEntity<ApiResponse> getPublicDepartments() {
        List<Department> departments = departmentRepository.findByActiveTrue();
        return ResponseEntity.ok(ApiResponse.success("Public departments retrieved", departments, "/departments/public"));
    }

    // ==================== SUBJECTS ====================

    @PostMapping("/admin/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createSubject(
            @Valid @RequestBody SubjectRequest request,
            @RequestHeader("Authorization") String token) {
        
        String adminDepartment = getUserDepartment(token);
        String departmentToUse = request.getDepartment() != null && !request.getDepartment().isEmpty() 
                ? request.getDepartment() 
                : adminDepartment;
        
        Subject subject = new Subject();
        subject.setSubjectName(request.getSubjectName());
        subject.setDescription(request.getDescription());
        subject.setDepartment(departmentToUse);
        subject.setActive(request.isActive());
        subject.setCreatedAt(LocalDateTime.now());
        subject.setUpdatedAt(LocalDateTime.now());
        
        Subject saved = subjectRepository.save(subject);
        return ResponseEntity.ok(ApiResponse.success("Subject created for " + departmentToUse, saved, "/admin/subjects"));
    }

    @GetMapping("/admin/subjects")
    public ResponseEntity<ApiResponse> getSubjects(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Boolean active,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String userDepartment = token != null ? getUserDepartment(token) : null;
        String targetDepartment = department != null && !department.isEmpty() ? department : userDepartment;
        
        List<Subject> subjects;
        if (targetDepartment != null && !targetDepartment.isEmpty()) {
            if (active != null && active) {
                subjects = subjectRepository.findByDepartmentAndActiveTrue(targetDepartment);
            } else {
                subjects = subjectRepository.findByDepartment(targetDepartment);
            }
        } else {
            subjects = active != null && active ? subjectRepository.findByActiveTrue() : subjectRepository.findAll();
        }
        
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved", subjects, "/admin/subjects"));
    }

    @GetMapping("/curriculum/subjects")
    public ResponseEntity<ApiResponse> getSubjectsByCurriculum(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String departmentName,
            @RequestParam(required = false) String departmentId,
            @RequestParam Integer joiningYear,
            @RequestParam String academicYear,
            @RequestParam Integer semester,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String userDepartment = token != null ? getUserDepartment(token) : null;
        String targetDepartment = department != null && !department.isEmpty() 
                ? department 
                : (departmentName != null && !departmentName.isEmpty() 
                    ? departmentName 
                    : (departmentId != null && !departmentId.isEmpty() ? departmentId : userDepartment));
        
        if (targetDepartment == null || targetDepartment.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Department is required", "/curriculum/subjects"));
        }

        String formattedYear = formatAcademicYear(academicYear);
        
        // Find curriculum for this Department + Joining Year + Academic Year + Semester
        Curriculum curriculum = curriculumRepository.findActiveCurriculum(
            targetDepartment, joiningYear, formattedYear, semester
        ).orElse(null);

        // Also check if academicYear was passed as raw number (e.g. "4" vs "4th Year")
        if (curriculum == null && !academicYear.equals(formattedYear)) {
            curriculum = curriculumRepository.findActiveCurriculum(
                targetDepartment, joiningYear, academicYear, semester
            ).orElse(null);
        }
        
        if (curriculum == null) {
            return ResponseEntity.ok(ApiResponse.success("No curriculum found for this combination", new ArrayList<>(), "/curriculum/subjects"));
        }
        
        List<Subject> subjects = new ArrayList<>();
        if (curriculum.getSubjectIds() != null && !curriculum.getSubjectIds().isEmpty()) {
            subjects = subjectRepository.findByIdInAndDepartment(curriculum.getSubjectIds(), targetDepartment);
            if (subjects.isEmpty()) {
                subjects = subjectRepository.findAllById(curriculum.getSubjectIds());
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved", subjects, "/curriculum/subjects"));
    }

    // ==================== CURRICULUM ====================

    @PostMapping("/admin/curriculum")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createCurriculum(
            @Valid @RequestBody CurriculumRequest request,
            @RequestHeader("Authorization") String token) {
        
        String adminDepartment = getUserDepartment(token);
        String targetDepartment = request.getDepartment() != null && !request.getDepartment().isEmpty() 
                ? request.getDepartment() 
                : adminDepartment;
        
        if (targetDepartment == null || targetDepartment.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Department not found for admin", "/admin/curriculum"));
        }

        String formattedYear = formatAcademicYear(request.getAcademicYear());

        // Check if curriculum exists for THIS Department + Joining Year + Academic Year + Semester
        Curriculum existing = curriculumRepository.findByDepartmentAndJoiningYearAndAcademicYearAndSemester(
            targetDepartment, 
            request.getJoiningYear(), 
            formattedYear, 
            request.getSemester()
        ).orElse(null);

        if (existing == null && !formattedYear.equals(request.getAcademicYear())) {
            existing = curriculumRepository.findByDepartmentAndJoiningYearAndAcademicYearAndSemester(
                targetDepartment, 
                request.getJoiningYear(), 
                request.getAcademicYear(), 
                request.getSemester()
            ).orElse(null);
        }
        
        if (existing != null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                "Curriculum already exists for " + targetDepartment + " department with Joining Year: " + 
                request.getJoiningYear() + ", Academic Year: " + formattedYear + ", Semester: " + request.getSemester(), 
                "/admin/curriculum"
            ));
        }

        // Get subjects
        List<Subject> subjects = new ArrayList<>();
        List<String> subjectNames = new ArrayList<>();
        if (request.getSubjectIds() != null && !request.getSubjectIds().isEmpty()) {
            subjects = subjectRepository.findByIdInAndDepartment(request.getSubjectIds(), targetDepartment);
            if (subjects.isEmpty()) {
                subjects = subjectRepository.findAllById(request.getSubjectIds());
            }
            subjectNames = subjects.stream().map(Subject::getSubjectName).collect(Collectors.toList());
        }

        Curriculum curriculum = new Curriculum();
        curriculum.setJoiningYear(request.getJoiningYear());
        curriculum.setDepartment(targetDepartment);
        curriculum.setDepartmentName(targetDepartment);
        curriculum.setDepartmentId(request.getDepartmentId() != null ? request.getDepartmentId() : targetDepartment);
        curriculum.setAcademicYear(formattedYear);
        curriculum.setSemester(request.getSemester());
        curriculum.setSubjectIds(request.getSubjectIds());
        curriculum.setSubjectNames(subjectNames);
        curriculum.setActive(request.isActive());
        curriculum.setCreatedAt(LocalDateTime.now());
        curriculum.setUpdatedAt(LocalDateTime.now());

        Curriculum saved = curriculumRepository.save(curriculum);
        return ResponseEntity.ok(ApiResponse.success("Curriculum created successfully for " + targetDepartment, saved, "/admin/curriculum"));
    }

    @GetMapping("/admin/curriculum")
    public ResponseEntity<ApiResponse> getCurriculums(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String department,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        String userDepartment = token != null ? getUserDepartment(token) : null;
        String targetDepartment = department != null && !department.isEmpty() ? department : userDepartment;
        
        List<Curriculum> curriculums;
        if (targetDepartment != null && !targetDepartment.isEmpty()) {
            if (active != null && active) {
                curriculums = curriculumRepository.findActiveByDepartment(targetDepartment);
            } else {
                curriculums = curriculumRepository.findByDepartment(targetDepartment);
            }
        } else {
            curriculums = active != null && active ? curriculumRepository.findByActiveTrue() : curriculumRepository.findAll();
        }
        
        return ResponseEntity.ok(ApiResponse.success("Curriculums retrieved", curriculums, "/admin/curriculum"));
    }

    @GetMapping("/curriculum/public")
    public ResponseEntity<ApiResponse> getPublicCurriculums(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String departmentName,
            @RequestParam(required = false) String departmentId) {
        
        String targetDepartment = department != null && !department.isEmpty() 
                ? department 
                : (departmentName != null && !departmentName.isEmpty() ? departmentName : departmentId);
        
        List<Curriculum> curriculums;
        if (targetDepartment != null && !targetDepartment.isEmpty()) {
            curriculums = curriculumRepository.findActiveByDepartment(targetDepartment);
        } else {
            curriculums = curriculumRepository.findByActiveTrue();
        }
        
        return ResponseEntity.ok(ApiResponse.success("Public curriculums retrieved", curriculums, "/curriculum/public"));
    }

    @GetMapping("/curriculum/filter")
    public ResponseEntity<ApiResponse> getFilteredCurriculums(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String departmentName,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) Integer joiningYear,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) Integer semester) {
        
        String targetDepartment = department != null && !department.isEmpty() 
                ? department 
                : (departmentName != null && !departmentName.isEmpty() ? departmentName : departmentId);
        
        List<Curriculum> curriculums;
        if (targetDepartment != null && !targetDepartment.isEmpty()) {
            curriculums = curriculumRepository.findActiveByDepartment(targetDepartment);
        } else {
            curriculums = curriculumRepository.findByActiveTrue();
        }

        if (joiningYear != null) {
            curriculums = curriculums.stream().filter(c -> joiningYear.equals(c.getJoiningYear())).collect(Collectors.toList());
        }
        if (academicYear != null && !academicYear.isEmpty()) {
            String formatted = formatAcademicYear(academicYear);
            curriculums = curriculums.stream().filter(c -> formatted.equalsIgnoreCase(c.getAcademicYear()) || academicYear.equalsIgnoreCase(c.getAcademicYear())).collect(Collectors.toList());
        }
        if (semester != null) {
            curriculums = curriculums.stream().filter(c -> semester.equals(c.getSemester())).collect(Collectors.toList());
        }
        
        return ResponseEntity.ok(ApiResponse.success("Filtered curriculums retrieved", curriculums, "/curriculum/filter"));
    }

    @PutMapping("/admin/curriculum/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateCurriculum(
            @PathVariable String id,
            @RequestBody CurriculumRequest request,
            @RequestHeader("Authorization") String token) {
        
        String adminDepartment = getUserDepartment(token);
        
        Curriculum existing = curriculumRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        String targetDepartment = existing.getDepartment() != null ? existing.getDepartment() : adminDepartment;

        String formattedYear = formatAcademicYear(request.getAcademicYear());

        // Check for duplicate with updated values
        Curriculum duplicate = curriculumRepository.findByDepartmentAndJoiningYearAndAcademicYearAndSemester(
            targetDepartment,
            request.getJoiningYear(), 
            formattedYear, 
            request.getSemester()
        ).orElse(null);
        
        if (duplicate != null && !duplicate.getId().equals(id)) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                "Curriculum already exists for this department with this combination", 
                "/admin/curriculum/" + id
            ));
        }

        List<Subject> subjects = new ArrayList<>();
        List<String> subjectNames = new ArrayList<>();
        if (request.getSubjectIds() != null && !request.getSubjectIds().isEmpty()) {
            subjects = subjectRepository.findByIdInAndDepartment(request.getSubjectIds(), targetDepartment);
            if (subjects.isEmpty()) {
                subjects = subjectRepository.findAllById(request.getSubjectIds());
            }
            subjectNames = subjects.stream().map(Subject::getSubjectName).collect(Collectors.toList());
        }

        existing.setJoiningYear(request.getJoiningYear());
        existing.setAcademicYear(formattedYear);
        existing.setSemester(request.getSemester());
        existing.setSubjectIds(request.getSubjectIds());
        existing.setSubjectNames(subjectNames);
        existing.setActive(request.isActive());
        existing.setUpdatedAt(LocalDateTime.now());

        curriculumRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success("Curriculum updated", existing, "/admin/curriculum/" + id));
    }

    @DeleteMapping("/admin/curriculum/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteCurriculum(
            @PathVariable String id,
            @RequestHeader("Authorization") String token) {
        
        Curriculum existing = curriculumRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        curriculumRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Curriculum deleted", null, "/admin/curriculum/" + id));
    }
}