package com.studyhub.material.dto.response;

import java.time.LocalDateTime;

public class MaterialResponse {

    private String id;
    private String title;
    private String description;
    private String subject;
    private String subjectId;
    private String subjectName;
    private String department;
    private Integer joiningYear;
    private String academicYear;
    private Integer year;
    private Integer semester;
    private String type;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String youTubeUrl;
    private String videoTitle;
    private String uploadedBy;
    private String uploadedByName;
    private String uploadedByEmail;
    private String status;
    private String adminNotes;
    private int viewCount;
    private int downloadCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean hasSummary;

    public MaterialResponse() {}

    public Integer getJoiningYear() { return joiningYear; }
    public void setJoiningYear(Integer joiningYear) { this.joiningYear = joiningYear; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getSubjectName() { return subjectName != null ? subjectName : subject; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final MaterialResponse r = new MaterialResponse();

        public Builder id(String id) { r.id = id; return this; }
        public Builder title(String title) { r.title = title; return this; }
        public Builder description(String description) { r.description = description; return this; }
        public Builder subject(String subject) { r.subject = subject; return this; }
        public Builder subjectId(String subjectId) { r.subjectId = subjectId; return this; }
        public Builder subjectName(String subjectName) { r.subjectName = subjectName; return this; }
        public Builder department(String department) { r.department = department; return this; }
        public Builder joiningYear(Integer joiningYear) { r.joiningYear = joiningYear; return this; }
        public Builder academicYear(String academicYear) { r.academicYear = academicYear; return this; }
        public Builder year(Integer year) { r.year = year; return this; }
        public Builder semester(Integer semester) { r.semester = semester; return this; }
        public Builder type(String type) { r.type = type; return this; }
        public Builder fileUrl(String fileUrl) { r.fileUrl = fileUrl; return this; }
        public Builder fileName(String fileName) { r.fileName = fileName; return this; }
        public Builder fileSize(Long fileSize) { r.fileSize = fileSize; return this; }
        public Builder youTubeUrl(String youTubeUrl) { r.youTubeUrl = youTubeUrl; return this; }
        public Builder videoTitle(String videoTitle) { r.videoTitle = videoTitle; return this; }
        public Builder uploadedBy(String uploadedBy) { r.uploadedBy = uploadedBy; return this; }
        public Builder uploadedByName(String uploadedByName) { r.uploadedByName = uploadedByName; return this; }
        public Builder uploadedByEmail(String uploadedByEmail) { r.uploadedByEmail = uploadedByEmail; return this; }
        public Builder status(String status) { r.status = status; return this; }
        public Builder adminNotes(String adminNotes) { r.adminNotes = adminNotes; return this; }
        public Builder viewCount(int viewCount) { r.viewCount = viewCount; return this; }
        public Builder downloadCount(int downloadCount) { r.downloadCount = downloadCount; return this; }
        public Builder createdAt(LocalDateTime createdAt) { r.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { r.updatedAt = updatedAt; return this; }
        public Builder hasSummary(boolean hasSummary) { r.hasSummary = hasSummary; return this; }

        public MaterialResponse build() {
            return r;
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getYouTubeUrl() { return youTubeUrl; }
    public void setYouTubeUrl(String youTubeUrl) { this.youTubeUrl = youTubeUrl; }

    public String getVideoTitle() { return videoTitle; }
    public void setVideoTitle(String videoTitle) { this.videoTitle = videoTitle; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }

    public String getUploadedByEmail() { return uploadedByEmail; }
    public void setUploadedByEmail(String uploadedByEmail) { this.uploadedByEmail = uploadedByEmail; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public int getViewCount() { return viewCount; }
    public void setViewCount(int viewCount) { this.viewCount = viewCount; }

    public int getDownloadCount() { return downloadCount; }
    public void setDownloadCount(int downloadCount) { this.downloadCount = downloadCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isHasSummary() { return hasSummary; }
    public void setHasSummary(boolean hasSummary) { this.hasSummary = hasSummary; }
}
