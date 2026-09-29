package com.studyhub.material.controller;

import com.studyhub.common.dto.ApiResponse;
import com.studyhub.common.security.JwtTokenProvider;
import com.studyhub.material.dto.request.CurriculumRequest;
import com.studyhub.material.dto.request.SubjectRequest;
import com.studyhub.material.entity.Curriculum;
import com.studyhub.material.entity.Department;
import com.studyhub.material.entity.Subject;
import com.studyhub.material.repository.CurriculumRepository;
import com.studyhub.material.repository.DepartmentRepository;
import com.studyhub.material.repository.SubjectRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
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
    private JwtTokenProvider jwtTokenProvider;

    private String getUserDepartment(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token == null || token.isEmpty()) {
            return null;
        }
        return jwtTokenProvider.getDepartmentFromToken(token);
    }

    private String formatAcademicYear(Object val) {
        if (val == null) return "";
        String str = val.toString().trim();
        if (str.equals("1") || str.equalsIgnoreCase("1st Year")) return "1st Year";
        if (str.equals("2") || str.equalsIgnoreCase("2nd Year")) return "2nd Year";
        if (str.equals("3") || str.equalsIgnoreCase("3rd Year")) return "3rd Year";
        if (str.equals("4") || str.equalsIgnoreCase("4th Year")) return "4th Year";
        return str;
    }

    private boolean matchAcademicYear(Object currYear, Object searchYear) {
        if (currYear == null || searchYear == null) return false;
        String s1 = currYear.toString().trim();
        String s2 = searchYear.toString().trim();
        if (s1.equalsIgnoreCase(s2)) return true;

        String d1 = s1.replaceAll("[^0-9]", "");
        String d2 = s2.replaceAll("[^0-9]", "");
        if (!d1.isEmpty() && d1.equals(d2)) return true;

        String f1 = formatAcademicYear(s1);
        String f2 = formatAcademicYear(s2);
        return f1.equalsIgnoreCase(f2);
    }

    private Set<String> getDepartmentAliases(String input) {
        Set<String> aliases = new HashSet<>();
        if (input == null || input.trim().isEmpty()) {
            return aliases;
        }
        String clean = input.trim();
        aliases.add(clean);
        aliases.add(clean.toLowerCase());

        try {
            List<Department> allDepts = departmentRepository.findAll();
            for (Department dept : allDepts) {
                boolean match = false;
                if (dept.getId() != null && dept.getId().equalsIgnoreCase(clean)) match = true;
                if (dept.getCode() != null && dept.getCode().equalsIgnoreCase(clean)) match = true;
                if (dept.getName() != null && dept.getName().equalsIgnoreCase(clean)) match = true;
                if (dept.getName() != null && clean.toLowerCase().contains(dept.getName().toLowerCase())) match = true;
                if (dept.getCode() != null && clean.toLowerCase().contains(dept.getCode().toLowerCase())) match = true;

                if (match) {
                    if (dept.getId() != null) aliases.add(dept.getId());
                    if (dept.getCode() != null) {
                        aliases.add(dept.getCode());
                        aliases.add(dept.getCode().toLowerCase());
                    }
                    if (dept.getName() != null) {
                        aliases.add(dept.getName());
                        aliases.add(dept.getName().toLowerCase());
                    }
                }
            }
        } catch (Exception ignored) {}

        String lower = clean.toLowerCase();
        if (lower.equals("it") || lower.contains("information technology")) {
            aliases.add("IT");
            aliases.add("it");
            aliases.add("Information Technology");
            aliases.add("information technology");
        }
        if (lower.equals("cse") || lower.contains("computer science")) {
            aliases.add("CSE");
            aliases.add("cse");
            aliases.add("Computer Science Engineering");
            aliases.add("computer science engineering");
            aliases.add("Computer Science and Engineering");
        }
        if (lower.equals("ece") || lower.contains("electronics")) {
            aliases.add("ECE");
            aliases.add("ece");
            aliases.add("Electronics and Communication Engineering");
        }
        if (lower.equals("eee") || lower.contains("electrical")) {
            aliases.add("EEE");
            aliases.add("eee");
            aliases.add("Electrical and Electronics Engineering");
        }
        if (lower.equals("me") || lower.contains("mechanical")) {
            aliases.add("ME");
            aliases.add("me");
            aliases.add("Mechanical Engineering");
        }
        if (lower.equals("ce") || lower.contains("civil")) {
            aliases.add("CE");
            aliases.add("ce");
            aliases.add("Civil Engineering");
        }

        return aliases;
    }

    // ==================== DEPARTMENTS ====================

    @PostMapping("/admin/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createDepartment(@Valid @RequestBody Department department) {
        if (departmentRepository.existsByCode(department.getCode())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Department code already exists", "/api/admin/departments"));
        }
        department.setCreatedAt(LocalDateTime.now());
        department.setUpdatedAt(LocalDateTime.now());
        Department saved = departmentRepository.save(department);
        return ResponseEntity.ok(ApiResponse.success("Department created", saved, "/api/admin/departments"));
    }

    @GetMapping("/admin/departments")
    public ResponseEntity<ApiResponse> getDepartments(@RequestParam(required = false) Boolean active) {
        List<Department> departments = active != null && active ? departmentRepository.findByActiveTrue() : departmentRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Departments retrieved", departments, "/api/admin/departments"));
    }

    @GetMapping("/departments/public")
    public ResponseEntity<ApiResponse> getPublicDepartments() {
        List<Department> departments = departmentRepository.findByActiveTrue();
        return ResponseEntity.ok(ApiResponse.success("Public departments retrieved", departments, "/api/departments/public"));
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
        return ResponseEntity.ok(ApiResponse.success("Subject created for " + departmentToUse, saved, "/api/admin/subjects"));
    }

    @GetMapping("/admin/subjects")
    public ResponseEntity<ApiResponse> getSubjects(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Boolean active,
            @RequestHeader(value = "Authorization", required = false) String token) {

        String userDepartment = token != null ? getUserDepartment(token) : null;
        String targetDepartment = department != null && !department.isEmpty() ? department : userDepartment;

        List<Subject> subjects = active != null && active ? subjectRepository.findByActiveTrue() : subjectRepository.findAll();

        if (targetDepartment != null && !targetDepartment.isEmpty()) {
            Set<String> deptAliases = getDepartmentAliases(targetDepartment);
            Set<String> lowerAliases = deptAliases.stream().map(String::toLowerCase).collect(Collectors.toSet());
            subjects = subjects.stream()
                    .filter(s -> s.getDepartment() == null || lowerAliases.contains(s.getDepartment().toLowerCase()))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved", subjects, "/api/admin/subjects"));
    }

    @GetMapping("/curriculum/subjects")
    public ResponseEntity<ApiResponse> getSubjectsByCurriculum(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String departmentName,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) Integer joiningYear,
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
            targetDepartment = "IT";
        }

        Set<String> deptAliases = new HashSet<>();
        if (department != null && !department.isEmpty()) deptAliases.addAll(getDepartmentAliases(department));
        if (departmentName != null && !departmentName.isEmpty()) deptAliases.addAll(getDepartmentAliases(departmentName));
        if (departmentId != null && !departmentId.isEmpty()) deptAliases.addAll(getDepartmentAliases(departmentId));
        if (targetDepartment != null && !targetDepartment.isEmpty()) deptAliases.addAll(getDepartmentAliases(targetDepartment));

        Set<String> lowerAliases = deptAliases.stream().map(String::toLowerCase).collect(Collectors.toSet());

        List<Curriculum> allCurriculums = curriculumRepository.findAll();
        Curriculum matchedCurriculum = allCurriculums.stream()
                .filter(c -> c.isActive())
                .filter(c -> joiningYear == null || joiningYear.equals(c.getJoiningYear()))
                .filter(c -> semester == null || semester.equals(c.getSemester()))
                .filter(c -> matchAcademicYear(c.getAcademicYear(), academicYear))
                .filter(c -> {
                    if (lowerAliases.isEmpty()) return true;
                    return (c.getDepartment() != null && lowerAliases.contains(c.getDepartment().toLowerCase()))
                            || (c.getDepartmentName() != null && lowerAliases.contains(c.getDepartmentName().toLowerCase()))
                            || (c.getDepartmentId() != null && (deptAliases.contains(c.getDepartmentId()) || lowerAliases.contains(c.getDepartmentId().toLowerCase())))
                            || (c.getDepartment() == null && c.getDepartmentName() == null);
                })
                .findFirst()
                .orElse(null);

        List<Subject> resultSubjects = new ArrayList<>();
        Set<String> addedNames = new HashSet<>();

        if (matchedCurriculum != null) {
            if (matchedCurriculum.getSubjectIds() != null && !matchedCurriculum.getSubjectIds().isEmpty()) {
                List<Subject> fromDb = subjectRepository.findAllById(matchedCurriculum.getSubjectIds());
                for (Subject s : fromDb) {
                    resultSubjects.add(s);
                    if (s.getSubjectName() != null) addedNames.add(s.getSubjectName().toLowerCase().trim());
                }
            }
            if (matchedCurriculum.getSubjectNames() != null) {
                int idx = 0;
                for (String name : matchedCurriculum.getSubjectNames()) {
                    if (name != null && !name.trim().isEmpty() && !addedNames.contains(name.toLowerCase().trim())) {
                        String synthId = (matchedCurriculum.getSubjectIds() != null && idx < matchedCurriculum.getSubjectIds().size())
                                ? matchedCurriculum.getSubjectIds().get(idx)
                                : "sub-" + idx + "-" + Math.abs(name.hashCode());
                        resultSubjects.add(new Subject(synthId, name.trim(), targetDepartment));
                        addedNames.add(name.toLowerCase().trim());
                    }
                    idx++;
                }
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved", resultSubjects, "/api/curriculum/subjects"));
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
            return ResponseEntity.badRequest().body(ApiResponse.error("Department not found for admin", "/api/admin/curriculum"));
        }

        String formattedYear = formatAcademicYear(request.getAcademicYear());

        Set<String> deptAliases = getDepartmentAliases(targetDepartment);
        Set<String> lowerAliases = deptAliases.stream().map(String::toLowerCase).collect(Collectors.toSet());

        List<Curriculum> allCurrs = curriculumRepository.findAll();
        boolean exists = allCurrs.stream().anyMatch(c ->
            c.getJoiningYear() != null && c.getJoiningYear().equals(request.getJoiningYear()) &&
            c.getSemester() != null && c.getSemester().equals(request.getSemester()) &&
            matchAcademicYear(c.getAcademicYear(), request.getAcademicYear()) &&
            ((c.getDepartment() != null && lowerAliases.contains(c.getDepartment().toLowerCase())) ||
             (c.getDepartmentName() != null && lowerAliases.contains(c.getDepartmentName().toLowerCase())) ||
             (c.getDepartmentId() != null && deptAliases.contains(c.getDepartmentId())))
        );

        if (exists) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                "Curriculum already exists for " + targetDepartment + " department with Joining Year: " +
                request.getJoiningYear() + ", Academic Year: " + formattedYear + ", Semester: " + request.getSemester(),
                "/api/admin/curriculum"
            ));
        }

        List<Subject> subjects = new ArrayList<>();
        List<String> subjectNames = request.getSubjectNames() != null ? new ArrayList<>(request.getSubjectNames()) : new ArrayList<>();
        if (request.getSubjectIds() != null && !request.getSubjectIds().isEmpty()) {
            subjects = subjectRepository.findAllById(request.getSubjectIds());
            if (subjectNames.isEmpty()) {
                subjectNames = subjects.stream().map(Subject::getSubjectName).collect(Collectors.toList());
            }
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
        return ResponseEntity.ok(ApiResponse.success("Curriculum created successfully for " + targetDepartment, saved, "/api/admin/curriculum"));
    }

    @GetMapping("/admin/curriculum")
    public ResponseEntity<ApiResponse> getCurriculums(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer joiningYear,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) Integer semester,
            @RequestHeader(value = "Authorization", required = false) String token) {

        String userDepartment = token != null ? getUserDepartment(token) : null;
        String targetDepartment = department != null && !department.isEmpty() ? department : userDepartment;

        List<Curriculum> curriculums = active != null && active ? curriculumRepository.findByActiveTrue() : curriculumRepository.findAll();

        if (targetDepartment != null && !targetDepartment.isEmpty()) {
            Set<String> deptAliases = getDepartmentAliases(targetDepartment);
            Set<String> lowerAliases = deptAliases.stream().map(String::toLowerCase).collect(Collectors.toSet());
            curriculums = curriculums.stream()
                    .filter(c -> (c.getDepartment() != null && lowerAliases.contains(c.getDepartment().toLowerCase()))
                              || (c.getDepartmentName() != null && lowerAliases.contains(c.getDepartmentName().toLowerCase()))
                              || (c.getDepartmentId() != null && (deptAliases.contains(c.getDepartmentId()) || lowerAliases.contains(c.getDepartmentId().toLowerCase())))
                              || (c.getDepartment() == null && c.getDepartmentName() == null))
                    .collect(Collectors.toList());
        }

        if (joiningYear != null) {
            curriculums = curriculums.stream().filter(c -> joiningYear.equals(c.getJoiningYear())).collect(Collectors.toList());
        }
        if (academicYear != null && !academicYear.isEmpty()) {
            curriculums = curriculums.stream().filter(c -> matchAcademicYear(c.getAcademicYear(), academicYear)).collect(Collectors.toList());
        }
        if (semester != null) {
            curriculums = curriculums.stream().filter(c -> semester.equals(c.getSemester())).collect(Collectors.toList());
        }

        return ResponseEntity.ok(ApiResponse.success("Curriculums retrieved", curriculums, "/api/admin/curriculum"));
    }

    @GetMapping("/curriculum/public")
    public ResponseEntity<ApiResponse> getPublicCurriculums(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String departmentName,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) Integer joiningYear,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) Integer semester) {

        String targetDepartment = department != null && !department.isEmpty()
                ? department
                : (departmentName != null && !departmentName.isEmpty() ? departmentName : departmentId);

        List<Curriculum> curriculums = curriculumRepository.findByActiveTrue();

        if (targetDepartment != null && !targetDepartment.isEmpty()) {
            Set<String> deptAliases = getDepartmentAliases(targetDepartment);
            Set<String> lowerAliases = deptAliases.stream().map(String::toLowerCase).collect(Collectors.toSet());
            curriculums = curriculums.stream()
                    .filter(c -> (c.getDepartment() != null && lowerAliases.contains(c.getDepartment().toLowerCase()))
                              || (c.getDepartmentName() != null && lowerAliases.contains(c.getDepartmentName().toLowerCase()))
                              || (c.getDepartmentId() != null && (deptAliases.contains(c.getDepartmentId()) || lowerAliases.contains(c.getDepartmentId().toLowerCase()))))
                    .collect(Collectors.toList());
        }

        if (joiningYear != null) {
            curriculums = curriculums.stream().filter(c -> joiningYear.equals(c.getJoiningYear())).collect(Collectors.toList());
        }
        if (academicYear != null && !academicYear.isEmpty()) {
            curriculums = curriculums.stream().filter(c -> matchAcademicYear(c.getAcademicYear(), academicYear)).collect(Collectors.toList());
        }
        if (semester != null) {
            curriculums = curriculums.stream().filter(c -> semester.equals(c.getSemester())).collect(Collectors.toList());
        }

        return ResponseEntity.ok(ApiResponse.success("Public curriculums retrieved", curriculums, "/api/curriculum/public"));
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

        List<Curriculum> curriculums = curriculumRepository.findByActiveTrue();

        if (targetDepartment != null && !targetDepartment.isEmpty()) {
            Set<String> deptAliases = getDepartmentAliases(targetDepartment);
            Set<String> lowerAliases = deptAliases.stream().map(String::toLowerCase).collect(Collectors.toSet());
            curriculums = curriculums.stream()
                    .filter(c -> (c.getDepartment() != null && lowerAliases.contains(c.getDepartment().toLowerCase()))
                              || (c.getDepartmentName() != null && lowerAliases.contains(c.getDepartmentName().toLowerCase()))
                              || (c.getDepartmentId() != null && (deptAliases.contains(c.getDepartmentId()) || lowerAliases.contains(c.getDepartmentId().toLowerCase()))))
                    .collect(Collectors.toList());
        }

        if (joiningYear != null) {
            curriculums = curriculums.stream().filter(c -> joiningYear.equals(c.getJoiningYear())).collect(Collectors.toList());
        }
        if (academicYear != null && !academicYear.isEmpty()) {
            curriculums = curriculums.stream().filter(c -> matchAcademicYear(c.getAcademicYear(), academicYear)).collect(Collectors.toList());
        }
        if (semester != null) {
            curriculums = curriculums.stream().filter(c -> semester.equals(c.getSemester())).collect(Collectors.toList());
        }

        return ResponseEntity.ok(ApiResponse.success("Filtered curriculums retrieved", curriculums, "/api/curriculum/filter"));
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

        String targetDepartment = request.getDepartment() != null && !request.getDepartment().isEmpty()
                ? request.getDepartment()
                : (existing.getDepartment() != null && !existing.getDepartment().isEmpty()
                    ? existing.getDepartment()
                    : (adminDepartment != null ? adminDepartment : "IT"));
        String formattedYear = formatAcademicYear(request.getAcademicYear());

        List<Subject> subjects = new ArrayList<>();
        List<String> subjectNames = request.getSubjectNames() != null ? new ArrayList<>(request.getSubjectNames()) : new ArrayList<>();
        if (request.getSubjectIds() != null && !request.getSubjectIds().isEmpty()) {
            subjects = subjectRepository.findAllById(request.getSubjectIds());
            if (subjectNames.isEmpty()) {
                subjectNames = subjects.stream().map(Subject::getSubjectName).collect(Collectors.toList());
            }
        }

        existing.setDepartment(targetDepartment);
        existing.setDepartmentName(targetDepartment);
        if (request.getDepartmentId() != null && !request.getDepartmentId().isEmpty()) {
            existing.setDepartmentId(request.getDepartmentId());
        }
        existing.setJoiningYear(request.getJoiningYear());
        existing.setAcademicYear(formattedYear);
        existing.setSemester(request.getSemester());
        existing.setSubjectIds(request.getSubjectIds());
        existing.setSubjectNames(subjectNames);
        existing.setActive(request.isActive());
        existing.setUpdatedAt(LocalDateTime.now());

        curriculumRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success("Curriculum updated", existing, "/api/admin/curriculum/" + id));
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
        return ResponseEntity.ok(ApiResponse.success("Curriculum deleted", null, "/api/admin/curriculum/" + id));
    }
}
