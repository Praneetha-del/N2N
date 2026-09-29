package com.studyhub.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    
    String uploadFile(MultipartFile file, String folder);
    
    String uploadProfilePicture(byte[] imageBytes, String fileName);
    
    String getPublicIdFromUrl(String url);
    
    void deleteFile(String publicId);
}