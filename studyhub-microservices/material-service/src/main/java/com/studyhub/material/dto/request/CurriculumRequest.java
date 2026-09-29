package com.studyhub.material.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class CurriculumRequest {
    @NotNull(message = "Joining year is required")
    private Integer joiningYear;
    private String department;
    private String departmentId;

    @NotNull(message = "Academic year is required")
    private String academicYear;

    @NotNull(message = "Semester is required")
    private Integer semester;

    private List<String> subjectIds;
    private List<String> subjectNames;
    private boolean active = true;

    public CurriculumRequest() {}

    public Integer getJoiningYear() { return joiningYear; }
    public void setJoiningYear(Integer joiningYear) { this.joiningYear = joiningYear; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public List<String> getSubjectIds() { return subjectIds; }
    public void setSubjectIds(List<String> subjectIds) { this.subjectIds = subjectIds; }

    public List<String> getSubjectNames() { return subjectNames; }
    public void setSubjectNames(List<String> subjectNames) { this.subjectNames = subjectNames; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
