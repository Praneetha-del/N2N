package com.studyhub.material.dto.request;

public class MaterialRequest {

    private String title;
    private String description;
    private String subject;
    private String subjectName;
    private String subjectId;
    private String department;
    private String departmentName;
    private String departmentId;
    private Integer year;
    private String academicYear;
    private Integer joiningYear;
    private Integer semester;
    private String type;
    private String youTubeUrl;
    private String videoTitle;

    public MaterialRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSubject() { 
        return subject != null && !subject.isEmpty() ? subject : subjectName; 
    }
    public void setSubject(String subject) { this.subject = subject; }

    public String getSubjectName() { 
        return subjectName != null && !subjectName.isEmpty() ? subjectName : subject; 
    }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getDepartment() { 
        return department != null && !department.isEmpty() ? department : departmentName; 
    }
    public void setDepartment(String department) { this.department = department; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public Integer getYear() {
        if (year != null) return year;
        if (academicYear != null && !academicYear.isEmpty()) {
            String digits = academicYear.replaceAll("[^0-9]", "");
            if (!digits.isEmpty()) {
                try { return Integer.parseInt(digits); } catch (Exception ignored) {}
            }
        }
        return null;
    }
    public void setYear(Integer year) { this.year = year; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Integer getJoiningYear() { return joiningYear; }
    public void setJoiningYear(Integer joiningYear) { this.joiningYear = joiningYear; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getYouTubeUrl() { return youTubeUrl; }
    public void setYouTubeUrl(String youTubeUrl) { this.youTubeUrl = youTubeUrl; }

    public String getVideoTitle() { return videoTitle; }
    public void setVideoTitle(String videoTitle) { this.videoTitle = videoTitle; }
}
