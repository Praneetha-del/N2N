package com.studyhub.mapper;

import com.studyhub.dto.response.MaterialResponse;
import com.studyhub.entity.Material;
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
                .createdAt(material.getCreatedAt())
                .updatedAt(material.getUpdatedAt())
                .hasSummary(false)
                .build();
    }
}