package com.studyhub.dto.response;

import java.time.LocalDateTime;

public class MaterialResponse {
    
    private String id;
    private String title;
    private String description;
    private String subject;
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean hasSummary;

    public MaterialResponse() {}

    public static class Builder {
        private MaterialResponse response = new MaterialResponse();

        public Builder id(String id) {
            response.id = id;
            return this;
        }

        public Builder title(String title) {
            response.title = title;
            return this;
        }

        public Builder description(String description) {
            response.description = description;
            return this;
        }

        public Builder subject(String subject) {
            response.subject = subject;
            return this;
        }

        public Builder year(Integer year) {
            response.year = year;
            return this;
        }

        public Builder semester(Integer semester) {
            response.semester = semester;
            return this;
        }

        public Builder type(String type) {
            response.type = type;
            return this;
        }

        public Builder fileUrl(String fileUrl) {
            response.fileUrl = fileUrl;
            return this;
        }

        public Builder fileName(String fileName) {
            response.fileName = fileName;
            return this;
        }

        public Builder fileSize(Long fileSize) {
            response.fileSize = fileSize;
            return this;
        }

        public Builder youTubeUrl(String youTubeUrl) {
            response.youTubeUrl = youTubeUrl;
            return this;
        }

        public Builder videoTitle(String videoTitle) {
            response.videoTitle = videoTitle;
            return this;
        }

        public Builder uploadedBy(String uploadedBy) {
            response.uploadedBy = uploadedBy;
            return this;
        }

        public Builder uploadedByName(String uploadedByName) {
            response.uploadedByName = uploadedByName;
            return this;
        }

        public Builder uploadedByEmail(String uploadedByEmail) {
            response.uploadedByEmail = uploadedByEmail;
            return this;
        }

        public Builder status(String status) {
            response.status = status;
            return this;
        }

        public Builder adminNotes(String adminNotes) {
            response.adminNotes = adminNotes;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            response.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            response.updatedAt = updatedAt;
            return this;
        }

        public Builder hasSummary(boolean hasSummary) {
            response.hasSummary = hasSummary;
            return this;
        }

        public MaterialResponse build() {
            return response;
        }
    }

    public static Builder builder() {
        return new Builder();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getYouTubeUrl() {
        return youTubeUrl;
    }

    public void setYouTubeUrl(String youTubeUrl) {
        this.youTubeUrl = youTubeUrl;
    }

    public String getVideoTitle() {
        return videoTitle;
    }

    public void setVideoTitle(String videoTitle) {
        this.videoTitle = videoTitle;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public String getUploadedByName() {
        return uploadedByName;
    }

    public void setUploadedByName(String uploadedByName) {
        this.uploadedByName = uploadedByName;
    }

    public String getUploadedByEmail() {
        return uploadedByEmail;
    }

    public void setUploadedByEmail(String uploadedByEmail) {
        this.uploadedByEmail = uploadedByEmail;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isHasSummary() {
        return hasSummary;
    }

    public void setHasSummary(boolean hasSummary) {
        this.hasSummary = hasSummary;
    }
}