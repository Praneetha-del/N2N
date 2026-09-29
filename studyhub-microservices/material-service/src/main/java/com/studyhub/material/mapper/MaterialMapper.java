package com.studyhub.material.mapper;

import com.studyhub.material.dto.response.MaterialResponse;
import com.studyhub.material.entity.Material;
import org.springframework.stereotype.Component;

@Component
public class MaterialMapper {

    public MaterialResponse toResponse(Material material) {
        if (material == null) {
            return null;
        }

        return MaterialResponse.builder()
                .id(material.getId())
                .title(material.getTitle())
                .description(material.getDescription())
                .subject(material.getSubject())
                .subjectId(material.getSubjectId())
                .subjectName(material.getSubjectName())
                .department(material.getDepartment())
                .joiningYear(material.getJoiningYear())
                .academicYear(material.getAcademicYear())
                .year(material.getYear())
                .semester(material.getSemester())
                .type(material.getType())
                .fileUrl(material.getFileUrl())
                .fileName(material.getFileName())
                .fileSize(material.getFileSize())
                .youTubeUrl(material.getYouTubeUrl())
                .videoTitle(material.getVideoTitle())
                .uploadedBy(material.getUploadedBy())
                .uploadedByName(material.getUploadedByName())
                .uploadedByEmail(material.getUploadedByEmail())
                .status(material.getStatus())
                .adminNotes(material.getAdminNotes())
                .viewCount(material.getViewCount())
                .downloadCount(material.getDownloadCount())
                .createdAt(material.getCreatedAt())
                .updatedAt(material.getUpdatedAt())
                .hasSummary(false)
                .build();
    }
}
