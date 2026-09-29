package com.studyhub.material.validator;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Component
public class FileValidator {

    @Value("${file.upload.allowed-types:application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document}")
    private String allowedTypesString;

    @Value("${file.upload.max-size:52428800}")
    private long maxFileSize;

    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum limit of " + (maxFileSize / 1024 / 1024) + "MB");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("File content type is null");
        }

        List<String> allowedTypes = Arrays.asList(allowedTypesString.split(","));
        if (!allowedTypes.contains(contentType)) {
            // Check extension as fallback
            String fileName = file.getOriginalFilename();
            if (fileName == null || !isValidExtension(getFileExtension(fileName))) {
                throw new IllegalArgumentException("File type not allowed. Allowed types: pdf, ppt, pptx, doc, docx");
            }
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) return "";
        int lastDotIndex = fileName.lastIndexOf(".");
        if (lastDotIndex == -1) return "";
        return fileName.substring(lastDotIndex + 1).toLowerCase();
    }

    private boolean isValidExtension(String extension) {
        List<String> allowedExtensions = Arrays.asList("pdf", "ppt", "pptx", "doc", "docx");
        return allowedExtensions.contains(extension);
    }
}
