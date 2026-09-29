package com.studyhub.material.dto.request;

import jakarta.validation.constraints.NotBlank;

public class SubjectRequest {
    @NotBlank(message = "Subject name is required")
    private String subjectName;
    private String description;
    private String department;
    private boolean active = true;

    public SubjectRequest() {}

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
